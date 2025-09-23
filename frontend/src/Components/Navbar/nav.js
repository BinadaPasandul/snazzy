import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';


function Nav() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <ul>
                
                {user ? (
                    <>
                        <li className="user-greeting">Welcome, {user.name}</li>
                        <li>
                            <button className="logout-btn" onClick={handleLogout}>Logout</button>
                        </li>
                    </>
                ) : (
                    <>
                     
                        <li>
                            <NavLink to="/signup" activeClassName="active">
                                <button className="nav-btn">Register</button>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/login" activeClassName="active">
                                <button className="nav-btn">Login</button>
                            </NavLink>
                        </li>
                         <li>
                            <NavLink to="/Promotionmanager" activeClassName="active">
                                <button className="nav-btn">Promotion</button>
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Nav;