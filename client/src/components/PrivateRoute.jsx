import { useAuth } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { token, tokenSetter } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = new Date().getTime() / 1000;

    if (decoded.exp < currentTime) {
      console.log("Token expired");
      tokenSetter(null);
      throw new Error("Token expired");
    }
  } catch (error) {
    console.log("Invalid token detected", error);
    tokenSetter(null);
    return <Navigate to="/login" replace />;
  }

  return <div>{children}</div>;
};

export default PrivateRoute;
