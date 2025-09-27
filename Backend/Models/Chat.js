const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: { type: String, enum: ["user", "order_manager", "ai"], required: true },
  message: { type: String },
  fileUrl: { type: String },
  fileType: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment", // Payment model
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register", //user model
      required: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
