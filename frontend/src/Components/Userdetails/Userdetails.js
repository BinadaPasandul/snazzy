import React, { useEffect, useRef, useState } from 'react'
import Nav from '../Navbar/nav';
import axios from "axios";
import User from '../User/User';
import { useReactToPrint } from 'react-to-print';



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
    <div> 
      <Nav/>
      

      <div ref={ComponentsRef}>
        {users && users.map((user, i)=> (
          <div key={i}>
            <User user={user}/>
            </div>
        ))}
      </div>
      <a href="/myorders"><button>My orders</button></a>
      <a href="/cardlist"><button>My cards</button></a>
    </div>
  )
}

export default Userdetails
