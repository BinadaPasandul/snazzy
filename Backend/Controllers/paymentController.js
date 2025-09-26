const Stripe = require('stripe');
const PaymentMethod = require('../Models/PaymentMethod');
const Payment = require('../Models/Payment');
const Register = require('../Models/UserModel');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Add a card
exports.addCard = async (req, res) => {
  const { paymentMethodId } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'User not authenticated' });
  if (!paymentMethodId) return res.status(400).json({ message: 'paymentMethodId required' });

  try {
    const user = await Register.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.gmail, name: user.name });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethodId } });

    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

    const existing = await PaymentMethod.findOne({ stripePaymentMethodId: paymentMethodId });
    if (existing) return res.status(400).json({ message: 'Card already added' });

    const newCard = new PaymentMethod({
      userId,
      stripeCustomerId: customerId,
      stripePaymentMethodId: paymentMethodId,
      cardBrand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
    });

    await newCard.save();
    res.status(200).json({ message: 'Card added', paymentMethod: newCard });

  } catch (err) {
    console.error('Stripe/AddCard error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};


// Get all cards
exports.getCards = async (req, res) => {
  const userId = req.user.id;
  try {
    const cards = await PaymentMethod.find({ userId });
    res.status(200).json({ paymentMethods: cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single card
exports.getCard = async (req, res) => {
  const userId = req.user.id;
  const { cardId } = req.params;
  try {
    const card = await PaymentMethod.findOne({ _id: cardId, userId });
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.status(200).json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update card
exports.updateCard = async (req, res) => {
  const userId = req.user.id;
  const { cardId } = req.params;
  const { paymentMethodId } = req.body;

  if (!paymentMethodId) return res.status(400).json({ message: 'paymentMethodId required' });

  try {
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    const updated = await PaymentMethod.findOneAndUpdate(
      { _id: cardId, userId },
      { 
        stripePaymentMethodId: paymentMethodId, 
        cardBrand: pm.card.brand, 
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Card not found' });
    res.status(200).json({ message: 'Card updated', paymentMethod: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete card
exports.deleteCard = async (req, res) => {
  const userId = req.user.id;
  const { cardId } = req.params;

  // Validate cardId format
  if (!cardId || cardId.length !== 24) {
    return res.status(400).json({ message: 'Invalid card ID format' });
  }

  try {
    // Find the card
    const card = await PaymentMethod.findOne({ _id: cardId, userId });
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Detach card from Stripe
    try {
      await stripe.paymentMethods.detach(card.stripePaymentMethodId);
    } catch (stripeError) {
      console.error('Stripe detach error:', stripeError);
      // Continue with database deletion even if Stripe fails
      // This handles cases where the payment method was already detached
    }

    // Delete from database
    await card.deleteOne();
    
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error('Delete card error:', err);
    
    // Handle specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid card ID format' });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + err.message });
    }
    
    // Generic server error
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Create payment
exports.createPayment = async (req, res) => {
  const userId = req.user?.id;
  const { amount, paymentMethodId } = req.body;

  if (!userId) return res.status(401).json({ message: 'User not authenticated' });
  if (!amount || !paymentMethodId) return res.status(400).json({ message: 'amount & paymentMethodId required' });

  try {
    const user = await Register.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pm = await PaymentMethod.findOne({ userId, stripePaymentMethodId: paymentMethodId });
    if (!pm) return res.status(400).json({ message: 'Invalid payment method' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: user.stripeCustomerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
    });

    const payment = new Payment({
      userId,
      amount,
      stripePaymentId: paymentIntent.id,
      currency: 'usd',
      status: paymentIntent.status,
    });
    await payment.save();

    res.status(200).json({
      message: 'Payment successful',
      payment,
      clientSecret: paymentIntent.client_secret,
      paymentIntentStatus: paymentIntent.status,
    });

  } catch (err) {
    console.error('CreatePayment error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get all payments for the logged-in user
exports.getPayments = async (req, res) => {
  const userId = req.user?.id; // from JWT middleware

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ payments });
  } catch (err) {
    console.error('Fetch payments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

