import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from  "./Components/Login/Login"
import Signup from "./Components/Signup/signup"
import Admin from "./Components/Admin/Admin";
import Productmanager from "./Components/Productmanager/productmanager";
import Ordermanager from "./Components/Ordermanager/ordermanager";
import InsertPromotion from "./Components/Promotionmanager/insertpromotion";
import PromotionDashboard from "./Components/Promotionmanager/promotiondashboard";
import Promotions from "./Components/Promotions/Promotions";
import EditPromotion from "./Components/Promotionmanager/EditPromotion";

function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/productmanager" element={<Productmanager />} />
          <Route path="/ordermanager" element={<Ordermanager />} />
          <Route path="/" element={<InsertPromotion />} />
          <Route path="/promotion" element={<PromotionDashboard />} />
          <Route path="/promotion/edit/:id" element={<EditPromotion />} />
          <Route path="/promotions" element={<Promotions />} />
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
