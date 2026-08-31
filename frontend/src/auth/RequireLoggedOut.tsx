import React from "react";
import { useAuth } from "./AuthContext";
import AlreadyLoggedInNotice from "./AlreadyLoggedInNotice";

const RequireLoggedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) return <AlreadyLoggedInNotice />;

  return <>{children}</>;
};

export default RequireLoggedOut;
