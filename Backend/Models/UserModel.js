const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const regiSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  gmail: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  address:{
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'staff', 'product_manager', 'order_manager', 'promotion_manager', 'financial_manager'],
    default: 'customer',
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  stripeCustomerId: { type: String },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

regiSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model('Register', regiSchema);