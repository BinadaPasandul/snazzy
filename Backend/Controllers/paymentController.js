const Stripe = require('stripe');
const Payment = require('../Models/Payment');
const PaymentMethod = require('../Models/PaymentMethod');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Add a card
exports.addCard = async (req, res) => {
  const { paymentMethodId } = req.body;
  
  // Ensure user is set by JWT middleware
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'User not authenticated' });

  if (!paymentMethodId) {
    return res.status(400).json({ message: 'paymentMethodId required' });
  }

  try {
    // Retrieve the payment method from Stripe
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Check if it is a card
    if (!pm.card) {
      return res.status(400).json({ message: 'Payment method is not a card' });
    }

    // Prevent adding duplicate cards
    const existing = await PaymentMethod.findOne({ stripePaymentMethodId: paymentMethodId });
    if (existing) {
      return res.status(400).json({ message: 'Card already added' });
    }

    // Create new PaymentMethod document
    const newCard = new PaymentMethod({
      userId,
      stripePaymentMethodId: paymentMethodId,
      cardBrand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year
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
      { stripePaymentMethodId: paymentMethodId, cardBrand: pm.card.brand, last4: pm.card.last4 },
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

  try {
    const deleted = await PaymentMethod.findOneAndDelete({ _id: cardId, userId });
    if (!deleted) return res.status(404).json({ message: 'Card not found' });
    res.status(200).json({ message: 'Card deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create payment
exports.createPayment = async (req, res) => {
  const userId = req.user?.id;
  const { amount, paymentMethodId } = req.body;

  if (!userId) return res.status(401).json({ message: 'User not authenticated' });
  if (!amount || !paymentMethodId) 
    return res.status(400).json({ message: 'amount & paymentMethodId required' });

  try {
    // Verify the card exists for this user
    const pm = await PaymentMethod.findOne({ userId, stripePaymentMethodId: paymentMethodId });
    if (!pm) return res.status(400).json({ message: 'Invalid payment method' });

    // Create the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' }, // fix
    });

    // Save payment record in DB
    const payment = new Payment({
      userId,
      amount,
      stripePaymentId: paymentIntent.id,
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

