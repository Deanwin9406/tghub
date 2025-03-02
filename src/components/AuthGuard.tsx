
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthGuard = () => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only set isReady once loading is complete
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  // Enhanced logging for debugging
  useEffect(() => {
    console.log("AuthGuard - current location:", location.pathname);
    console.log("AuthGuard - authentication status:", { session, loading, isReady });
  }, [location.pathname, session, loading, isReady]);

  // Show nothing while checking authentication
  if (!isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to home with the intended location
  if (!session) {
    console.log("User not authenticated, redirecting to home");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the protected route
  console.log("User authenticated, rendering protected route:", location.pathname);
  return <Outlet />;
};

export default AuthGuard;
