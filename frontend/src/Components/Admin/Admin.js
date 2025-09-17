import React, { useEffect, useState } from 'react';
import Nav from '../Navbar/nav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Admin() {
    const history = useNavigate();
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", gmail: "", age: "", address: "", role: "" });
    const [user, setUser] = useState({
        name: "",
        gmail: "",
        password: "",
        age: "",
        address: "",
        role: "" // Default role set to staff
    });

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/user", {
            headers: { Authorization: token }
        });
        setUsers(response.data.users || []);
    };

    useEffect(() => {
        fetchUsers().catch(() => setUsers([]));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        sendRequest().then(() => {
            alert("Staff Member Added Successfully");
            fetchUsers();
            history("/admin"); // Redirect to admin for consistency
        }).catch((err) => {
            alert("Error: " + err.message);
        });
    };

   const sendRequest = async () => {
    const token = localStorage.getItem("token"); // Get token from localStorage

    return await axios.post("http://localhost:5000/user", {
        name: String(user.name),
        gmail: String(user.gmail),
        password: String(user.password),
        age: Number(user.age),
        address: String(user.address),
        role: String(user.role)
    }, {
        headers: {
            Authorization: token // Attach token here
        }
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

            <h2 style={{ marginTop: 24 }}>All Users</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Name</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Email</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Age</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Address</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Role</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{u.name}</td>
                                <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{u.gmail}</td>
                                <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{u.age}</td>
                                <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{u.address}</td>
                                <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{u.role}</td>
                                <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                                    <button onClick={() => {
                                        setEditingUser(u._id);
                                        setEditForm({ name: u.name || "", gmail: u.gmail || "", age: u.age || "", address: u.address || "", role: u.role || "" });
                                    }} style={{ marginRight: 8 }}>Edit</button>
                                    <button onClick={async () => {
                                        if (!window.confirm('Delete this user?')) return;
                                        const token = localStorage.getItem('token');
                                        await axios.delete(`http://localhost:5000/user/${u._id}`, { headers: { Authorization: token } });
                                        await fetchUsers();
                                    }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '12px', color: '#666' }}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <div style={{ marginTop: 24 }}>
                    <h2>Edit User</h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const token = localStorage.getItem('token');
                        await axios.put(`http://localhost:5000/user/${editingUser}`, {
                            name: editForm.name,
                            gmail: editForm.gmail,
                            age: Number(editForm.age),
                            address: editForm.address,
                            role: editForm.role
                        }, { headers: { Authorization: token } });
                        setEditingUser(null);
                        await fetchUsers();
                    }}>
                        <div className="form-group">
                            <label>Name</label>
                            <input value={editForm.name} onChange={(e)=> setEditForm({ ...editForm, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={editForm.gmail} onChange={(e)=> setEditForm({ ...editForm, gmail: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Age</label>
                            <input type="number" value={editForm.age} onChange={(e)=> setEditForm({ ...editForm, age: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input value={editForm.address} onChange={(e)=> setEditForm({ ...editForm, address: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select value={editForm.role} onChange={(e)=> setEditForm({ ...editForm, role: e.target.value })}>
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                                <option value="product_manager">Product Manager</option>
                                <option value="order_manager">Order Manager</option>
                                <option value="promotion_manager">Promotion Manager</option>
                                <option value="financial_manager">Financial Manager</option>
                            </select>
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <button type="submit" style={{ marginRight: 8 }}>Save</button>
                            <button type="button" onClick={()=> setEditingUser(null)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Admin;