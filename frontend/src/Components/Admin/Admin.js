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
        role: ""
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
    }, []);

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
        
        if (role && role !== '') {
            filtered = filtered.filter(user => user.role === role);
        }
        
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

    const PDFReport = () => (
        <div className="pdf-report1">
            <div className="pdf-header1">
                <div className="pdf-logo-section1">
                    <img src={logo} alt="Snazzy Logo" className="pdf-logo1" />
                    <h1 className="pdf-title1">SNAZZY</h1>
                </div>
                <div className="pdf-report-info1">
                    <h2 className="pdf-report-title1">User Report</h2>
                    <p className="pdf-date1">Generated on: {new Date().toLocaleDateString()}</p>
                    {(searchRole || searchEmail) && (
                        <div className="pdf-filters1">
                            <p><strong>Applied Filters:</strong></p>
                            {searchRole && <p>• Role: {searchRole}</p>}
                            {searchEmail && <p>• Email contains: {searchEmail}</p>}
                            <p><strong>Total Filtered Results: {filteredUsers.length}</strong></p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="pdf-content1">
                <h3 className="pdf-section-title1">
                    {filteredUsers.length === users.length ? 'All Users' : 'Filtered Users'}
                </h3>
                <table className="pdf-table1">
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
                        {filteredUsers.map((user, index) => (
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

        const passwordValidationError = validatePassword(user.password);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return;
        }
        if (user.age < 1) {
            setAgeError("Age must be greater than 0");
            return;
        }


        sendRequest().then(() => {
            alert("Staff Member Added Successfully");
            fetchUsers();
            history("/admin");
        }).catch((err) => {
            alert("Error: " + err.message);
        });
    };

    const sendRequest = async () => {
        const token = localStorage.getItem("token");
        return await axios.post("http://localhost:5000/user", {
            name: String(user.name),
            gmail: String(user.gmail),
            password: String(user.password),
            age: Number(user.age),
            address: String(user.address),
            role: String(user.role)
        }, {
            headers: {
                Authorization: token
            }
        }).then((res) => res.data);
    };

    return (
        <div className="admin-dashboard1">
            <Nav />
            
            <div style={{ display: 'none' }}>
                <PDFReport />
            </div>
            
            <div className="dashboard-header1">
                <h1 className="dashboard-title1">Admin Dashboard</h1>
                <p className="dashboard-subtitle1">Manage users and system settings</p>
            </div>
            
            <div className="dashboard-content1">
                <div className="stats-section1">
                    <div className="stats-grid1">
                        <div className="stat-card1 customers1">
                            <div className="stat-content1">
                                <div className="stat-info1">
                                    <h3 className="stat-title1">Customers</h3>
                                    <p className="stat-value1">{loadingStats ? '...' : userStats.customers}</p>
                                </div>
                                <div className="stat-icon1">
                                    👥
                                </div>
                            </div>
                        </div>
                        
                        <div className="stat-card1 admins1">
                            <div className="stat-content1">
                                <div className="stat-info1">
                                    <h3 className="stat-title1">Admins</h3>
                                    <p className="stat-value1">{loadingStats ? '...' : userStats.admins}</p>
                                </div>
                                <div className="stat-icon1">
                                    👑
                                </div>
                            </div>
                        </div>
                        
                        <div className="stat-card1 product-managers1">
                            <div className="stat-content1">
                                <div className="stat-info1">
                                    <h3 className="stat-title1">Product Managers</h3>
                                    <p className="stat-value1">{loadingStats ? '...' : userStats.productManagers}</p>
                                </div>
                                <div className="stat-icon1">
                                    📦
                                </div>
                            </div>
                        </div>
                        
                        <div className="stat-card1 order-managers1">
                            <div className="stat-content1">
                                <div className="stat-info1">
                                    <h3 className="stat-title1">Order Managers</h3>
                                    <p className="stat-value1">{loadingStats ? '...' : userStats.orderManagers}</p>
                                </div>
                                <div className="stat-icon1">
                                    📋
                                </div>
                            </div>
                        </div>
                        
                        <div className="stat-card1 promotion-managers1">
                            <div className="stat-content1">
                                <div className="stat-info1">
                                    <h3 className="stat-title1">Promotion Managers</h3>
                                    <p className="stat-value1">{loadingStats ? '...' : userStats.promotionManagers}</p>
                                </div>
                                <div className="stat-icon1">
                                    🎯
                                </div>
                            </div>
                        </div>
                        
                        <div className="stat-card1 total-users1">
                            <div className="stat-content1">
                                <div className="stat-info1">
                                    <h3 className="stat-title1">Total Users</h3>
                                    <p className="stat-value1">{loadingStats ? '...' : userStats.totalUsers}</p>
                                </div>
                                <div className="stat-icon1">
                                    👤
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-section1">
                    <h2 className="form-title1">Add Staff Member</h2>
                    <form className="user-form1" onSubmit={handleSubmit}>
                        <div className="form-group1">
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

                        <div className="form-group1">
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

                        <div className="form-group1">
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                onChange={handleInputChange}
                                value={user.password}
                                required
                                placeholder="Enter your password"
                                style={passwordError ? { borderColor: '#dc3545' } : {}}
                            />
                            {passwordError && (
                                <div className="password-error1" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px' }}>
                                    {passwordError}
                                </div>
                            )}
                            <div className="password-requirements1" style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '4px' }}>
                                Password must be at least 5 characters with uppercase, lowercase, and symbol
                            </div>
                        </div>

                        <div className="form-group1">
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
                                style={ageError ? { borderColor: '#dc3545' } : {}}
                            />
                            {ageError && (
                                <div style={{ color: '#dc3545', fontSize: '0.875rem' }}>{ageError}</div>
                            )}
                        </div>

                        <div className="form-group1">
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

                        <div className="form-group1">
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

                        <button type="submit" className="submit-btn1">
                            Add Member
                        </button>
                    </form>
                </div>

                <div className="users-section1">
                    <div className="users-header1">
                        <h2 className="users-title1">All Users</h2>
                        <div className="search-container1">
                            <div className="role-search-container1">
                                <label htmlFor="roleSearch" className="search-label1">Filter by Role:</label>
                                <select 
                                    id="roleSearch"
                                    value={searchRole} 
                                    onChange={(e) => handleRoleSearch(e.target.value)}
                                    className="role-search-select1"
                                >
                                    <option value="">All Roles</option>
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                    <option value="product_manager">Product Manager</option>
                                    <option value="order_manager">Order Manager</option>
                                    <option value="promotion_manager">Promotion Manager</option>
                                </select>
                            </div>
                            
                            <div className="email-search-container1">
                                <label htmlFor="emailSearch" className="search-label1">Search by Email:</label>
                                <input 
                                    id="emailSearch"
                                    type="text"
                                    value={searchEmail} 
                                    onChange={(e) => handleEmailSearch(e.target.value)}
                                    className="email-search-input1"
                                    placeholder="Enter email address..."
                                />
                            </div>
                            
                            {(searchRole || searchEmail) && (
                                <button 
                                    className="clear-all-filters-btn1"
                                    onClick={clearAllFilters}
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="users-table-container1">
                        <table className="users-table1">
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
                                            className="download-btn1"
                                            onClick={async () => {
                                                try {
                                                    const printWindow = window.open('', '_blank');
                                                    printWindow.document.write(`
                                                        <html>
                                                            <head>
                                                                <title>Snazzy User Report</title>
                                                                <style>
                                                                    ${document.querySelector('style')?.innerHTML || ''}
                                                                    .pdf-report1 {
                                                                        font-family: Arial, sans-serif;
                                                                        max-width: 800px;
                                                                        margin: 0 auto;
                                                                        padding: 20px;
                                                                        background: white;
                                                                        color: black;
                                                                    }
                                                                    .pdf-header1 {
                                                                        text-align: center;
                                                                        margin-bottom: 30px;
                                                                        border-bottom: 2px solid #667eea;
                                                                        padding-bottom: 20px;
                                                                    }
                                                                    .pdf-logo-section1 {
                                                                        display: flex;
                                                                        align-items: center;
                                                                        justify-content: center;
                                                                        gap: 15px;
                                                                        margin-bottom: 20px;
                                                                    }
                                                                    .pdf-logo1 {
                                                                        width: 50px;
                                                                        height: 50px;
                                                                        object-fit: contain;
                                                                    }
                                                                    .pdf-title1 {
                                                                        font-size: 2.5rem;
                                                                        font-weight: bold;
                                                                        color: #667eea;
                                                                        margin: 0;
                                                                    }
                                                                    .pdf-report-title1 {
                                                                        font-size: 1.8rem;
                                                                        color: #2d3748;
                                                                        margin: 10px 0;
                                                                    }
                                                                    .pdf-date1 {
                                                                        color: #718096;
                                                                        font-size: 0.9rem;
                                                                        margin: 0;
                                                                    }
                                                                    .pdf-section-title1 {
                                                                        font-size: 1.4rem;
                                                                        color: #2d3748;
                                                                        margin: 20px 0 15px 0;
                                                                        border-bottom: 1px solid #e2e8f0;
                                                                        padding-bottom: 10px;
                                                                    }
                                                                    .pdf-table1 {
                                                                        width: 100%;
                                                                        border-collapse: collapse;
                                                                        margin-top: 20px;
                                                                    }
                                                                    .pdf-table1 th {
                                                                        background: #667eea;
                                                                        color: white;
                                                                        padding: 12px 8px;
                                                                        text-align: left;
                                                                        font-weight: bold;
                                                                        font-size: 0.9rem;
                                                                    }
                                                                    .pdf-table1 td {
                                                                        padding: 10px 8px;
                                                                        border-bottom: 1px solid #e2e8f0;
                                                                        font-size: 0.85rem;
                                                                    }
                                                                    .pdf-table1 tr:nth-child(even) {
                                                                        background: #f8fafc;
                                                                    }
                                                                    @media print {
                                                                        body { margin: 0; }
                                                                        .pdf-report1 { margin: 0; padding: 10px; }
                                                                    }
                                                                </style>
                                                            </head>
                                                            <body>
                                                                <div class="pdf-report1">
                                                                    <div class="pdf-header1">
                                                                        <div class="pdf-logo-section1">
                                                                            <img src="${logo}" alt="Snazzy Logo" class="pdf-logo1" />
                                                                            <h1 class="pdf-title1">SNAZZY</h1>
                                                                        </div>
                                                                        <div class="pdf-report-info1">
                                                                            <h2 class="pdf-report-title1">User Report</h2>
                                                                            <p class="pdf-date1">Generated on: ${new Date().toLocaleDateString()}</p>
                                                                            ${(searchRole || searchEmail) ? `
                                                                                <div class="pdf-filters1">
                                                                                    <p><strong>Applied Filters:</strong></p>
                                                                                    ${searchRole ? `<p>• Role: ${searchRole}</p>` : ''}
                                                                                    ${searchEmail ? `<p>• Email contains: ${searchEmail}</p>` : ''}
                                                                                    <p><strong>Total Filtered Results: ${filteredUsers.length}</strong></p>
                                                                                </div>
                                                                            ` : ''}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div class="pdf-content1">
                                                                        <h3 class="pdf-section-title1">${filteredUsers.length === users.length ? 'All Users' : 'Filtered Users'}</h3>
                                                                        <table class="pdf-table1">
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
                                                                                ${filteredUsers.map(user => `
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
                                            📄 Download {filteredUsers.length === users.length ? 'All Users' : 'Filtered Users'} PDF
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
                                            <span className={`role-badge1 role-${u.role}1`}>
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>{u.role === 'customer' ? (u.loyaltyPoints ?? 0) : '-'}</td>
                                        <td>
                                            <div className="action-buttons1">
                                                <button 
                                                    className="action-btn1 edit-btn1"
                                                    onClick={() => {
                                                        setEditingUser(u._id);
                                                        setEditForm({ name: u.name || "", gmail: u.gmail || "", age: u.age || "", address: u.address || "", role: u.role || "" });
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button 
                                                    className="action-btn1 delete-btn1"
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
                                        <td colSpan={8} className="empty-state1">
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
                    <div className="edit-modal1">
                        <h2 className="edit-modal-title1">Edit User</h2>
                        <form className="edit-form1" onSubmit={async (e) => {
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
                            <div className="form-group1">
                                <label>Name</label>
                                <input value={editForm.name} onChange={(e)=> setEditForm({ ...editForm, name: e.target.value })} />
                            </div>
                            <div className="form-group1">
                                <label>Email</label>
                                <input type="email" value={editForm.gmail} onChange={(e)=> setEditForm({ ...editForm, gmail: e.target.value })} />
                            </div>
                            <div className="form-group1">
                                <label>Age</label>
                                <input type="number" value={editForm.age} onChange={(e)=> setEditForm({ ...editForm, age: e.target.value })} />
                            </div>
                            <div className="form-group1">
                                <label>Address</label>
                                <input value={editForm.address} onChange={(e)=> setEditForm({ ...editForm, address: e.target.value })} />
                            </div>
                            <div className="form-group1">
                                <label>Role</label>
                                <select value={editForm.role} onChange={(e)=> setEditForm({ ...editForm, role: e.target.value })}>
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                    <option value="product_manager">Product Manager</option>
                                    <option value="order_manager">Order Manager</option>
                                    <option value="promotion_manager">Promotion Manager</option>
                                </select>
                            </div>
                            <div className="modal-buttons1">
                                <button type="submit" className="save-btn1">Save Changes</button>
                                <button type="button" className="cancel-btn1" onClick={()=> setEditingUser(null)}>Cancel</button>
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