import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Navbar/nav";

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
    <div>
      <Nav />
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <label>New Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter new password"
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
