import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from  "./Components/Login/Login"
import Signup from "./Components/Signup/signup"
import Admin from "./Components/Admin/Admin";
import Productmanager from "./Components/Productmanager/productmanager";
import Promotionmanager from "./Components/Promotionmanager/promotionmanager";
import Ordermanager from "./Components/Ordermanager/ordermanager";
import DisplayProducts from "./Components/Productmanager/displayproducts";
import ItemDisplay from "./Components/Productmanager/itempage";
import ProductDetail from "./Components/Productmanager/ProductDetail";




function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Productmanager />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/productmanager" element={<Productmanager />} />
          <Route path="/promotionmanager" element={<Promotionmanager />} />
          <Route path="/" element={<Ordermanager />} />
          <Route path="/products" element={<DisplayProducts />} />
          <Route path="/items" element={<ItemDisplay />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
