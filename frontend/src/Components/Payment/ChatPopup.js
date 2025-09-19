import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../utils/api";

const ChatPopup = ({ paymentId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chat messages
  const fetchChat = useCallback(async () => {
    try {
      const res = await api.get(`/chat/chat/${paymentId}`);
      setMessages(res.data.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error("Fetch chat error:", err);
    }
  }, [paymentId]);

  // Poll messages every 1s
  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [fetchChat]);

  // Send message or image
  const handleSend = async () => {
    if (!newMessage && !image) return;

    const formData = new FormData();
    if (newMessage) formData.append("message", newMessage);
    if (image) formData.append("image", image); // backend expects "image"
    formData.append("paymentId", paymentId);

    try {
      const res = await api.post("/chat/send", formData, {
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
        width: 320,
        height: 420,
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
        Chat (Payment #{paymentId})
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
              textAlign: msg.from === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "5px 10px",
                borderRadius: 8,
                backgroundColor:
                  msg.from === "user"
                    ? "#d1e7dd"
                    : msg.from === "ai"
                    ? "#cfe2ff"
                    : "#f8d7da",
              }}
            >
              {/* Message text */}
              {msg.message}

              {/* Image handling */}
              {msg.fileUrl && msg.fileType?.startsWith("image/") && (
                <div style={{ marginTop: 5 }}>
                  <img
                    src={`${api.defaults.baseURL}${msg.fileUrl}`} // prepend backend URL
                    alt="uploaded"
                    style={{ maxWidth: "150px", borderRadius: 6 }}
                  />
                </div>
              )}

              {/* AI label */}
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
        <button onClick={handleSend} style={{ marginTop: 5, width: "100%" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPopup;
