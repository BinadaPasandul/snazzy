import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../Navbar/nav";

function UpdateUser() {
  const { id } = useParams();
  const history = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Password validation function
  const validatePassword = (password) => {
    if (!password) return ""; // Password is optional in update
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

  const [form, setForm] = useState({
    name: "",
    gmail: "",
    age: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/user/${id}`, {
          headers: { Authorization: token }
        });
        const u = res.data.user;
        setForm({
          name: u.name || "",
          gmail: u.gmail || "",
          age: u.age || "",
          address: u.address || "",
          password: "",
        });
        setLoading(false);
      } catch (e) {
        setError("Failed to load user");
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Validate password in real-time
    if (name === "password") {
      const validationError = validatePassword(value);
      setPasswordError(validationError);
    }
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    
    // Validate password if provided
    if (form.password) {
      const passwordValidationError = validatePassword(form.password);
      if (passwordValidationError) {
        setPasswordError(passwordValidationError);
        return;
      }
    }
    
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: String(form.name),
        gmail: String(form.gmail),
        age: Number(form.age),
        address: String(form.address),
      };
      if (form.password) {
        payload.password = String(form.password);
      }
      await axios.put(`http://localhost:5000/user/${id}`, payload, {
        headers: { Authorization: token }
      });
      history("/userdetails");
    } catch (e) {
      setError("Failed to update user");
    }
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <h1>Update User</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={submitUpdate}>
        <div>
          <label>Name</label>
          <input name="name" value={form.name} onChange={onChange} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="gmail" value={form.gmail} onChange={onChange} required />
        </div>
        <div>
          <label>Age</label>
          <input type="number" name="age" value={form.age} onChange={onChange} min="1" required />
        </div>
        <div>
          <label>Address</label>
          <input name="address" value={form.address} onChange={onChange} required />
        </div>
        <div>
          <label>New Password (optional)</label>
          <input 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={onChange}
            style={passwordError ? { borderColor: '#dc3545' } : {}}
          />
          {passwordError && (
            <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px' }}>
              {passwordError}
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '4px' }}>
            Password must be at least 5 characters with uppercase, lowercase, and symbol
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Save</button>
          <button type="button" onClick={() => history(-1)} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default UpdateUser;


