import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "Patient") return <Navigate to="/patient" replace />;
    if (user.role === "PHC Worker") return <Navigate to="/phc" replace />;
    if (user.role === "Ophthalmologist") return <Navigate to="/doctor" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
