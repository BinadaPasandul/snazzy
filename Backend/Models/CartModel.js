const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true
  },
  pname: {
    type: String,
    required: true
  },
  pcode: {
    type: String,
    required: true
  },
  pamount: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedSize: {
    type: String,
    default: null
  },
  selectedColor: {
    type: String,
    default: null
  },
  variant: {
    type: String,
    default: null
  },
  hasActivePromotion: {
    type: Boolean,
    default: false
  },
  discountedPrice: {
    type: Number,
    default: null
  },
  promotion: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
