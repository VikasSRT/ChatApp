import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";

const PublicRoute = ({ children }) => {
  const { token, tokenSetter } = useAuth();
  const location = useLocation();

  // If no token exists, allow access to public routes
  if (!token) return children;

  try {
    // Validate token expiration
    const decoded = jwtDecode(token);
    const currentTime = new Date().getTime() / 1000;

    // If token is expired, clear it and allow access
    if (decoded.exp < currentTime) {
      tokenSetter(null);
      return children;
    }

    // If valid token exists, redirect to home
    // eslint-disable-next-line
    return <Navigate to="/" replace state={{ from: location }} />;
  } catch (error) {
    console.log("token error", error);
    tokenSetter(null);
    return children;
  }
};

export default PublicRoute;
