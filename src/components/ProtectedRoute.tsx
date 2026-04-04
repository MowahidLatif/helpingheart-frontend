import { Navigate } from "react-router-dom";
import { hasAnyRole, hasPermissions, isAuthenticated } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = "/dashboard",
}: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }
  if (!hasAnyRole(requiredRoles) || !hasPermissions(requiredPermissions)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
