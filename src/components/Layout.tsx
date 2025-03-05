
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import MobileMenu from '@/components/navigation/MobileMenu';
import UserMenu from '@/components/navigation/UserMenu';
import DesktopNav from '@/components/navigation/DesktopNav';
import { Menu } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, signOut, loading, session, roles } = useAuth();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const isHomePage = location.pathname === '/';
  const isTenantOnly = roles.includes('tenant') && roles.length === 1;
  const isVendor = roles.includes('vendor');
  const isLandlord = roles.includes('landlord');
  const isAgent = roles.includes('agent');
  const isManager = roles.includes('manager');
  const isAdmin = roles.includes('admin');
  const isAuthenticated = !!session;

  console.log('Layout - current path:', location.pathname);
  console.log('Layout - user roles:', roles);

  // Define common navigation items
  const commonNavItems = [
    { name: 'Accueil', path: '/' },
    { name: 'Recherche', path: '/search' },
    { name: 'Communautés', path: '/communities' },
  ];

  // Define navigation items based on user role
  const roleSpecificNavItems = () => {
    // Public / Guest navigation
    if (!isAuthenticated) {
      return [
        ...commonNavItems,
        { name: 'Agents', path: '/agents' },
        { name: 'Prestataires', path: '/vendors' },
      ];
    }

    // Vendor-specific navigation
    if (isVendor) {
      return [
        ...commonNavItems,
        { name: 'Tableau de bord', path: '/vendor-dashboard' },
        { name: 'Demandes', path: '/service-requests' },
        { name: 'Rendez-vous', path: '/appointments' },
      ];
    }

    // Tenant-specific navigation
    if (isTenantOnly) {
      return [
        ...commonNavItems,
        { name: 'Tableau de bord', path: '/dashboard' },
        { name: 'Agents', path: '/agents' },
        { name: 'Prestataires', path: '/vendors' },
        { name: 'Maintenance', path: '/maintenance' },
      ];
    }

    // Landlord, Agent, Manager or Admin navigation
    const managerNavItems = [
      ...commonNavItems,
      { name: 'Tableau de bord', path: '/dashboard' },
      { name: 'Propriétés', path: '/property-management' },
      { name: 'Locataires', path: '/tenants' },
      { name: 'Paiements', path: '/payments' },
      { name: 'Maintenance', path: '/maintenance' },
    ];

    // Add agent-specific items
    if (isAgent) {
      managerNavItems.push({ name: 'Visites', path: '/viewings' });
    }

    // Add admin-specific items
    if (isAdmin) {
      managerNavItems.push({ name: 'Administration', path: '/admin' });
    }

    return managerNavItems;
  };

  const navItems = roleSpecificNavItems();

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
            isTenantOnly={isTenantOnly}
            isVendor={isVendor}
          />
          
          {/* Mobile Navigation and Right-side Controls */}
          <div className="flex-1 flex items-center justify-end space-x-2">
            {/* We removed ThemeToggle since it was causing an error */}
            
            {isAuthenticated ? (
              <UserMenu user={user!} onSignOut={handleSignOut} isVendor={isVendor} />
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
                    isTenantOnly={isTenantOnly}
                    onLinkClick={() => setOpen(false)}
                    isVendor={isVendor}
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
