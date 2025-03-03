
import React, { useEffect, useState, useCallback, memo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/search', '/communities', '/agents', '/vendors', '/property'];

// Define role-based route access
const ROLE_ROUTES = {
  tenant: ['/dashboard', '/profile', '/favorites', '/kyc'],
  landlord: ['/dashboard', '/profile', '/favorites', '/kyc', '/property-management', '/add-property', '/property/edit'],
  agent: ['/dashboard', '/profile', '/favorites', '/kyc', '/property-management'],
  manager: ['/dashboard', '/profile', '/favorites', '/kyc', '/property-management'],
  admin: ['/dashboard', '/profile', '/favorites', '/kyc', '/property-management', '/add-property', '/property/edit'],
  vendor: ['/vendor-dashboard', '/profile', '/favorites', '/kyc', '/communities']
};

const AuthGuard = memo(() => {
  const { session, loading, roles } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

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
    
    // Vendors get special routing
    if (userRoles.includes('vendor') && currentPath === '/dashboard') {
      // Redirect vendors to vendor dashboard instead of regular dashboard
      window.location.href = '/vendor-dashboard';
      return false;
    }
    
    // Check each role the user has for access
    for (const role of userRoles) {
      if (role in ROLE_ROUTES && isPathInRoutes(ROLE_ROUTES[role as keyof typeof ROLE_ROUTES], currentPath)) {
        return true;
      }
    }
    
    return false;
  }, [isPathInRoutes]);

  // Add debugging for current path
  useEffect(() => {
    console.log("AuthGuard - current location path:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    // Only check auth status once the loading state changes
    checkAuthStatus();
  }, [loading, checkAuthStatus]);

  // Enhanced logging for debugging
  useEffect(() => {
    console.log("AuthGuard - authentication status:", { 
      session: session ? "exists" : "null", 
      loading, 
      isReady,
      userRoles: roles,
      currentPath: location.pathname 
    });
  }, [location.pathname, session, loading, isReady, roles]);

  // Show loading spinner while checking authentication
  if (!isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if the current path is a public route that doesn't require auth
  const isPublicRoute = isPathInRoutes(PUBLIC_ROUTES, location.pathname);

  // If accessing a public route, let users stay there regardless of authentication status
  if (isPublicRoute) {
    console.log("User accessing public route, allowing access");
    return <Outlet />;
  }

  // If user is not authenticated and trying to access a protected route, redirect to login page
  if (!session) {
    console.log("User not authenticated, redirecting to login page");
    return (
      <div className="container mx-auto py-12 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentification Requise</AlertTitle>
          <AlertDescription>
            Veuillez vous connecter pour accéder à cette page.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Navigate to="/" state={{ from: location }} replace />
        </div>
      </div>
    );
  }

  // If user is authenticated but doesn't have the right role for this route
  if (!hasRoleAccess(roles, location.pathname)) {
    console.log("User doesn't have role access to this route:", location.pathname);
    setAccessError(`Vous n'avez pas les permissions pour accéder à cette page. Veuillez contacter un administrateur si vous pensez qu'il s'agit d'une erreur.`);
    
    // Show an access error with a redirect link to dashboard
    return (
      <div className="container mx-auto py-12 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Accès Refusé</AlertTitle>
          <AlertDescription>
            {accessError}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  // User is authenticated and has proper role access, allow navigation
  console.log("User has proper access to:", location.pathname);
  return <Outlet />;
});

export default AuthGuard;
