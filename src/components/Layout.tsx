
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import MobileMenu from '@/components/navigation/MobileMenu';
import UserMenu from '@/components/navigation/UserMenu';
import DesktopNav from '@/components/navigation/DesktopNav';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { useMobile } from '@/hooks/use-mobile';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, signOut, isLoading, isAuthenticated, roles } = useAuth();
  const [open, setOpen] = useState(false);
  const isMobile = useMobile();
  const isHomePage = location.pathname === '/';
  const isTenantOnly = roles.includes('tenant') && roles.length === 1;
  const isVendor = roles.includes('vendor');

  console.log('Layout - current path:', location.pathname);

  // Define navigation items based on authenticated state
  const navItems = [
    { name: 'Accueil', path: '/' },
    { name: 'Recherche', path: '/search' },
    { name: 'Communautés', path: '/communities' },
    { name: 'Agents', path: '/agents' },
    { name: 'Prestataires', path: '/vendors' },
  ];

  // Filter out certain navigation items for vendors
  const vendorNavItems = isVendor 
    ? navItems.filter(item => 
        !['Agents', 'Prestataires', 'Recherche'].includes(item.name)
      )
    : navItems;

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
            navItems={isVendor ? vendorNavItems : navItems} 
            isLoggedIn={isAuthenticated} 
            isTenantOnly={isTenantOnly}
            isVendor={isVendor}
          />
          
          {/* Mobile Navigation and Right-side Controls */}
          <div className="flex-1 flex items-center justify-end space-x-2">
            <ThemeToggle />
            
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
                    navItems={isVendor ? vendorNavItems : navItems} 
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
    </div>
  );
};

export default Layout;
