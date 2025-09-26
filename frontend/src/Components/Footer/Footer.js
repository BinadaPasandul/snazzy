import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    {/* Company Info */}
                    <div className="footer-section">
                        <h3 className="footer-title">SNAZZY</h3>
                        <p className="footer-description">
                            Your premier destination for stylish and comfortable footwear. 
                            Discover the latest trends in shoes with unbeatable quality and service.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <span className="social-icon">📘</span>
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <span className="social-icon">📷</span>
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                <span className="social-icon">🐦</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li>
                                <NavLink to="/" className="footer-link">Home</NavLink>
                            </li>
                            <li>
                                <NavLink to="/products" className="footer-link">Shop</NavLink>
                            </li>
                            <li>
                                <NavLink to="/promotions" className="footer-link">Sales</NavLink>
                            </li>
                            <li>
                                <NavLink to="/myorders" className="footer-link">My Orders</NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Customer Service</h4>
                        <ul className="footer-links">
                            <li>
                                <NavLink to="/feedback" className="footer-link">Feedback</NavLink>
                            </li>
                            <li>
                                <NavLink to="/about" className="footer-link">About Us</NavLink>
                            </li>
                            <li>
                                <NavLink to="/contact" className="footer-link">Contact Us</NavLink>
                            </li>
                            <li>
                                <NavLink to="/help" className="footer-link">Help Center</NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Contact Info</h4>
                        <div className="contact-info">
                            <div className="contact-item">
                                <span className="contact-icon">📍</span>
                                <span>123 Fashion Street, Style City, SC 12345</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">📞</span>
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">✉️</span>
                                <span>info@snazzy.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            © 2024 SNAZZY. All rights reserved.
                        </p>
                        <div className="footer-bottom-links">
                            <NavLink to="/privacy" className="footer-bottom-link">Privacy Policy</NavLink>
                            <NavLink to="/terms" className="footer-bottom-link">Terms of Service</NavLink>
                            <NavLink to="/shipping" className="footer-bottom-link">Shipping Info</NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
