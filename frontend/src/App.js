import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from  "./Components/Login/Login"



function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Login />} />
        
          
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
