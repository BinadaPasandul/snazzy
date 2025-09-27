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
  const [passwordError, setPasswordError] = useState("");

  // Password validation function
  const validatePassword = (password) => {
    if (password.length < 5) {
      return "Password must be at least 5 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least one symbol";
    }
    return "";
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Validate password in real-time
    const validationError = validatePassword(value);
    setPasswordError(validationError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password before submission
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
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
                    onChange={handlePasswordChange}
                    required
                    className="reset-password-input"
                    style={passwordError ? { borderColor: '#dc3545' } : {}}
                    placeholder="Enter your new password"
                  />
                  {passwordError && (
                    <div className="password-error" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px' }}>
                      {passwordError}
                    </div>
                  )}
                  <div className="password-requirements" style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '4px' }}>
                    Password must be at least 5 characters with uppercase, lowercase, and symbol
                  </div>
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
