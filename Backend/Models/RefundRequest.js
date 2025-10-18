// models/RefundRequest.js
const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String },
  adminResponse: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
