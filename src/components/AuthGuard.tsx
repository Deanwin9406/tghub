
import React, { useEffect, useState, useCallback, memo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/search', '/communities', '/agents', '/vendors', '/property'];

// Define role-based route access
const ROLE_ROUTES = {
  tenant: ['/dashboard', '/profile', '/favorites', '/kyc'],
  landlord: ['/dashboard', '/profile', '/favorites', '/kyc', '/property-management', '/add-property', '/property/edit'],
  agent: ['/dashboard', '/profile', '/favorites', '/kyc', '/property-management'],
  manager: ['/dashboard', '/profile', '/favorites', '/kyc', '/property-management'],
  admin: ['/dashboard', '/profile', '/favorites', '/kyc', '/property-management', '/add-property', '/property/edit']
};

const AuthGuard = memo(() => {
  const { session, loading, roles } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // Use useCallback to prevent recreating functions on each render
  const checkAuthStatus = useCallback(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  // Helper to check if current path is in a list of routes (with partial matching)
  const isPathInRoutes = useCallback((routes: string[], currentPath: string) => {
    return routes.some(route => {
      // Handle exact match
      if (route === currentPath) return true;
      // Handle path with params (e.g. /property/123)
      if (route.endsWith('/') && currentPath.startsWith(route)) return true;
      return currentPath.startsWith(`${route}/`);
    });
  }, []);

  // Helper to check if user has access to current path based on roles
  const hasRoleAccess = useCallback((userRoles: string[], currentPath: string) => {
    // If user has admin role, they have access to everything
    if (userRoles.includes('admin')) return true;
    
    // Check each role the user has for access
    for (const role of userRoles) {
      if (role in ROLE_ROUTES && isPathInRoutes(ROLE_ROUTES[role as keyof typeof ROLE_ROUTES], currentPath)) {
        return true;
      }
    }
    
    return false;
  }, [isPathInRoutes]);

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
      userRoles: roles,
      currentPath: location.pathname 
    });
  }, [location.pathname, session, loading, isReady, roles]);

  // Show nothing while checking authentication
  if (!isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if the current path is a public route that doesn't require auth
  const isPublicRoute = PUBLIC_ROUTES.some(route => location.pathname === route || 
                                                   location.pathname.startsWith(`${route}/`));

  // If accessing a public route while authenticated, let the user stay there (no forced redirect)
  if (session && isPublicRoute) {
    console.log("Authenticated user accessing public route, allowing access");
    return <Outlet />;
  }

  // If user is not authenticated and trying to access a protected route, redirect to home
  if (!session && !isPublicRoute) {
    console.log("User not authenticated, redirecting to home");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is authenticated but doesn't have the right role for this route
  if (session && !isPublicRoute && !hasRoleAccess(roles, location.pathname)) {
    console.log("User doesn't have access to this route, redirecting to dashboard");
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // User is authenticated and has proper role access, allow navigation
  console.log("User has proper access to:", location.pathname);
  return <Outlet />;
});

export default AuthGuard;
