const mongoose = require('mongoose');
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
});

module.exports = mongoose.model('Register', regiSchema);