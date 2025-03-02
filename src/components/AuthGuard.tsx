
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

export interface AuthGuardProps {
  children?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }: AuthGuardProps) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  console.log("AuthGuard checking session:", session ? "logged in" : "not logged in");
  console.log("Current path:", location.pathname);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    // Show a toast notification that login is required
    toast.error("Connectez-vous pour accéder à cette page");
    
    // Redirect to the home page, but save the current location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default AuthGuard;
