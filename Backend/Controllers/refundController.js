const Stripe = require('stripe');
const Payment = require('../Models/Payment');
const RefundRequest = require('../Models/RefundRequest');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Step 1: User creates refund request
exports.createRefundRequest = async (req, res) => {
  const { paymentId } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if already requested
    const existing = await RefundRequest.findOne({ paymentId, userId });
    if (existing) {
      return res.status(400).json({ message: 'Refund already requested for this payment' });
    }

    const refundRequest = new RefundRequest({
      userId,
      paymentId,
      reason,
      status: 'pending'
    });
    await refundRequest.save();

    res.status(201).json({ message: 'Refund request submitted', refundRequest });
  } catch (err) {
    console.error('Refund request error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Step 2: Admin approves/rejects
exports.handleRefund = async (req, res) => {
  const { requestId } = req.params;
  const { action, response } = req.body; // action = "approve" | "reject"
  
  try {
    const refundRequest = await RefundRequest.findById(requestId).populate('paymentId');
    if (!refundRequest) {
      return res.status(404).json({ message: 'Refund request not found' });
    }

    if (refundRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Refund already processed' });
    }

    if (action === 'approve') {
      // Call Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: refundRequest.paymentId.stripePaymentId,
      });

      refundRequest.status = 'approved';
      refundRequest.adminResponse = response || 'Approved';
      await refundRequest.save();

      return res.status(200).json({ message: 'Refund approved', refund, refundRequest });
    } else if (action === 'reject') {
      refundRequest.status = 'rejected';
      refundRequest.adminResponse = response || 'Rejected';
      await refundRequest.save();

      return res.status(200).json({ message: 'Refund rejected', refundRequest });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (err) {
    console.error('Handle refund error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Step 3: User can view their refund requests
exports.getUserRefunds = async (req, res) => {
  const userId = req.user.id;
  try {
    const refunds = await RefundRequest.find({ userId }).populate('paymentId');
    res.status(200).json({ refunds });
  } catch (err) {
    console.error('Get refunds error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 4: Admin can view all refund requests
exports.getAllRefunds = async (req, res) => {
  try {
    const refunds = await RefundRequest.find().populate('paymentId');
    res.status(200).json({ refunds });
  } catch (err) {
    console.error('Get all refunds error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
