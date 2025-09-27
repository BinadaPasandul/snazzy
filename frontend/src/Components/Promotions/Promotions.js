import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import './Promotion.css';

function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const navigate = useNavigate();

  const fetchPromotions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/Promotions');
      setPromotions(res.data?.promotions || []);
      setFilteredPromotions(res.data?.promotions || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = promotions.filter(promotion =>
      promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPromotions(filtered);
  }, [searchTerm, promotions]);

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

    return { days, hours, minutes, seconds };
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

  const handleShopNow = () => {
    navigate('/items');
  };

  if (loading) {
    return (
      <div className="promotions-page">
        <Nav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading amazing promotions...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="promotions-page">
        <Nav />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchPromotions} className="retry-btn">Try Again</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="promotions-page">
      <Nav />
      
      {/* Hero Section */}
      <section className="promotions-hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
          <div className="hero-gradient"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-line">Exclusive</span>
            <span className="title-line highlight">Promotions</span>
          </h1>
          <p className="hero-subtitle">
            Discover amazing deals and limited-time offers that will make your shopping experience unforgettable.
          </p>
          <div className="hero-search">
            <div className="search-container">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Grid */}
      <section className="promotions-section">
        <div className="section-header">
          <h2>Current Promotions</h2>
          <p>{filteredPromotions.length} amazing deals waiting for you</p>
        </div>

        {filteredPromotions.length === 0 ? (
          <div className="no-promotions">
            <div className="no-promotions-icon">🎯</div>
            <h3>No promotions found</h3>
            <p>Try adjusting your search or check back later for new deals!</p>
            <button onClick={handleShopNow} className="shop-now-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
              </svg>
              Shop Now
            </button>
          </div>
        ) : (
          <div className="promotions-grid">
            {filteredPromotions.map((promotion) => (
              <div key={promotion._id} className="promotion-card">
                <div className="card-header">
                  {promotion.bannerImage ? (
                    <div className="banner-container">
                      <img
                        src={`http://localhost:5000${promotion.bannerImage}`}
                        alt={promotion.title}
                        className="promotion-banner"
                      />
                      <div className="banner-overlay"></div>
                    </div>
                  ) : (
                    <div className="banner-placeholder">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21,15 16,10 5,21"></polyline>
                      </svg>
                    </div>
                  )}
                  <div className="discount-badge">
                    <span className="discount-percent">{promotion.discount}%</span>
                    <span className="discount-text">OFF</span>
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="promotion-title">{promotion.title}</h3>
                  {promotion.description && (
                    <p className="promotion-description">{promotion.description}</p>
                  )}
                  
                  {promotion.endDate && timers[promotion._id] && (
                    <div className="countdown-container">
                      <div className="countdown-label">Ends in:</div>
                      <div className="countdown-timer">
                        <div className="time-unit">
                          <span className="time-value">{timers[promotion._id].days}</span>
                          <span className="time-label">Days</span>
                        </div>
                        <div className="time-unit">
                          <span className="time-value">{timers[promotion._id].hours}</span>
                          <span className="time-label">Hours</span>
                        </div>
                        <div className="time-unit">
                          <span className="time-value">{timers[promotion._id].minutes}</span>
                          <span className="time-label">Min</span>
                        </div>
                        <div className="time-unit">
                          <span className="time-value">{timers[promotion._id].seconds}</span>
                          <span className="time-label">Sec</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button onClick={handleShopNow} className="shop-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                    </svg>
                    Shop Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Promotions;
