import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Handle multiple roles (array) or single role (string)
  if (role) {
    if (Array.isArray(role)) {
      // If role is an array, check if user's role is in the array
      if (!role.includes(user.role)) {
        return <Navigate to="/login" replace />;
      }
    } else {
      // If role is a string, check for exact match
      if (user.role !== role) {
        return <Navigate to="/login" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
