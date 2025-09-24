import React, { useState } from "react";
import Nav from "../Navbar/nav";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
          history("/promotionmanager");
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
    <div>
      <Nav />
      <h1>Login</h1>
      <form className="user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="gmail"
            name="gmail"
            onChange={handleInputChange}
            value={user.gmail}
            required
            placeholder="Enter your email address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={handleInputChange}
            value={user.password}
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="submit-btn">
          Login
        </button>
        <p>
          <a href="/forgot-password">Forgot Password?</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
