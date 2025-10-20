import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './nav.css';
import logo from '../../assets/logo.png';
import profileIcon from '../../assets/profile.jpg';
import api from '../../utils/api';

function Nav() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // ✅ remove JWT
        navigate('/login');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Update cart item count when component mounts or cart changes
    useEffect(() => {
        const updateCartCount = async () => {
            try {
                const response = await api.get('/cart/count');
                if (response.data && response.data.itemCount !== undefined) {
                    setCartItemCount(response.data.itemCount);
                }
            } catch (error) {
                console.error('Error fetching cart count:', error);
                setCartItemCount(0);
            }
        };

        updateCartCount();

        // Listen for custom cart update events
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo and Brand */}
                <div className="logo-section">
                    <img src={logo} alt="Snazzy Logo" className="logo-img" />
                    <span className="brand-name">SNAZZY</span>
                </div>

                {/* Main Navigation Links (Center) - Only for customers and public */}
                {(!user || user.role === "customer") && (
                    <ul className="nav-links">
                        <li>
                            <NavLink 
                                to="/" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                <button className="nav-btn">Home</button>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/items" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                <button className="nav-btn">Shop</button>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/Promotion" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                <button className="nav-btn">Sales</button>
                            </NavLink>
                        </li>
                        {user && user.role === "customer" && (
                            <li>
                                <NavLink 
                                    to="/myorders" 
                                    className={({ isActive }) => (isActive ? "active" : "")}
                                >
                                    <button className="nav-btn">My Orders</button>
                                </NavLink>
                            </li>
                        )}
                    </ul>
                )}

                {/* Sidebar Toggle for Staff Roles */}
                {user && user.role !== "customer" && (
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        ☰
                    </button>
                )}

                {/* User Section (Right) */}
                <div className="user-section">
                    {user ? (
                        <>
                            {/* For customers, show greeting, cart, profile icon and logout */}
                            {user.role === "customer" && (
                                <>
                                    <div className="customer-greeting">
                                        Hi {user.name}
                                    </div>
                                    
                                    {/* Cart Icon */}
                                    <NavLink 
                                        to="/cart" 
                                        className={({ isActive }) => (isActive ? "active" : "")}
                                    >
                                        <div className="cart-icon-container">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="9" cy="21" r="1"></circle>
                                                <circle cx="20" cy="21" r="1"></circle>
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                            </svg>
                                            {cartItemCount > 0 && (
                                                <span className="cart-badge">{cartItemCount}</span>
                                            )}
                                        </div>
                                    </NavLink>
                                    
                                    <NavLink 
                                        to="/userdetails" 
                                        className={({ isActive }) => (isActive ? "active" : "")}
                                    >
                                        <div className="profile-icon-container">
                                            <img src={profileIcon} alt="Profile" className="profile-icon" />
                                        </div>
                                    </NavLink>
                                    <button className="logout-btn" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </>
                            )}

                            {/* For staff roles, show simple greeting */}
                            {user.role !== "customer" && (
                                <div className="staff-greeting">
                                    Hi {user.name}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Public links */}
                            <NavLink 
                                to="/cart" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                <div className="cart-icon-container">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1"></circle>
                                        <circle cx="20" cy="21" r="1"></circle>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                    </svg>
                                    {cartItemCount > 0 && (
                                        <span className="cart-badge">{cartItemCount}</span>
                                    )}
                                </div>
                            </NavLink>
                            <NavLink 
                                to="/login" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                <button className="nav-btn">Login</button>
                            </NavLink>
                            <NavLink 
                                to="/signup" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                <button className="nav-btn">Join Us</button>
                            </NavLink>
                        </>
                    )}
                </div>
            </div>

            {/* Vertical Sidebar for Staff Roles */}
            {user && user.role !== "customer" && (
                <div className={`vertical-sidebar ${sidebarOpen ? 'show' : ''}`}>
                    <div className="sidebar-content">
                        <div className="sidebar-header">
                            <h3>{user.name}</h3>
                            <span className="role-badge">{user.role}</span>
                        </div>
                        
                        <nav className="sidebar-nav">
                            <NavLink 
                                to="/userdetails" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                <button className="sidebar-btn9">
                                    <span className="btn-icon">👤</span>
                                    Profile
                                </button>
                            </NavLink>

                                    {/* Admin-only dashboard links */}
                                    {user.role === "admin" && (
                                        <>
                                            <NavLink 
                                                to="/admin" 
                                                className={({ isActive }) => (isActive ? "active" : "")}
                                            >
                                                <button className="sidebar-btn9">
                                                    <span className="btn-icon">⚙️</span>
                                                    Admin Dashboard
                                                </button>
                                            </NavLink>

                                            <NavLink 
                                                to="/products" 
                                                className={({ isActive }) => (isActive ? "active" : "")}
                                            >
                                                <button className="sidebar-btn9 admin-access">
                                                    <span className="btn-icon">📦</span>
                                                    Product Dashboard
                                                    <span className="admin-badge">ADMIN</span>
                                                </button>
                                            </NavLink>

                                            <NavLink 
                                                to="/ordermanager" 
                                                className={({ isActive }) => (isActive ? "active" : "")}
                                            >
                                                <button className="sidebar-btn9 admin-access">
                                                    <span className="btn-icon">📋</span>
                                                    Order Dashboard
                                                    <span className="admin-badge">ADMIN</span>
                                                </button>
                                            </NavLink>

                                            <NavLink 
                                                to="/promotiondashboard" 
                                                className={({ isActive }) => (isActive ? "active" : "")}
                                            >
                                                <button className="sidebar-btn9 admin-access">
                                                    <span className="btn-icon">🎯</span>
                                                    Promotion Dashboard
                                                    <span className="admin-badge">ADMIN</span>
                                                </button>
                                            </NavLink>
                                        </>
                                    )}

                                    {/* Individual role dashboards for non-admin roles */}
                                    {user.role === "product_manager" && (
                                        <>
                                        <NavLink 
                                            to="/products" 
                                            className={({ isActive }) => (isActive ? "active" : "")}
                                        >
                                            <button className="sidebar-btn9">
                                                <span className="btn-icon">📦</span>
                                                Product Manager
                                            </button>
                                        </NavLink>
                                        <NavLink 
                                                to="/productmanager" 
                                                className={({ isActive }) => (isActive ? "active" : "")}
                                            >
                                        
                                                <button className="sidebar-btn9 admin-access">
                                                    <span className="btn-icon">📦</span>
                                                    Products
                                                  
                                                </button>
                                            </NavLink>

                                            </>
                                    )}

                                    {user.role === "order_manager" && (
                                        <>
                                        <NavLink 
                                            to="/ordermanager" 
                                            className={({ isActive }) => (isActive ? "active" : "")}
                                        >
                                            <button className="sidebar-btn9">
                                                <span className="btn-icon">📋</span>
                                                Order Manager
                                            </button>
                                        </NavLink>

                                        <NavLink 
                                            to="/refunds" 
                                            className={({ isActive }) => (isActive ? "active" : "")}
                                        >
                                            <button className="sidebar-btn9">
                                                <span className="btn-icon">📦</span>
                                                Refund Requests
                                            </button>
                                        </NavLink> </>
                                    )}

                                    {user.role === "promotion_manager" && (
                                        <NavLink 
                                            to="/promotiondashboard" 
                                            className={({ isActive }) => (isActive ? "active" : "")}
                                        >
                                            <button className="sidebar-btn9">
                                                <span className="btn-icon">🎯</span>
                                                Promotion Manager
                                            </button>
                                        </NavLink>
                                    )}

                                    {user.role === "financial_manager" && (
                                        <NavLink 
                                            to="/financialmanager" 
                                            className={({ isActive }) => (isActive ? "active" : "")}
                                        >
                                            <button className="sidebar-btn9">
                                                <span className="btn-icon">💰</span>
                                                Financial Manager
                                            </button>
                                        </NavLink>
                                    )}

                            <button className="sidebar-logout-btn" onClick={handleLogout}>
                                <span className="btn-icon">🚪</span>
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Nav;
