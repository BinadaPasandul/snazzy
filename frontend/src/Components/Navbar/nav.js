import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './nav.css'; // Import CSS
import logo from '../../assets/logo.png';
 // ✅ Put your logo inside /src/assets folder

function Nav() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="logo" onClick={() => navigate('/')}>
                    <img src={logo} alt="Snazzy Logo" />
                    <span>Snazzy</span>
                </div>

                <ul className="nav-links">
                    {user ? (
                        <>
                            <li className="user-greeting">
                                Hi, {user.name} 
                            </li>

                            <li>
                                <NavLink 
                                    to="/userdetails"
                                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                >
                                    Profile
                                </NavLink>
                            </li>

                            {user.role === "admin" && (
                                <li>
                                    <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                        Admin Dashboard
                                    </NavLink>
                                </li>
                            )}
                            {user.role === "product_manager" && (
                                <li>
                                    <NavLink to="/productmanager" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                        Product Manager
                                    </NavLink>
                                </li>
                            )}
                            {user.role === "order_manager" && (
                                <li>
                                    <NavLink to="/ordermanager" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                        Order Manager
                                    </NavLink>
                                </li>
                            )}
                            {user.role === "promotion_manager" && (
                                <li>
                                    <NavLink to="/promotionmanager" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                        Promotion Manager
                                    </NavLink>
                                </li>
                            )}
                            {user.role === "financial_manager" && (
                                <li>
                                    <NavLink to="/financialmanager" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                        Financial Manager
                                    </NavLink>
                                </li>
                            )}

                            <li>
                                <button className="logout-btn" onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <NavLink to="/signup" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                    Register
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                    Login
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Nav;
