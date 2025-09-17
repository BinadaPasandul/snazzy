import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Components/Signup/signup";
import Admin from "./Components/Admin/Admin";
import Productmanager from "./Components/Productmanager/productmanager";
import Promotionmanager from "./Components/Promotionmanager/promotionmanager";
import Ordermanager from "./Components/Ordermanager/ordermanager";
import Login from "./Components/Login/Login";
import ProtectedRoute from "./Components/ProtectedRoute";
import Userdetails from "./Components/Userdetails/Userdetails";
import UpdateUser from "./Components/User/UpdateUser";
import PublicOnlyRoute from "./Components/PublicOnlyRoute";

function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route
            path="/userdetails"
            element={
              <ProtectedRoute>
                <Userdetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userdetails/:id"
            element={
              <ProtectedRoute>
                <UpdateUser />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Userdetails />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/productmanager"
            element={
              <ProtectedRoute role="product_manager">
                <Productmanager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ordermanager"
            element={
              <ProtectedRoute role="order_manager">
                <Ordermanager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/promotionmanager"
            element={
              <ProtectedRoute role="promotion_manager">
                <Promotionmanager />
              </ProtectedRoute>
            }
          />

        
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
