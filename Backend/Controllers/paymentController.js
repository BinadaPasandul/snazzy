const Stripe = require('stripe');
const Payment = require('../Models/Payment');
const PaymentMethod = require('../Models/PaymentMethod');
require('dotenv').config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Add a new card
exports.addCard = async (req, res) => {
    const { userId, paymentMethodId } = req.body;

    if (!userId || !paymentMethodId) {
        return res.status(400).json({ message: 'userId and paymentMethodId are required' });
    }

    try {
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        const newPaymentMethod = new PaymentMethod({
            userId,
            stripePaymentMethodId: paymentMethodId,
            cardBrand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
        });

        await newPaymentMethod.save();
        res.status(200).json({ message: 'Card added successfully', paymentMethod: newPaymentMethod });
    } catch (error) {
        console.error('Add card error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
//Get one  card
exports.getCard = async (req, res) => {
  const { cardId } = req.params;
  try {
    const card = await PaymentMethod.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.status(200).json(card);
  } catch (error) {
    console.error('Fetch card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Get all cards for a user
exports.getCards = async (req, res) => {
    const { userId } = req.params;

    try {
        const paymentMethods = await PaymentMethod.find({ userId });
        res.status(200).json({ paymentMethods });
    } catch (error) {
        console.error('Fetch cards error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a card
exports.updateCard = async (req, res) => {
    const { userId, paymentMethodId } = req.body;
    const { cardId } = req.params;

    if (!userId || !paymentMethodId || !cardId) {
        return res.status(400).json({ message: 'userId, paymentMethodId, and cardId are required' });
    }

    try {
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        const updatedPaymentMethod = await PaymentMethod.findOneAndUpdate(
            { _id: cardId, userId },
            {
                stripePaymentMethodId: paymentMethodId,
                cardBrand: paymentMethod.card.brand,
                last4: paymentMethod.card.last4,
            },
            { new: true }
        );

        if (!updatedPaymentMethod) {
            return res.status(404).json({ message: 'Card not found or user mismatch' });
        }

        res.status(200).json({ message: 'Card updated successfully', paymentMethod: updatedPaymentMethod });
    } catch (error) {
        console.error('Update card error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a card
exports.deleteCard = async (req, res) => {
    const { userId, cardId } = req.params;

    try {
        const deletedPaymentMethod = await PaymentMethod.findOneAndDelete({ _id: cardId, userId });

        if (!deletedPaymentMethod) {
            return res.status(404).json({ message: 'Card not found or user mismatch' });
        }

        res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error('Delete card error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Process a payment with a selected card
exports.createPayment = async (req, res) => {
    const { userId, amount, paymentMethodId } = req.body;

    if (!userId || !amount || !paymentMethodId) {
        return res.status(400).json({ message: 'userId, amount, and paymentMethodId are required' });
    }

    if (amount <= 0) {
        return res.status(400).json({ message: 'Amount must be positive' });
    }

    try {
        // Verify the payment method belongs to the user
        const paymentMethod = await PaymentMethod.findOne({ userId, stripePaymentMethodId: paymentMethodId });
        if (!paymentMethod) {
            return res.status(400).json({ message: 'Invalid payment method for this user' });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Amount in cents
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
        });

        // Save payment to database
        const payment = new Payment({
            userId,
            amount,
            stripePaymentId: paymentIntent.id,
        });

        await payment.save();

        res.status(200).json({
            message: 'Payment successful',
            payment,
            paymentIntentStatus: paymentIntent.status,
            clientSecret: paymentIntent.client_secret, // For 3D Secure
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};