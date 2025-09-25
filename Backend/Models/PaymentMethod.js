const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    stripePaymentMethodId: { type: String, required: true },
    cardBrand: { type: String }, 
    last4: { type: String },
    expMonth: { type: Number },
    expYear: { type: Number },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);