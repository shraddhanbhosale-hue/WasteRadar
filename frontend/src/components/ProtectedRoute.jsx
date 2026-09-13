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

  const userRole = String(user?.role || "CITIZEN").toUpperCase();

  if (
    allowedRoles &&
    !allowedRoles.map((role) => String(role).toUpperCase()).includes(userRole)
  ) {
    if (userRole === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (userRole === "DRIVER") {
      return <Navigate to="/driver" replace />;
    }

    return <Navigate to="/citizen" replace />;
  }

  return children;
}

export default ProtectedRoute;