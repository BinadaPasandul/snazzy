import React from "react";
import { Navigate } from "react-router-dom";

const isTokenExpired = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    if (!payload || !payload.exp) return false;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp < nowInSeconds;
  } catch (e) {
    return true;
  }
};

const PublicOnlyRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (token && user && !isTokenExpired(token)) {
    
    const role = user.role;
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "product_manager") return <Navigate to="/productmanager" replace />;
    if (role === "order_manager") return <Navigate to="/ordermanager" replace />;
    if (role === "promotion_manager") return <Navigate to="/promotionmanager" replace />;
    
    return <Navigate to="/userdetails" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
