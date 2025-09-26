import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logImage from "../../assets/log.jpg";
import Nav from "../Navbar/nav";
import Footer from "../Footer/Footer";
import "./Login.css";

const Login = () => {
  const history = useNavigate();
  const [user, setUser] = useState({
    gmail: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendRequest();
      if (response.status === "ok") {
        // Save token + user details
        localStorage.setItem("token", response.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: response.name,
            role: response.role,
          })
        );

        alert("Login Success");
        // Redirect by role
        if (response.role === "customer") {
          history("/userdetails");
        } else if (response.role === "admin") {
          history("/admin");
        } else if (response.role === "product_manager") {
          history("/productmanager");
        } else if (response.role === "order_manager") {
          history("/ordermanager");
        } else if (response.role === "promotion_manager") {
          history("/promotiondashboard");
        } else if (response.role === "financial_manager") {
          history("/financialmanager");
        } else {
          alert("Unknown role");
        }
      } else {
        alert("Login error: " + response.err);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const sendRequest = async () => {
    return await axios
      .post("http://localhost:5000/user/login", {
        gmail: user.gmail,
        password: user.password,
      })
      .then((res) => res.data);
  };

  return (
    <div className="login-page">
      <Nav />
      <div className="login-container">
        <div className="login-wrapper">
          {/* Left Panel - Image Section */}
          <div className="login-left-panel">
            <div className="login-image-container">
              <img src={logImage} alt="Login Background" className="login-background-image" />
              <div className="login-overlay">
                <div className="login-image-content">
                  <h2 className="login-image-title">Welcome Back</h2>
                  <p className="login-image-subtitle">Sign in to continue your journey with SNAZZY</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="login-right-panel">
            <div className="login-form-container">
              

              <div className="login-welcome-section">
                <h2 className="login-welcome-title">Hi Shopper,</h2>
                <p className="login-welcome-subtitle">Welcome to SNAZZY</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-form-group">
                  <label htmlFor="gmail" className="login-label">Email.</label>
                  <input
                    type="email"
                    id="gmail"
                    name="gmail"
                    onChange={handleInputChange}
                    value={user.gmail}
                    required
                    className="login-input"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="login-form-group">
                  <label htmlFor="password" className="login-label">Password.</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    onChange={handleInputChange}
                    value={user.password}
                    required
                    className="login-input"
                    placeholder="Enter your password"
                  />
                  <a href="/forgot-password" className="login-forgot-link">Forgot password?</a>
                </div>

                <button type="submit" className="login-submit-btn">
                  Login
                </button>

                <p className="login-signup-link">
                  Don't have an account? <a href="/signup">Sign up</a>
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

export default Login;
