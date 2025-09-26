import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../utils/api";
import "./ChatPopup.css";

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
    <div className="chat-popup">
      <div className="chat-header">
        <span>Chat (Payment #{paymentId})</span>
        <button className="chat-close" onClick={onClose}>✕</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="msg-row" style={{ textAlign: msg.from === "user" ? "right" : "left" }}>
            <div className={`msg ${msg.from === "user" ? "msg-user" : msg.from === "ai" ? "msg-ai" : "msg-admin"}`}>
              {msg.message}
              {msg.fileUrl && msg.fileType?.startsWith("image/") && (
                <div>
                  <img src={`${api.defaults.baseURL}${msg.fileUrl}`} alt="uploaded" />
                </div>
              )}
              {msg.from === "ai" && <div className="msg-meta">AI</div>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <button className="chat-send" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatPopup;
