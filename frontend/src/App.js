import "./App.css";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Payment components
import AddCard from "./Components/Payment/AddCard";
import CardList from "./Components/Payment/CardList";
import PaymentForm from "./Components/Payment/PaymentForm";
import UpdateCard from "./Components/Payment/UpdateCard";

// User/Admin components
import Signup from "./Components/Signup/signup";
import Admin from "./Components/Admin/Admin";
import AdminRefundRequest from "./Components/Admin/AdminRefundRequest"; //senaa
import Productmanager from "./Components/Productmanager/productmanager";
import Promotionmanager from "./Components/Promotionmanager/promotionmanager";
import Ordermanager from "./Components/Ordermanager/ordermanager";
import Login from "./Components/Login/Login";
import ForgotPassword from "./Components/Login/ForgotPassword";
import ResetPassword from "./Components/Login/ResetPassword";
import ProtectedRoute from "./Components/ProtectedRoute";
import Userdetails from "./Components/Userdetails/Userdetails";
import UpdateUser from "./Components/User/UpdateUser";
import PublicOnlyRoute from "./Components/PublicOnlyRoute";

// Initialize Stripe
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

function App() {
  return (
    <Elements stripe={stripePromise}>
      <React.Fragment>
        <Routes>
          {/* Public Routes */}
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
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PublicOnlyRoute>
                <ResetPassword />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Userdetails />
              </ProtectedRoute>
            }
          />
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
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/refunds"
            element={
              <ProtectedRoute role="admin">
                <AdminRefundRequest />
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
          {/* Payment Routes */}
          <Route
            path="/cardlist"
            element={
              <ProtectedRoute>
                <CardList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-card"
            element={
              <ProtectedRoute>
                <AddCard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pay"
            element={
              <ProtectedRoute>
                <PaymentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-card/:cardId"
            element={
              <ProtectedRoute>
                <UpdateCard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </React.Fragment>
    </Elements>
  );
}

export default App;
