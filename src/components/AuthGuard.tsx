
import React, { useEffect, useState, useCallback, memo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthGuard = memo(() => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // Use useCallback to prevent recreating functions on each render
  const checkAuthStatus = useCallback(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  // Add debugging for current path - throttle console logs to reduce overhead
  useEffect(() => {
    console.log("AuthGuard - current location path:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    // Only check auth status once the loading state changes
    checkAuthStatus();
  }, [loading, checkAuthStatus]);

  // Enhanced logging for debugging - only log when values change
  useEffect(() => {
    console.log("AuthGuard - authentication status:", { 
      session: session ? "exists" : "null", 
      loading, 
      isReady,
      currentPath: location.pathname 
    });
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

  // User is authenticated, allow navigation to the requested route without any redirection
  console.log("User is authenticated, allowing access to:", location.pathname);
  return <Outlet />;
});

export default AuthGuard;
