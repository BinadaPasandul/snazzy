// AdminChatPopup.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../utils/api";

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
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 360,
        height: 480,
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 10,
          borderBottom: "1px solid #ccc",
          fontWeight: "bold",
        }}
      >
        Admin Chat (Payment #{paymentId})
        <button onClick={onClose} style={{ float: "right" }}>
          X
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 10,
              display: "flex",
              justifyContent:
                msg.from === "user" ? "flex-start" : "flex-end", // user left, admin/AI right
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "6px 12px",
                borderRadius: 12,
                backgroundColor:
                  msg.from === "user"
                    ? "#d1e7dd" // green for user
                    : msg.from === "admin"
                    ? "#f8d7da" // red for admin
                    : "#cfe2ff", // blue for AI
                textAlign: "left",
                wordBreak: "break-word",
              }}
            >
              {msg.message}
              {msg.fileUrl && msg.fileType?.startsWith("image/") && (
                <div style={{ marginTop: 5 }}>
                  <img
                    src={`${api.defaults.baseURL}${msg.fileUrl}`}
                    alt="uploaded"
                    style={{ maxWidth: "150px", borderRadius: 6 }}
                  />
                </div>
              )}
              {msg.from === "ai" && (
                <div style={{ fontSize: 10, color: "#555" }}>AI</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 10, borderTop: "1px solid #ccc" }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ width: "100%", marginBottom: 5 }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button
          onClick={handleSend}
          style={{ marginTop: 5, width: "100%" }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AdminChatPopup;
