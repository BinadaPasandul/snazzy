import React, { useState } from 'react';
import Nav from '../Navbar/nav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        gmail: "",
        password: "",
        age: "",
        address: "",
        role: "customer" // Default role
    });
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate inputs
        if (!user.name || !user.gmail || !user.password || !user.age || !user.address) {
            setError("All fields are required");
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
        <div>
            <Nav />
            <h1>Sign Up</h1>
            <form className="user-form" onSubmit={handleSubmit}>
                

                <div className="form-group">
                    <label htmlFor="name">Full Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        onChange={handleInputChange}
                        value={user.name}
                        required
                        placeholder="Enter your full name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="gmail">Email:</label>
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
                    <label htmlFor="password">Password:</label>
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

                <div className="form-group">
                    <label htmlFor="age">Age:</label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        onChange={handleInputChange}
                        value={user.age}
                        required
                        placeholder="Enter your age"
                        min="1"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="address">Address:</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        onChange={handleInputChange}
                        value={user.address}
                        required
                        placeholder="Enter your address"
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" className="submit-btn">
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Signup;