import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../Navbar/nav";
import Footer from "../Footer/Footer";
import "./UpdateUser.css";

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
      <div className="update-user-page">
        <Nav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading user data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="update-user-page">
      <Nav />
      
      <div className="update-user-container">
        <div className="update-header">
          <h1 className="update-title1">Update Profile</h1>
          <p className="update-subtitle1">Update your personal information and settings</p>
        </div>

        <div className="update-form-container">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="update-form" onSubmit={submitUpdate}>
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input 
                className="form-input" 
                name="name" 
                value={form.name} 
                onChange={onChange} 
                required 
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input 
                type="email" 
                className="form-input" 
                name="gmail" 
                value={form.gmail} 
                onChange={onChange} 
                required 
                placeholder="Enter your email address"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Age <span className="required">*</span>
              </label>
              <input 
                type="number" 
                className="form-input" 
                name="age" 
                value={form.age} 
                onChange={onChange} 
                min="1" 
                max="120"
                required 
                placeholder="Enter your age"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Address <span className="required">*</span>
              </label>
              <input 
                className="form-input" 
                name="address" 
                value={form.address} 
                onChange={onChange} 
                required 
                placeholder="Enter your address"
              />
            </div>

            <div className="form-group password-group">
              <label className="form-label">New Password (optional)</label>
              <input 
                type="password" 
                className={`form-input ${passwordError ? 'error' : ''}`}
                name="password" 
                value={form.password} 
                onChange={onChange}
                placeholder="Enter new password (leave blank to keep current)"
              />
              {passwordError && (
                <div className="password-error">
                  {passwordError}
                </div>
              )}
              <div className="password-requirements">
                Password must be at least 5 characters with uppercase, lowercase, and symbol
              </div>
            </div>

            <div className="button-group">
              <button 
                type="button" 
                className="btn btn-secondaryy" 
                onClick={() => history(-1)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primaryyy"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default UpdateUser;


