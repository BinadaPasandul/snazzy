import React, { useEffect, useState } from 'react';
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png';
import './Admin.css';

function Admin() {
    const history = useNavigate();
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [report, setReport] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const [reportError, setReportError] = useState("");
    const [editForm, setEditForm] = useState({ name: "", gmail: "", age: "", address: "", role: "" });
    const [userStats, setUserStats] = useState({
        customers: 0,
        admins: 0,
        productManagers: 0,
        orderManagers: 0,
        promotionManagers: 0,
        totalUsers: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [searchRole, setSearchRole] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
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
        setLoadingStats(true);
        try {
            const response = await axios.get("http://localhost:5000/user", {
                headers: { Authorization: token }
            });
            const usersData = response.data.users || [];
            setUsers(usersData);
            
            // Calculate user statistics
            const stats = {
                customers: usersData.filter(u => u.role === 'customer').length,
                admins: usersData.filter(u => u.role === 'admin').length,
                productManagers: usersData.filter(u => u.role === 'product_manager').length,
                orderManagers: usersData.filter(u => u.role === 'order_manager').length,
                promotionManagers: usersData.filter(u => u.role === 'promotion_manager').length,
                totalUsers: usersData.length
            };
            
            console.log('User Statistics:', stats);
            console.log('Users Data:', usersData);
            setUserStats(stats);
            setFilteredUsers(usersData);
            setLoadingStats(false);
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Failed to fetch users';
            alert(msg);
            setUsers([]);
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchUsers().catch(() => setUsers([]));
        (async ()=>{
            try {
                setLoadingReport(true);
                setReportError("");
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/user/report", { headers: { Authorization: token } });
                setReport(response.data);
            } catch (e) {
                setReportError(e?.response?.data?.message || e.message || "Failed to load report");
            } finally {
                setLoadingReport(false);
            }
        })();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleRoleSearch = (role) => {
        setSearchRole(role);
        applyFilters(role, searchEmail);
    };

    const handleEmailSearch = (email) => {
        setSearchEmail(email);
        applyFilters(searchRole, email);
    };

    const applyFilters = (role, email) => {
        let filtered = users;
        
        // Filter by role
        if (role && role !== '') {
            filtered = filtered.filter(user => user.role === role);
        }
        
        // Filter by email
        if (email && email !== '') {
            filtered = filtered.filter(user => 
                user.gmail && user.gmail.toLowerCase().includes(email.toLowerCase())
            );
        }
        
        setFilteredUsers(filtered);
    };

    const clearAllFilters = () => {
        setSearchRole('');
        setSearchEmail('');
        setFilteredUsers(users);
    };

    // PDF Component for download
    const PDFReport = () => (
        <div className="pdf-report">
            <div className="pdf-header">
                <div className="pdf-logo-section">
                    <img src={logo} alt="Snazzy Logo" className="pdf-logo" />
                    <h1 className="pdf-title">SNAZZY</h1>
                </div>
                <div className="pdf-report-info">
                    <h2 className="pdf-report-title">User Report</h2>
                    <p className="pdf-date">Generated on: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
            
            <div className="pdf-content">
                <h3 className="pdf-section-title">Users</h3>
                <table className="pdf-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Age</th>
                            <th>Address</th>
                            <th>Role</th>
                            <th>Loyalty Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.gmail}</td>
                                <td>{user.age}</td>
                                <td>{user.address}</td>
                                <td>{user.role.replace('_', ' ')}</td>
                                <td>{user.role === 'customer' ? (user.loyaltyPoints ?? 0) : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

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
        <div className="admin-dashboard">
            <Nav />
            
            {/* Hidden PDF Component for download */}
            <div style={{ display: 'none' }}>
                <PDFReport />
            </div>
            
            <div className="dashboard-header">
                <h1 className="dashboard-title">Admin Dashboard</h1>
                <p className="dashboard-subtitle">Manage users and system settings</p>
            </div>
            
            <div className="dashboard-content">
                {/* Statistics Cards */}
                <div className="stats-section">
                    <div className="stats-grid">
                        <div className="stat-card customers">
                            <div className="stat-content">
                                <div className="stat-info">
                                    <h3 className="stat-title">Customers</h3>
                                    <p className="stat-value">{loadingStats ? '...' : userStats.customers}</p>
                                </div>
                                <div className="stat-icon">
                                    👥
                                </div>
                            </div>
                        </div>
                        
                        <div className="stat-card admins">
                            <div className="stat-content">
                                <div className="stat-info">
                                    <h3 className="stat-title">Admins</h3>
                                    <p className="stat-value">{loadingStats ? '...' : userStats.admins}</p>
                                </div>
                                <div className="stat-icon">
                                    👑
                                </div>
                            </div>
                        </div>
                        
                        <div className="stat-card product-managers">
                            <div className="stat-content">
                                <div className="stat-info">
                                    <h3 className="stat-title">Product Managers</h3>
                                    <p className="stat-value">{loadingStats ? '...' : userStats.productManagers}</p>
                                </div>
                                <div className="stat-icon">
                                    📦
                                </div>
                            </div>
                        </div>
                        
                        <div className="stat-card order-managers">
                            <div className="stat-content">
                                <div className="stat-info">
                                    <h3 className="stat-title">Order Managers</h3>
                                    <p className="stat-value">{loadingStats ? '...' : userStats.orderManagers}</p>
                                </div>
                                <div className="stat-icon">
                                    📋
                                </div>
                            </div>
                        </div>
                        
                        <div className="stat-card promotion-managers">
                            <div className="stat-content">
                                <div className="stat-info">
                                    <h3 className="stat-title">Promotion Managers</h3>
                                    <p className="stat-value">{loadingStats ? '...' : userStats.promotionManagers}</p>
                                </div>
                                <div className="stat-icon">
                                    🎯
                                </div>
                            </div>
                        </div>
                        
                        <div className="stat-card total-users">
                            <div className="stat-content">
                                <div className="stat-info">
                                    <h3 className="stat-title">Total Users</h3>
                                    <p className="stat-value">{loadingStats ? '...' : userStats.totalUsers}</p>
                                </div>
                                <div className="stat-icon">
                                    👤
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="form-title">Add Staff Member</h2>
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
                        
                    </select>
                </div>

                {/* Role is not shown in the form as it's set by default */}
                        <button type="submit" className="submit-btn">
                            Add Member
                        </button>
                    </form>
                </div>

                <div className="users-section">
                    <div className="users-header">
                        <h2 className="users-title">All Users</h2>
                        <div className="search-container">
                            <div className="role-search-container">
                                <label htmlFor="roleSearch" className="search-label">Filter by Role:</label>
                                <select 
                                    id="roleSearch"
                                    value={searchRole} 
                                    onChange={(e) => handleRoleSearch(e.target.value)}
                                    className="role-search-select"
                                >
                                    <option value="">All Roles</option>
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                    <option value="product_manager">Product Manager</option>
                                    <option value="order_manager">Order Manager</option>
                                    <option value="promotion_manager">Promotion Manager</option>
                                    <option value="financial_manager">Financial Manager</option>
                                </select>
                            </div>
                            
                            <div className="email-search-container">
                                <label htmlFor="emailSearch" className="search-label">Search by Email:</label>
                                <input 
                                    id="emailSearch"
                                    type="text"
                                    value={searchEmail} 
                                    onChange={(e) => handleEmailSearch(e.target.value)}
                                    className="email-search-input"
                                    placeholder="Enter email address..."
                                />
                            </div>
                            
                            {(searchRole || searchEmail) && (
                                <button 
                                    className="clear-all-filters-btn"
                                    onClick={clearAllFilters}
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Age</th>
                                    <th>Address</th>
                                    <th>Role</th>
                                    <th>Loyalty Points</th>
                                    <th>Actions</th>
                                    <th>
                                        <button 
                                            className="download-btn"
                                            onClick={async ()=>{
                                                try {
                                                    // Create a new window for PDF generation
                                                    const printWindow = window.open('', '_blank');
                                                    printWindow.document.write(`
                                                        <html>
                                                            <head>
                                                                <title>Snazzy User Report</title>
                                                                <style>
                                                                    ${document.querySelector('style')?.innerHTML || ''}
                                                                    .pdf-report {
                                                                        font-family: Arial, sans-serif;
                                                                        max-width: 800px;
                                                                        margin: 0 auto;
                                                                        padding: 20px;
                                                                        background: white;
                                                                        color: black;
                                                                    }
                                                                    .pdf-header {
                                                                        text-align: center;
                                                                        margin-bottom: 30px;
                                                                        border-bottom: 2px solid #667eea;
                                                                        padding-bottom: 20px;
                                                                    }
                                                                    .pdf-logo-section {
                                                                        display: flex;
                                                                        align-items: center;
                                                                        justify-content: center;
                                                                        gap: 15px;
                                                                        margin-bottom: 20px;
                                                                    }
                                                                    .pdf-logo {
                                                                        width: 50px;
                                                                        height: 50px;
                                                                        object-fit: contain;
                                                                    }
                                                                    .pdf-title {
                                                                        font-size: 2.5rem;
                                                                        font-weight: bold;
                                                                        color: #667eea;
                                                                        margin: 0;
                                                                    }
                                                                    .pdf-report-title {
                                                                        font-size: 1.8rem;
                                                                        color: #2d3748;
                                                                        margin: 10px 0;
                                                                    }
                                                                    .pdf-date {
                                                                        color: #718096;
                                                                        font-size: 0.9rem;
                                                                        margin: 0;
                                                                    }
                                                                    .pdf-section-title {
                                                                        font-size: 1.4rem;
                                                                        color: #2d3748;
                                                                        margin: 20px 0 15px 0;
                                                                        border-bottom: 1px solid #e2e8f0;
                                                                        padding-bottom: 10px;
                                                                    }
                                                                    .pdf-table {
                                                                        width: 100%;
                                                                        border-collapse: collapse;
                                                                        margin-top: 20px;
                                                                    }
                                                                    .pdf-table th {
                                                                        background: #667eea;
                                                                        color: white;
                                                                        padding: 12px 8px;
                                                                        text-align: left;
                                                                        font-weight: bold;
                                                                        font-size: 0.9rem;
                                                                    }
                                                                    .pdf-table td {
                                                                        padding: 10px 8px;
                                                                        border-bottom: 1px solid #e2e8f0;
                                                                        font-size: 0.85rem;
                                                                    }
                                                                    .pdf-table tr:nth-child(even) {
                                                                        background: #f8fafc;
                                                                    }
                                                                    @media print {
                                                                        body { margin: 0; }
                                                                        .pdf-report { margin: 0; padding: 10px; }
                                                                    }
                                                                </style>
                                                            </head>
                                                            <body>
                                                                <div class="pdf-report">
                                                                    <div class="pdf-header">
                                                                        <div class="pdf-logo-section">
                                                                            <img src="${logo}" alt="Snazzy Logo" class="pdf-logo" />
                                                                            <h1 class="pdf-title">SNAZZY</h1>
                                                                        </div>
                                                                        <div class="pdf-report-info">
                                                                            <h2 class="pdf-report-title">User Report</h2>
                                                                            <p class="pdf-date">Generated on: ${new Date().toLocaleDateString()}</p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div class="pdf-content">
                                                                        <h3 class="pdf-section-title">Users</h3>
                                                                        <table class="pdf-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>Email</th>
                                                                                    <th>Age</th>
                                                                                    <th>Address</th>
                                                                                    <th>Role</th>
                                                                                    <th>Loyalty Points</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                ${users.map(user => `
                                                                                    <tr>
                                                                                        <td>${user.name}</td>
                                                                                        <td>${user.gmail}</td>
                                                                                        <td>${user.age}</td>
                                                                                        <td>${user.address}</td>
                                                                                        <td>${user.role.replace('_', ' ')}</td>
                                                                                        <td>${user.role === 'customer' ? (user.loyaltyPoints ?? 0) : '-'}</td>
                                                                                    </tr>
                                                                                `).join('')}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </body>
                                                        </html>
                                                    `);
                                                    printWindow.document.close();
                                                    printWindow.print();
                                                } catch (e) {
                                                    alert('Error generating PDF: ' + e.message);
                                                }
                                            }}
                                        >
                                            📄 Download PDF
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td>{u.name}</td>
                                        <td>{u.gmail}</td>
                                        <td>{u.age}</td>
                                        <td>{u.address}</td>
                                        <td>
                                            <span className={`role-badge role-${u.role}`}>
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>{u.role === 'customer' ? (u.loyaltyPoints ?? 0) : '-'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="action-btn edit-btn"
                                                    onClick={() => {
                                                        setEditingUser(u._id);
                                                        setEditForm({ name: u.name || "", gmail: u.gmail || "", age: u.age || "", address: u.address || "", role: u.role || "" });
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button 
                                                    className="action-btn delete-btn"
                                                    onClick={async () => {
                                                        if (!window.confirm('Delete this user?')) return;
                                                        const token = localStorage.getItem('token');
                                                        await axios.delete(`http://localhost:5000/user/${u._id}`, { headers: { Authorization: token } });
                                                        await fetchUsers();
                                                    }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                        <td></td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="empty-state">
                                            {searchRole || searchEmail ? 
                                                `No users found matching your search criteria.` : 
                                                'No users found.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {editingUser && (
                    <div className="edit-modal">
                        <h2 className="edit-modal-title">Edit User</h2>
                        <form className="edit-form" onSubmit={async (e) => {
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
                                </select>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="save-btn">Save Changes</button>
                                <button type="button" className="cancel-btn" onClick={()=> setEditingUser(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
}

export default Admin;