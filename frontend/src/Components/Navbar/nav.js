import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Nav() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // ✅ remove JWT
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <ul>
                {user ? (
                    <>
                        {/* Greeting with role */}
                        <li className="user-greeting">
                            Welcome, {user.name} ({user.role})
                        </li>

                        {/* Profile link */}
                        <li>
                            <NavLink 
                                to="/userdetails" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                <button className="nav-btn">Profile</button>
                            </NavLink>
                        </li>

                        {/* Role-based links */}
                        {user.role === "admin" && (
                            <li>
                                <NavLink 
                                    to="/admin" 
                                    className={({ isActive }) => (isActive ? "active" : "")}
                                >
                                    <button className="nav-btn">Admin Dashboard</button>
                                </NavLink>
                            </li>
                        )}

                        {user.role === "product_manager" && (
                            <li>
                                <NavLink 
                                    to="/productmanager" 
                                    className={({ isActive }) => (isActive ? "active" : "")}
                                >
                                    <button className="nav-btn">Product Manager</button>
                                </NavLink>
                            </li>
                        )}

                        {user.role === "order_manager" && (
                            <li>
                                <NavLink 
                                    to="/ordermanager" 
                                    className={({ isActive }) => (isActive ? "active" : "")}
                                >
                                    <button className="nav-btn">Order Manager</button>
                                </NavLink>
                            </li>
                        )}

                        {user.role === "promotion_manager" && (
                            <li>
                                <NavLink 
                                    to="/promotionmanager" 
                                    className={({ isActive }) => (isActive ? "active" : "")}
                                >
                                    <button className="nav-btn">Promotion Manager</button>
                                </NavLink>
                            </li>
                        )}

                        {user.role === "financial_manager" && (
                            <li>
                                <NavLink 
                                    to="/financialmanager" 
                                    className={({ isActive }) => (isActive ? "active" : "")}
                                >
                                    <button className="nav-btn">Financial Manager</button>
                                </NavLink>
                            </li>
                        )}

                        {/* Logout */}
                        <li>
                            <button className="logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        {/* Public links */}
                        <li>
                            <NavLink 
                                to="/signup" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                <button className="nav-btn">Register</button>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/login" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                <button className="nav-btn">Login</button>
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Nav;
