import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Promotion.css'; // Modern CSS
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import { Navigate } from 'react-router-dom';

function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL = 'http://localhost:5000'; // Your backend host

  const fetchPromotions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${BACKEND_URL}/Promotions`);
      setPromotions(res.data?.promotions || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Countdown calculation
  const getCountdown = (endDate) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const distance = end - now;

    if (distance <= 0) return "Expired";

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Countdown timers state
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimers = {};
      promotions.forEach((p) => {
        if (p.endDate) updatedTimers[p._id] = getCountdown(p.endDate);
      });
      setTimers(updatedTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [promotions]);

  if (loading) return (
    <div className="promotions-page">
      <Nav />
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading promotions...</p>
      </div>
      <Footer />
    </div>
  );
  
  if (error) return (
    <div className="promotions-page">
      <Nav />
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Oops! Something went wrong</h2>
        <p className="error-message">Error loading promotions: {error}</p>
        <button className="retry-btn" onClick={fetchPromotions}>Try Again</button>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="promotions-page">
      <Nav />

      {/* Hero Section */}
      <section className="promotions-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-particles"></div>
        </div>
        <div className="promotions-hero-content">
          <h1 className="promotions-title">
            Unlock <span className="title-highlight">Exclusive Deals</span>
          </h1>
          <p className="promotions-subtitle">
            Limited-time offers, seasonal sales, and special discounts crafted just for you.
            Shop smarter and save more with Snazzy promotions.
          </p>
          <div className="promotions-actions">
            <button className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              View Hot Deals
            </button>
            <button className="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
              </svg>
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Promotions Grid */}
      <section className="promotions-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Current Promotions</h2>
            <p className="section-subtitle">Don't miss out on these amazing deals</p>
          </div>
          
          <div className="promotions-container">
            {promotions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎁</div>
                <h3 className="empty-title">No promotions available</h3>
                <p className="empty-message">Check back soon for exciting deals!</p>
              </div>
            ) : (
              promotions.map((p, index) => (
                <div key={p._id} className="promotion-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-background">
                    <div className="card-pattern"></div>
                    <div className="card-gradient"></div>
                  </div>
                  
                  <div className="card-content">
                    {p.bannerImage ? (
                      <div className="promotion-banner-container">
                        <img
                          src={`${BACKEND_URL}${p.bannerImage}`}
                          alt={p.title}
                          className="promotion-banner"
                        />
                        <div className="banner-overlay"></div>
                      </div>
                    ) : (
                      <div className="promotion-banner-container">
                        <div className="promotion-banner placeholder-banner">
                          <div className="placeholder-icon">🎯</div>
                        </div>
                        <div className="banner-overlay"></div>
                      </div>
                    )}
                    
                    <div className="promotion-info">
                      <h3 className="promotion-title">{p.title}</h3>
                      {p.description && (
                        <p className="promotion-description">{p.description}</p>
                      )}
                      
                      <div className="promotion-details">
                        <div className="promotion-discount">
                          <span className="discount-label">Save</span>
                          <span className="discount-value">{p.discount}%</span>
                        </div>
                        
                        {p.endDate && (
                          <div className="promotion-countdown">
                            <div className="countdown-label">Ends in</div>
                            <div className="countdown-timer">
                              {timers[p._id] || "Loading..."}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button className="promotion-btn" 
                      >
                        <span>View Details</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Promotions;
