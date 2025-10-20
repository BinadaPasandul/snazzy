import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PromotionBanner.css';

const PromotionBanner = () => {
  const [newestPromotion, setNewestPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const BACKEND_URL = 'http://localhost:5000';

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    // Only fetch promotions if user is logged in
    if (!isLoggedIn) return;

    const fetchNewestPromotion = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/Promotions`);
        const promotions = response.data?.promotions || [];
        
        console.log('Fetched promotions:', promotions);
        
        if (promotions.length > 0) {
          // Get the newest promotion (most recently created)
          const sortedPromotions = promotions.sort((a, b) => {
            // Try to use createdAt first, then fall back to _id comparison
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // If no createdAt, use _id comparison (MongoDB ObjectId contains timestamp)
            return b._id.localeCompare(a._id);
          });
          const newest = sortedPromotions[0];
          
          console.log('All promotions sorted:', sortedPromotions);
          console.log('Newest promotion (first in sorted array):', newest);
          
          // Only show if it has a banner image
          if (newest.bannerImage) {
            setNewestPromotion(newest);
            setIsVisible(true);
          } else {
            setNewestPromotion(null);
            setIsVisible(false);
          }
        } else {
          setNewestPromotion(null);
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Error fetching newest promotion:', error);
        setNewestPromotion(null);
        setIsVisible(false);
      } finally {
        setLoading(false);
      }
    };

    fetchNewestPromotion();

    // Set up interval to check for new promotions every 10 seconds
    const interval = setInterval(fetchNewestPromotion, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [isLoggedIn]);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
  };

  const handleBannerClick = () => {
    // Navigate to promotions page
    window.location.href = '/Promotion';
  };

  // Don't show if not logged in, loading, no promotion, or already closed
  if (!isLoggedIn || loading || !newestPromotion || isClosed) {
    return null;
  }

  return (
    <div className={`promotion-banner-popup ${isVisible ? 'visible' : ''}`}>
      <div className="banner-overlay" onClick={handleClose}></div>
      <div className="banner-container">
        <button className="close-button" onClick={handleClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="banner-content" onClick={handleBannerClick}>
          <img 
            src={`${BACKEND_URL}${newestPromotion.bannerImage}`}
            alt={newestPromotion.title}
            className="banner-image"
          />
          <div className="banner-overlay-content">
            <div className="promotion-info">
              <h3 className="promotion-title">{newestPromotion.title}</h3>
              {newestPromotion.description && (
                <p className="promotion-description">{newestPromotion.description}</p>
              )}
              <div className="discount-badge">
                {newestPromotion.discount}% OFF
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionBanner;
