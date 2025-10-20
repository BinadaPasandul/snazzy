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
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [addressError, setAddressError] = useState("");

    
    // Name validation - only letters and spaces
    const validateName = (name) => {
        if (!name || !name.trim()) {
            return "Name is required";
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return "Name can only contain letters and spaces";
        }
        if (name.trim().length < 2) {
            return "Name must be at least 2 characters long";
        }
        if (name.trim().length > 50) {
            return "Name must be less than 50 characters";
        }
        return "";
    };

    // Email validation
    const validateEmail = (email) => {
        if (!email || !email.trim()) {
            return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }
        if (email.length > 100) {
            return "Email must be less than 100 characters";
        }
        return "";
    };

    // Address validation
    const validateAddress = (address) => {
        if (!address || !address.trim()) {
            return "Address is required";
        }
        if (address.trim().length < 5) {
            return "Address must be at least 5 characters long";
        }
        if (address.trim().length > 200) {
            return "Address must be less than 200 characters";
        }
        return "";
    };

    // Age validation
    const validateAge = (age) => {
        if (!age || age === "") {
            return "Age is required";
        }
        const ageNum = parseInt(age);
        if (isNaN(ageNum)) {
            return "Age must be a valid number";
        }
        if (ageNum < 1) {
            return "Age must be greater than 0";
        }
        if (ageNum > 120) {
            return "Age must be less than 120";
        }
        return "";
    };

    // Password validation
    const validatePassword = (password) => {
        if (!password) {
            return "Password is required";
        }
        if (password.length < 5) {
            return "Password must be at least 5 characters long";
        }
        if (password.length > 50) {
            return "Password must be less than 50 characters";
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
        
        // Clear general error when user starts typing
        setError(null);
        
        // Real-time validation for each field
        if (name === "name") {
            const validationError = validateName(value);
            setNameError(validationError);
        }
        if (name === "gmail") {
            const validationError = validateEmail(value);
            setEmailError(validationError);
        }
        if (name === "password") {
            const validationError = validatePassword(value);
            setPasswordError(validationError);
        }
        if (name === "age") {
            const validationError = validateAge(value);
            setAgeError(validationError);
        }
        if (name === "address") {
            const validationError = validateAddress(value);
            setAddressError(validationError);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate all fields
        const nameValidationError = validateName(user.name);
        const emailValidationError = validateEmail(user.gmail);
        const passwordValidationError = validatePassword(user.password);
        const ageValidationError = validateAge(user.age);
        const addressValidationError = validateAddress(user.address);

        // Set all validation errors
        setNameError(nameValidationError);
        setEmailError(emailValidationError);
        setPasswordError(passwordValidationError);
        setAgeError(ageValidationError);
        setAddressError(addressValidationError);

        // Check if any validation failed
        if (nameValidationError || emailValidationError || passwordValidationError || 
            ageValidationError || addressValidationError) {
            setError("Please fix all validation errors before submitting");
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
                                        style={nameError ? { borderColor: '#dc3545' } : {}}
                                    />
                                    {nameError && (
                                        <div className="name-error" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px' }}>
                                            {nameError}
                                        </div>
                                    )}
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
                                        style={emailError ? { borderColor: '#dc3545' } : {}}
                                    />
                                    {emailError && (
                                        <div className="email-error" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px' }}>
                                            {emailError}
                                        </div>
                                    )}
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
                                        max="120"
                                        style={ageError ? { borderColor: '#dc3545' } : {}}
                                    />
                                    {ageError && (
                                        <div className="age-error" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px' }}>
                                            {ageError}
                                        </div>
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
                                        style={addressError ? { borderColor: '#dc3545' } : {}}
                                    />
                                    {addressError && (
                                        <div className="address-error" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px' }}>
                                            {addressError}
                                        </div>
                                    )}
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