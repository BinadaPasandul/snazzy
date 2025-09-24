import React, { useState } from "react";
import axios from "axios";
import Nav from "../Navbar/nav";

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
    <div>
      <Nav />
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={gmail}
          onChange={(e) => setGmail(e.target.value)}
          required
          placeholder="Enter your registered email"
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
