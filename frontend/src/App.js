import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from  "./Components/Login/Login"
import Signup from "./Components/Signup/Signup"
import Admin from "./Components/Admin/Admin";



function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
