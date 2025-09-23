const mongoose = require("mongoose");
const Chat = require("../Models/Chat");
const { askAI } = require("../Utils/aiServices");

// Helper: Cast paymentId safely
const castPaymentId = (paymentId) => {
  try {
    return new mongoose.Types.ObjectId(paymentId.trim());
  } catch {
    throw new Error("Invalid paymentId format");
  }
};

// User sends message (text or image)
const sendMessage = async (req, res) => {
  const { message, paymentId } = req.body;
  const userId = req.user.id;

  try {
    const paymentObjectId = castPaymentId(paymentId);

    // Find or create chat
    let chat = await Chat.findOne({ paymentId: paymentObjectId });
    if (!chat) {
      chat = new Chat({ userId, paymentId: paymentObjectId, messages: [] });
    }

    const newMessage = {
      from: "user",
      message: message || null,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      fileType: req.file ? req.file.mimetype : null,
    };

    chat.messages.push(newMessage);
    await chat.save();

   //Ai response
    if (message) {
      const aiReply = await askAI(message);
      if (aiReply) {
        chat.messages.push({
          from: "ai",
          message: aiReply,
        });
        await chat.save();
      }
    }

    res.json({ paymentId: chat.paymentId, messages: chat.messages });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Admin reply
const adminReply = async (req, res) => {
  const { paymentId } = req.params;
  const { message } = req.body;

  try {
    const paymentObjectId = castPaymentId(paymentId);
    const chat = await Chat.findOne({ paymentId: paymentObjectId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    chat.messages.push({
      from: "admin",
      message: message || null,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      fileType: req.file ? req.file.mimetype : null,
    });

    await chat.save();
    res.json({ paymentId: chat.paymentId, messages: chat.messages });
  } catch (err) {
    console.error("Admin reply error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get chat history by payment
const getChatHistory = async (req, res) => {
  const { paymentId } = req.params;

  try {
    const paymentObjectId = castPaymentId(paymentId);
    const chat = await Chat.findOne({ paymentId: paymentObjectId })
      .populate("userId", "name email")
      .populate("paymentId", "amount createdAt");

    res.json(
      chat
        ? { paymentId: chat.paymentId, messages: chat.messages }
        : { paymentId, messages: [] }
    );
  } catch (err) {
    console.error("Get chat history error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  sendMessage,
  adminReply,
  getChatHistory,
};
