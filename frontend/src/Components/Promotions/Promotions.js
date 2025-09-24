import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Promotion.css'; // Modern CSS

function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPromotions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/Promotions');
      setPromotions(res.data?.Promotions || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // countdown calculation
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

  // Local countdown timers state
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

  if (loading) return <div>Loading promotions...</div>;
  if (error) return <div>Error loading promotions: {error}</div>;

  return (
    <div className="promotions-container">
      {promotions.length === 0 ? (
        <div>No promotions available.</div>
      ) : (
        promotions.map((p) => (
          <div key={p._id} className="promotion-card">
            {p.bannerImage ? (
              <img src={p.bannerImage} alt={p.title} className="promotion-banner" />
            ) : (
              <div className="promotion-banner" style={{ background: '#f3f4f6' }} />
            )}
            <h3 className="promotion-title">{p.title}</h3>
            {p.description && <p className="promotion-description">{p.description}</p>}
            <p className="promotion-discount">Discount: {p.discount}%</p>
            {p.endDate && (
              <div className="promotion-countdown">
                Ends in: {timers[p._id] || "Loading..."}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Promotions;
