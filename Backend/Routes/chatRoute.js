const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const upload = require("../Middleware/uploadMiddleware");
const {
  sendMessage,
  adminReply,
  getChatHistory,
} = require("../Controllers/chatController");

const router = express.Router();


router.post("/send", authMiddleware(), upload.single("image"), sendMessage);

// Admin 
router.post(
  "/admin-reply/:paymentId",
  authMiddleware("admin"),
  upload.single("image"),
  adminReply
);

router.get("/chat/:paymentId", authMiddleware(), getChatHistory);

module.exports = router;
