import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from  "./Components/Login/Login"
import Signup from "./Components/Signup/signup"
import Admin from "./Components/Admin/Admin";
import Productmanager from "./Components/Productmanager/productmanager";
import Promotionmanager from "./Components/Promotionmanager/promotionmanager";
import Ordermanager from "./Components/Ordermanager/ordermanager";
import Checkout from "./Components/Checkout/checkout";


function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/log" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/productmanager" element={<Productmanager />} />
          <Route path="/promotionmanager" element={<Promotionmanager />} />
          <Route path="/" element={<Ordermanager />} />
          <Route path="/checkout" element={<Checkout />} />

        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
