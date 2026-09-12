import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("wasteradar_token");
  const userData = localStorage.getItem("wasteradar_user");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("wasteradar_token");
    localStorage.removeItem("wasteradar_user");

    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "DRIVER") {
      return <Navigate to="/driver" replace />;
    }

    return <Navigate to="/citizen" replace />;
  }

  return children;
}

export default ProtectedRoute;