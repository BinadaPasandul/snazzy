import React, { useEffect, useRef, useState } from 'react'
import Nav from '../Navbar/nav';
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
      <Nav/>
      
      <div className="profile-header">
        <h1>User Profile</h1>
      </div>

      <div ref={ComponentsRef}>
        {users && users.map((user, i)=> (
          <div key={i}>
            <User user={user}/>
          </div>
        ))}
      </div>
      
      <div className="action-buttons">
        <button onClick={handlePrint} className="action-btn btn-download">
          📄 Download Report
        </button>
      </div>
    </div>
  )
}

export default Userdetails
