import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Navbar/nav";
import Footer from "../Footer/Footer";
import logImage from "../../assets/log.jpg";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/user/reset-password/${token}`, { password });
      setMessage(res.data.message);
      if (res.status === 200) {
        alert("Password reset successful. Please log in.");
        navigate("/login");
      }
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="reset-password-page">
      <Nav />
      <div className="reset-password-container">
        <div className="reset-password-wrapper">
          {/* Left Panel - Image Section */}
          <div className="reset-password-left-panel">
            <div className="reset-password-image-container">
              <img src={logImage} alt="Reset Password Background" className="reset-password-background-image" />
              <div className="reset-password-overlay">
                <div className="reset-password-image-content">
                  <h2 className="reset-password-image-title">Create New Password</h2>
                  <p className="reset-password-image-subtitle">Choose a strong password to secure your account</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form Section */}
          <div className="reset-password-right-panel">
            <div className="reset-password-form-container">
              <div className="reset-password-welcome-section">
                <h2 className="reset-password-welcome-title">Reset Password</h2>
                <p className="reset-password-welcome-subtitle">Enter your new password below</p>
              </div>

              <form className="reset-password-form" onSubmit={handleSubmit}>
                <div className="reset-password-form-group">
                  <label htmlFor="password" className="reset-password-label">New Password.</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="reset-password-input"
                    placeholder="Enter your new password"
                  />
                </div>

                <button type="submit" className="reset-password-submit-btn">
                  Reset Password
                </button>

                {message && (
                  <div className={`reset-password-message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                  </div>
                )}

                <p className="reset-password-login-link">
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

export default ResetPassword;
