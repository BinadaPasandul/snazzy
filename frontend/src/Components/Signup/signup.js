import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import signImage from '../../assets/sign.jpg';
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        gmail: "",
        password: "",
        age: "",
        address: "",
        role: "customer" 
    });
    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState("");
    const [ageError, setAgeError] = useState("");

    
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
        
        
        if (name === "password") {
            const validationError = validatePassword(value);
            setPasswordError(validationError);
        }
        if (name === "age") {
            if (value < 1) {
                setAgeError("Age must be greater than 0");
            } else {
                setAgeError("");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        
        if (!user.name || !user.gmail || !user.password || !user.age || !user.address) {
            setError("All fields are required");
            return;
        }

        
        const passwordValidationError = validatePassword(user.password);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return;
        }
        if (user.age < 1) {
            setAgeError("Age must be greater than 0");
            return;
        }

        try {
            const response = await sendRequest();
            if (response.message === "ok") {
                alert("Signup Success");
                navigate("/login");
            } else {
                setError(response.err || "Signup failed");
            }
        } catch (err) {
            setError(err.message || "Error during signup");
        }
    };

    const sendRequest = async () => {
        return await axios.post("http://localhost:5000/user", {
            name: String(user.name),
            gmail: String(user.gmail),
            password: String(user.password),
            age: Number(user.age),
            address: String(user.address),
            role: String(user.role)
        }).then((res) => res.data);
    };

    return (
        <div className="signup-page">
            <Nav />
            <div className="signup-container">
                <div className="signup-wrapper">
                
                    <div className="signup-left-panel">
                        <div className="signup-image-container">
                            <img src={signImage} alt="Signup Background" className="signup-background-image" />
                            <div className="signup-overlay">
                                <div className="signup-image-content">
                                    <h2 className="signup-image-title">Join Our Community</h2>
                                    <p className="signup-image-subtitle">Create your account and start your SNAZZY journey</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="signup-right-panel">
                        <div className="signup-form-container">
                            <div className="signup-form-header">
                                <h1 className="signup-brand">SNAZZY</h1>
                            </div>

                            <div className="signup-welcome-section">
                                <h2 className="signup-welcome-title">Hi New User,</h2>
                                <p className="signup-welcome-subtitle">Welcome to SNAZZY</p>
                            </div>

                            <form className="signup-form" onSubmit={handleSubmit}>
                                <div className="signup-form-group">
                                    <label htmlFor="name" className="signup-label">Full Name.</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        onChange={handleInputChange}
                                        value={user.name}
                                        required
                                        className="signup-input"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="signup-form-group">
                                    <label htmlFor="gmail" className="signup-label">Email.</label>
                                    <input
                                        type="email"
                                        id="gmail"
                                        name="gmail"
                                        onChange={handleInputChange}
                                        value={user.gmail}
                                        required
                                        className="signup-input"
                                        placeholder="Enter your email address"
                                    />
                                </div>

                                <div className="signup-form-group">
                                    <label htmlFor="password" className="signup-label">Password.</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        onChange={handleInputChange}
                                        value={user.password}
                                        required
                                        className="signup-input"
                                        placeholder="Enter your password"
                                        style={passwordError ? { borderColor: '#dc3545' } : {}}
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

                                <div className="signup-form-group">
                                    <label htmlFor="age" className="signup-label">Age.</label>
                                    <input
                                        type="number"
                                        id="age"
                                        name="age"
                                        onChange={handleInputChange}
                                        value={user.age}
                                        required
                                        className="signup-input"
                                        placeholder="Enter your age"
                                        min="1"
                                   style={ageError ? { borderColor: '#dc3545' } : {}}
                            />
                            {ageError && (
                                <div style={{ color: '#dc3545', fontSize: '0.875rem' }}>{ageError}</div>
                            )}
                                </div>

                                <div className="signup-form-group">
                                    <label htmlFor="address" className="signup-label">Address.</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        onChange={handleInputChange}
                                        value={user.address}
                                        required
                                        className="signup-input"
                                        placeholder="Enter your address"
                                    />
                                </div>

                                {error && <p className="signup-error">{error}</p>}

                                <button type="submit" className="signup-submit-btn">
                                    Sign Up
                                </button>

                                <p className="signup-login-link">
                                    Already have an account? <a href="/login">Login</a>
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

export default Signup;