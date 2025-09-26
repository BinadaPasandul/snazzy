import axios from "axios";
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Nav from "../Navbar/nav";
import Footer from "../Footer/Footer";


function User(props) {
  const { _id, name, gmail, age, address, role, loyaltyPoints } = props.user;
  
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
    <div>
      <Nav />
      <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>User Details</h1>

        
        <h2>Name:{name}</h2>
        <h2>Gmail:{gmail}</h2>
        <h2>Age:{age}</h2>
        {address && <h2>Address:{address}</h2>}
        {role === 'customer' && <h2>Loyalty Points: {loyaltyPoints}</h2>}
        <NavLink to={`/userdetails/${_id}`}>Update</NavLink>
        <button onClick={deleteHandler}>Delete</button>
      </div>
      <Footer />
    </div>
  );
}

export default User;
