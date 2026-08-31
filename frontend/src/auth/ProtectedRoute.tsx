import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { UserRole } from "./types";

type Props = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
};

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles, redirectTo }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo ?? "/login"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
