const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const upload = require("../Middleware/uploadMiddleware");
const {
  sendMessage,
  adminReply,
  getChatHistory,
} = require("../Controllers/chatController");

const router = express.Router();

// User sends text or image (must include paymentId in body)
router.post("/send", authMiddleware(), upload.single("image"), sendMessage);

// Admin replies (text or image)
router.post(
  "/admin-reply/:paymentId",
  authMiddleware("admin"),
  upload.single("image"),
  adminReply
);

// Get chat history by paymentId
router.get("/chat/:paymentId", authMiddleware(), getChatHistory);

module.exports = router;
