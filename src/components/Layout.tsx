
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import MobileMenu from '@/components/navigation/MobileMenu';
import UserMenu from '@/components/navigation/UserMenu';
import DesktopNav from '@/components/navigation/DesktopNav';
import RoleSwitcher from '@/components/navigation/RoleSwitcher';
import { Menu } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading, session, roles, activeRole } = useAuth();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const isHomePage = location.pathname === '/';
  const isAuthenticated = !!session;

  console.log('Layout - current path:', location.pathname);
  console.log('Layout - user roles:', roles);
  console.log('Layout - active role:', activeRole);

  // Define navigation items based on the active role
  const getNavItems = () => {
    // Common navigation items for all users
    const commonNavItems = [
      { name: 'Accueil', path: '/' },
      { name: 'Recherche', path: '/search' },
      { name: 'Communautés', path: '/communities' },
    ];

    // Public / Guest navigation
    if (!isAuthenticated) {
      return [
        ...commonNavItems,
        { name: 'Agents', path: '/agents' },
        { name: 'Prestataires', path: '/vendors' },
      ];
    }

    // Role-specific navigation items
    switch (activeRole) {
      case 'vendor':
        return [
          ...commonNavItems,
          { name: 'Tableau de bord', path: '/vendor-dashboard' },
          { name: 'Demandes', path: '/service-requests' },
          { name: 'Rendez-vous', path: '/appointments' },
        ];
      case 'tenant':
        return [
          ...commonNavItems,
          { name: 'Tableau de bord', path: '/dashboard' },
          { name: 'Agents', path: '/agents' },
          { name: 'Prestataires', path: '/vendors' },
          { name: 'Maintenance', path: '/maintenance' },
        ];
      case 'landlord':
        return [
          ...commonNavItems,
          { name: 'Tableau de bord', path: '/dashboard' },
          { name: 'Propriétés', path: '/property-management' },
          { name: 'Locataires', path: '/tenants' },
          { name: 'Paiements', path: '/payments' },
          { name: 'Maintenance', path: '/maintenance' },
        ];
      case 'agent':
        return [
          ...commonNavItems,
          { name: 'Tableau de bord', path: '/dashboard' },
          { name: 'Propriétés', path: '/property-management' },
          { name: 'Visites', path: '/viewings' },
          { name: 'Clients', path: '/tenants' },
        ];
      case 'manager':
        return [
          ...commonNavItems,
          { name: 'Tableau de bord', path: '/dashboard' },
          { name: 'Propriétés', path: '/property-management' },
          { name: 'Locataires', path: '/tenants' },
          { name: 'Paiements', path: '/payments' },
          { name: 'Maintenance', path: '/maintenance' },
        ];
      case 'admin':
        return [
          ...commonNavItems,
          { name: 'Tableau de bord', path: '/dashboard' },
          { name: 'Propriétés', path: '/property-management' },
          { name: 'Administration', path: '/admin' },
        ];
      default:
        return commonNavItems;
    }
  };

  const navItems = getNavItems();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link
              to="/"
              className="flex items-center space-x-2"
            >
              <span className="font-bold text-xl">Immob</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <DesktopNav 
            navItems={navItems} 
            isLoggedIn={isAuthenticated} 
            activeRole={activeRole}
          />
          
          {/* Mobile Navigation and Right-side Controls */}
          <div className="flex-1 flex items-center justify-end space-x-2">
            {/* Role Switcher (only visible for authenticated users with multiple roles) */}
            {isAuthenticated && roles.length > 1 && !isMobile && (
              <RoleSwitcher className="mr-2" />
            )}
            
            {isAuthenticated ? (
              <UserMenu 
                user={user!} 
                onSignOut={handleSignOut} 
                activeRole={activeRole} 
                roles={roles}
              />
            ) : (
              <Button variant="default" asChild>
                <Link to="/auth">Se connecter</Link>
              </Button>
            )}
            
            {isMobile && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="md:hidden"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] sm:w-[350px]">
                  <MobileMenu 
                    navItems={navItems} 
                    isLoggedIn={isAuthenticated} 
                    onLinkClick={() => setOpen(false)}
                    activeRole={activeRole}
                    roles={roles}
                  />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Immob. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Layout;
