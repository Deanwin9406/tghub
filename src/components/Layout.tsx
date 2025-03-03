
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { useComparison } from '@/contexts/ComparisonContext';
import { ShoppingBag, Menu } from 'lucide-react';
import AuthDialog from '@/components/AuthDialog';
import MobileMenu from './navigation/MobileMenu';
import DesktopNav from './navigation/DesktopNav';
import UserMenu from './navigation/UserMenu';
import ComparisonDropdown from './navigation/ComparisonDropdown';

// Memoize link components to reduce re-renders
const NavigationLink = memo(({ to, children, className, onClick }: { to: string; children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <Link to={to} className={className} onClick={onClick}>
    {children}
  </Link>
));

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { session, user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { comparisonList, clearComparison } = useComparison();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  // Log current path for debugging - only when path changes
  useEffect(() => {
    console.log("Layout - current path:", location.pathname);
  }, [location.pathname]);

  // Check if the user is only a tenant without management roles
  const isTenantOnly = roles.includes('tenant') && 
    !(roles.includes('landlord') || 
      roles.includes('manager') || 
      roles.includes('agent') || 
      roles.includes('admin'));

  // Use useCallback to prevent recreating functions on each render
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const openAuthDialog = useCallback(() => {
    setAuthDialogOpen(true);
  }, []);

  // Updated to use signOut from AuthContext
  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  // Use regular links for navigation
  const navItems = [
    { name: 'Recherche', path: '/search' },
    { name: 'Agents', path: '/agents' },
    { name: 'Communautés', path: '/communities' },
    { name: 'Prestataires', path: '/vendors' },
  ];

  return (
    <div className="min-h-screen bg-background antialiased">
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={closeMenu}
        navItems={navItems}
        isLoggedIn={!!session}
        isTenantOnly={isTenantOnly}
      />

      {/* Header/Navbar */}
      <header className="z-30 py-4 bg-background border-b sticky top-0">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={toggleMenu}>
                <Menu className="h-6 w-6" />
              </Button>
              <Link to="/" className="flex items-center">
                <ShoppingBag className="mr-2 h-6 w-6 text-primary" />
                <span className="text-xl font-bold">TogoPropConnect</span>
              </Link>
              
              {/* Desktop Nav */}
              <DesktopNav 
                navItems={navItems}
                isLoggedIn={!!session}
                isTenantOnly={isTenantOnly}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <ModeToggle />
              
              {/* Comparison Dropdown */}
              <ComparisonDropdown 
                comparisonList={comparisonList} 
                onClearComparison={clearComparison} 
              />
              
              {session ? (
                <UserMenu user={user} onSignOut={handleSignOut} />
              ) : (
                <Button onClick={openAuthDialog}>Connexion</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default memo(Layout);
