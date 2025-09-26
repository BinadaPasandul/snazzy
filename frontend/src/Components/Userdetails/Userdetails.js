import React, { useEffect, useRef, useState } from 'react'
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import axios from "axios";
import User from '../User/User';
import { useReactToPrint } from 'react-to-print';
import './Userdetails.css';




const URL = "http://localhost:5000/user/me";
const fetchCurrentUser = async () => {
  const token = localStorage.getItem('token');
  return await axios.get(URL, {
    headers: {
      // Backend reads req.headers["authorization"] directly (no Bearer prefix)
      Authorization: token || ""
    }
  }).then((res) => res.data)
}
function Userdetails() {

  const [users, setUsers] = useState();
  useEffect(()=> {
    fetchCurrentUser().then((data) => setUsers([data.user]));
  },[])

  const ComponentsRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => ComponentsRef.current,
    DocumentTitle:"Users Report",
    onafterprint:()=>alert("Users report successfully downloaded!")
  });

  return (
    <div className="user-profile-container"> 
      <Nav />
      
      <div className="user-profile-card">
        <div className="profile-header">
          <h1 className="profile-title">User Profile</h1>
          <p className="profile-subtitle">Manage your account information and preferences</p>
        </div>

      <div ref={ComponentsRef}>
        {users && users.map((user, i)=> (
            <div key={i} className="user-info">
              <div className="info-section">
                <span className="info-label">Full Name</span>
                <p className="info-value">{user.name}</p>
              </div>
              
              <div className="info-section">
                <span className="info-label">Email Address</span>
                <p className="info-value">{user.gmail}</p>
              </div>
              
              <div className="info-section">
                <span className="info-label">Age</span>
                <p className="info-value">{user.age}</p>
              </div>
              
              {user.address && (
                <div className="info-section">
                  <span className="info-label">Address</span>
                  <p className="info-value">{user.address}</p>
                </div>
              )}
              
              <div className="info-section role-section">
                <span className="info-label">Account Type</span>
                <p className="info-value">{user.role}</p>
              </div>
              
              {user.role === 'customer' && user.loyaltyPoints && (
                <div className="info-section loyalty-section">
                  <span className="info-label">Loyalty Points</span>
                  <p className="info-value">{user.loyaltyPoints}</p>
                </div>
              )}
          </div>
        ))}
      </div>

        <div className="action-buttons">
      {users && users.map((user, i) => (
            <div key={i} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                className="action-btn secondary"
                onClick={() => window.location.href = `/userdetails/${user._id}`}
              >
                <span className="btn-icon">✏️</span>
                Update Profile
              </button>
              
              {user.role === 'customer' && (
                <>
                  <a href="/myorders" className="action-btn">
                    <span className="btn-icon">📦</span>
                    My Orders
                  </a>
                  <a href="/cardlist" className="action-btn secondary">
                    <span className="btn-icon">💳</span>
                    My Cards
                  </a>
                </>
              )}
              
              <button 
                className="action-btn danger"
                onClick={() => {
                  const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
                  if (confirmed) {
                    // Add delete functionality here
                    console.log("Delete account");
                  }
                }}
              >
                <span className="btn-icon">🗑️</span>
                Delete Account
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default Userdetails
