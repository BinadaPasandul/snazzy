// AdminChatPopup.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../utils/api";
import "./AdminChatPopup.css";

const AdminChatPopup = ({ paymentId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChat = useCallback(async () => {
    try {
      const res = await api.get(`/chat/chat/${paymentId}`);
      // Show all messages: user, admin, AI
      setMessages(res.data.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error("Fetch chat error:", err);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [fetchChat]);

  const handleSend = async () => {
    if (!newMessage && !image) return;

    const formData = new FormData();
    if (newMessage) formData.append("message", newMessage);
    if (image) formData.append("image", image);

    try {
      const res = await api.post(`/chat/admin-reply/${paymentId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages(res.data.messages || []);
      setNewMessage("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      scrollToBottom();
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="admin-chat-popup">
      {/* Header */}
      <div className="admin-chat-header">
        Admin Chat (Payment #{paymentId})
        <button onClick={onClose} className="admin-chat-close">
          X
        </button>
      </div>

      {/* Messages */}
      <div className="admin-chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`admin-msg-row ${
              msg.from === "user" ? "user-msg" : msg.from === "admin" ? "admin-msg" : "ai-msg"
            }`}
          >
            <div
              className={`admin-msg ${
                msg.from === "user"
                  ? "admin-msg-user"
                  : msg.from === "admin"
                  ? "admin-msg-admin"
                  : "admin-msg-ai"
              }`}
            >
              {msg.message}
              {msg.fileUrl && msg.fileType?.startsWith("image/") && (
                <img
                  src={`${api.defaults.baseURL}${msg.fileUrl}`}
                  alt="uploaded"
                />
              )}
              {msg.from === "ai" && (
                <div className="admin-msg-meta">AI</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="admin-chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button onClick={handleSend} className="admin-chat-send">
          Send
        </button>
      </div>
    </div>
  );
};

export default AdminChatPopup;
