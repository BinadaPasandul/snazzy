import axios from "axios";
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";


function User(props) {
  const { _id, name, gmail, age, address, role } = props.user;
  
  const history = useNavigate();

  const deleteHandler = async()=>{
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmed) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/user/${_id}`, {
        headers: { Authorization: token }
      });
      // On successful self-delete (allowed only for customers), log out and go to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      history("/login");
    } catch (e) {
      const msg = e?.response?.data?.message || 'Delete failed';
      alert(msg);
    }
  }

  
  return (
    <div className="profile-card">
      <div className="profile-content">
        <div className="user-info">
          <div className="avatar-section">
            <div className="avatar">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            {role && <div className="role-badge">{role}</div>}
          </div>
          
          <div className="user-details">
            <div className="detail-item">
              <div className="detail-icon">🆔</div>
              <div className="detail-content">
                <div className="detail-label">User ID</div>
                <div className="detail-value">{_id}</div>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-icon">👤</div>
              <div className="detail-content">
                <div className="detail-label">Full Name</div>
                <div className="detail-value">{name}</div>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-icon">📧</div>
              <div className="detail-content">
                <div className="detail-label">Email Address</div>
                <div className="detail-value">{gmail}</div>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-icon">🎂</div>
              <div className="detail-content">
                <div className="detail-label">Age</div>
                <div className="detail-value">{age} years old</div>
              </div>
            </div>
            
            {address && (
              <div className="detail-item">
                <div className="detail-icon">📍</div>
                <div className="detail-content">
                  <div className="detail-label">Address</div>
                  <div className="detail-value">{address}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="action-buttons">
          <NavLink to={`/userdetails/${_id}`} className="action-btn btn-update">
            ✏️ Update Profile
          </NavLink>
          <button onClick={deleteHandler} className="action-btn btn-delete">
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default User;
