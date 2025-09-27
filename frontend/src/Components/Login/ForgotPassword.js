import React, { useState } from "react";
import axios from "axios";
import Nav from "../Navbar/nav";
import Footer from "../Footer/Footer";
import logImage from "../../assets/log.jpg";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [gmail, setGmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/user/forgot-password", { gmail });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="forgot-password-page">
      <Nav />
      <div className="forgot-password-container">
        <div className="forgot-password-wrapper">
          {/* Left Panel - Image Section */}
          <div className="forgot-password-left-panel">
            <div className="forgot-password-image-container">
              <img src={logImage} alt="Forgot Password Background" className="forgot-password-background-image" />
              <div className="forgot-password-overlay">
                <div className="forgot-password-image-content">
                  <h2 className="forgot-password-image-title">Reset Your Password</h2>
                  <p className="forgot-password-image-subtitle">Don't worry, we'll help you get back into your account</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form Section */}
          <div className="forgot-password-right-panel">
            <div className="forgot-password-form-container">
              <div className="forgot-password-welcome-section">
                <h2 className="forgot-password-welcome-title">Forgot Password?</h2>
                <p className="forgot-password-welcome-subtitle">Enter your email to receive a reset link</p>
              </div>

              <form className="forgot-password-form" onSubmit={handleSubmit}>
                <div className="forgot-password-form-group">
                  <label htmlFor="gmail" className="forgot-password-label">Email.</label>
                  <input
                    type="email"
                    id="gmail"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    required
                    className="forgot-password-input"
                    placeholder="Enter your registered email"
                  />
                </div>

                <button type="submit" className="forgot-password-submit-btn">
                  Send Reset Link
                </button>

                {message && (
                  <div className={`forgot-password-message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                  </div>
                )}

                <p className="forgot-password-login-link">
                  Remember your password? <a href="/login">Back to Login</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
