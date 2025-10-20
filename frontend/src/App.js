import "./App.css";
import React from "react";
import {
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
import Promotionmanager from "./Components/Promotionmanager/promotiondashboard";
import Ordermanager from "./Components/Ordermanager/ordermanager";
import Login from "./Components/Login/Login";
import ForgotPassword from "./Components/Login/ForgotPassword";
import ResetPassword from "./Components/Login/ResetPassword";
import ProtectedRoute from "./Components/ProtectedRoute";
import Userdetails from "./Components/Userdetails/Userdetails";
import UpdateUser from "./Components/User/UpdateUser";
import PublicOnlyRoute from "./Components/PublicOnlyRoute";
import InsertPromotion from "./Components/Promotionmanager/insertpromotion";
import Promotions from "./Components/Promotions/Promotions";
import EditPromotion from "./Components/Promotionmanager/EditPromotion";
import DisplayProducts from "./Components/Productmanager/displayproducts";
import UpdateProduct from  "./Components/Productmanager/UpdateProduct";
import ItemDisplay from  "./Components/Productmanager/itempage";
import ProductDetail from  "./Components/Productmanager/ProductDetail";


import Checkout from "./Components/Checkout/checkout";
import MyOrders from "./Components/MyOrders/myorders";
import Home from "./Components/Home/home";
import ContactUs from "./Components/ContactUs/ContactUs";
import Cart from "./Components/Cart/Cart";

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
          <Route
            path="/contact"
            element={<ContactUs />}
          />
          

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
                <Home />
            }
          />
          <Route
            path="/"
            element={
                <Home />
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
            path="/cart"
            element={<Cart />}
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute role="customer">
                <Checkout />
              </ProtectedRoute>
            }
          />

            <Route
            path="/myorders"
            element={
              <ProtectedRoute role="customer">
                <MyOrders />
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
            path="/refunds"
            element={
              <ProtectedRoute role="order_manager">
                <AdminRefundRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/productmanager"
            element={
              <ProtectedRoute role={["admin", "product_manager"]}>
                <Productmanager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordermanager"
            element={
              <ProtectedRoute role={["admin", "order_manager"]}>
                <Ordermanager />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/promotiondashboard"
            element={
              <ProtectedRoute role={["admin", "promotion_manager"]}>
                <Promotionmanager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/insertpromotion"
            element={
              <ProtectedRoute role={["admin", "promotion_manager"]}>
                <InsertPromotion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/EditPromotion/:id"
            element={
              <ProtectedRoute role={["admin", "promotion_manager"]}>
                <EditPromotion />
              </ProtectedRoute>
            }
          />
                    <Route
            path="/Promotion"
            element={
              
                <Promotions />
              
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
           <Route
            path="/products"
            element={
              <ProtectedRoute role={["admin", "product_manager"]}>
                <DisplayProducts />
              </ProtectedRoute>
            }
          />
           <Route
            path="/items"
            element={
                <ItemDisplay />
            }
          />
             <Route
            path="/products/:id"
            element={
                <ProductDetail />
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute role={["admin", "product_manager"]}>
                <UpdateProduct />
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