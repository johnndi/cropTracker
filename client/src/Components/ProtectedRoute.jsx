import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isLoggedIn, user } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to their appropriate dashboard
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === "agent") {
      return <Navigate to="/agent" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};
