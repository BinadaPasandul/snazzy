import React, { useEffect, useRef, useState } from 'react'
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import axios from "axios";
import { useReactToPrint } from 'react-to-print';
import './Userdetails.css';

const URL = "http://localhost:5000/user/me";
const fetchCurrentUser = async () => {
  const token = localStorage.getItem('token');
  return await axios.get(URL, {
    headers: {
      Authorization: token || ""
    }
  }).then((res) => res.data)
}

function Userdetails() {
  const [users, setUsers] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await fetchCurrentUser();
        setUsers([data.user]);
      } catch (err) {
        setError('Failed to load user profile');
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const ComponentsRef = useRef();
  

  if (loading) {
    return (
      <div className="user-profile-container">
        <Nav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-container">
        <Nav />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="user-profile-container"> 
      <Nav />
      
      <div className="profile-wrapper">
        <div className="user-profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">
                <span className="avatar-text">
                  {users && users[0]?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="profile-info">
              <h1 className="profile-title">{users && users[0]?.name}</h1>
              <p className="profile-subtitle">{users && users[0]?.gmail}</p>
              <div className="profile-badge">
                <span className="badge-text">{users && users[0]?.role}</span>
              </div>
            </div>
          </div>

          <div ref={ComponentsRef} className="profile-content">
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">👤</div>
                <div className="info-content">
                  <h3 className="info-label">Full Name</h3>
                  <p className="info-value">{users && users[0]?.name}</p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">📧</div>
                <div className="info-content">
                  <h3 className="info-label">Email Address</h3>
                  <p className="info-value">{users && users[0]?.gmail}</p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">🎂</div>
                <div className="info-content">
                  <h3 className="info-label">Age</h3>
                  <p className="info-value">{users && users[0]?.age} years old</p>
                </div>
              </div>
              
              {users && users[0]?.address && (
                <div className="info-card">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <h3 className="info-label">Address</h3>
                    <p className="info-value">{users[0].address}</p>
                  </div>
                </div>
              )}
              
              {users && users[0]?.role === 'customer' && users[0]?.loyaltyPoints && (
                <div className="info-card loyalty-card">
                  <div className="info-icon">⭐</div>
                  <div className="info-content">
                    <h3 className="info-label">Loyalty Points</h3>
                    <p className="info-value">{users[0].loyaltyPoints} points</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="action-section">
            <div className="action-buttons">
              <button 
                className="action-btn primary"
                onClick={() => window.location.href = `/userdetails/${users && users[0]?._id}`}
              >
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Profile
              </button>
              
              {users && users[0]?.role === 'customer' && (
                <>
                  <a href="/myorders" className="action-btn secondary">
                    <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                    My Orders
                  </a>
                  <a href="/cardlist" className="action-btn secondary">
                    <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Payment Cards
                  </a>
                </>
              )}
              
             
              
              <button 
                className="action-btn danger"
                onClick={() => {
                  const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
                  if (confirmed) {
                    console.log("Delete account");
                  }
                }}
              >
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default Userdetails
