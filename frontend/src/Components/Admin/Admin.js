import React, { useState } from 'react';
import Nav from '../Navbar/nav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Admin() {
    const history = useNavigate();
    const [user, setUser] = useState({
        name: "",
        gmail: "",
        password: "",
        age: "",
        role: "" // Default role set to staff
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        sendRequest().then(() => {
            alert("Staff Member Added Successfully");
            history("/admin"); // Redirect to admin for consistency
        }).catch((err) => {
            alert("Error: " + err.message);
        });
    };

    const sendRequest = async () => {
        return await axios.post("http://localhost:5000/user", {
            name: String(user.name),
            gmail: String(user.gmail),
            password: String(user.password),
            age: Number(user.age),
            role: String(user.role) // Send role as "staff"
        }).then((res) => res.data);
    };

    return (
        <div>
            <Nav />
            <h1>Add Staff Member</h1>
            <form className="user-form" onSubmit={handleSubmit}>
                <h2>Staff Information</h2>

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
                    <label htmlFor="role">Role:</label>
                    <select
                        id="role"
                        name="role"
                        onChange={handleInputChange}
                        value={user.role}
                        required
                    >
                       
                        <option value="product_manager">Product Manager</option>
                        <option value="order_manager">Order Manager</option>
                        <option value="promotion_manager">Promotion Manager</option>
                        <option value="financial_manager">Financial Manager</option>
                    </select>
                </div>

                {/* Role is not shown in the form as it's set by default */}
                <button type="submit" className="submit-btn">
                    Add Member
                </button>
            </form>
        </div>
    );
}

export default Admin;