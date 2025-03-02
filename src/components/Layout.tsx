
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ToggleTheme } from '@/components/ToggleTheme';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Menu, Home, Search, Building, Wrench, CreditCard, MessageSquare, User, Heart, Users, LogOut, UserPlus, Key } from 'lucide-react';
import AuthDialog from '@/components/AuthDialog';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, signOut, roles } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isLandlord = roles.includes('landlord');
  const isTenant = roles.includes('tenant');
  const isManager = roles.includes('manager');
  const isAgent = roles.includes('agent');

  // Define navigation items based on roles
  const publicNavigationItems = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Recherche', href: '/search', icon: Search },
    { name: 'Agents', href: '/agents', icon: Users },
    { name: 'Favoris', href: '/favorites', icon: Heart },
  ];
  
  const getTenantItems = () => [
    { name: 'Tableau de bord', href: '/dashboard', icon: Building },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Paiements', href: '/payments', icon: CreditCard },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
  ];
  
  const getLandlordItems = () => [
    { name: 'Tableau de bord', href: '/dashboard', icon: Building },
    { name: 'Mes propriétés', href: '/property-management', icon: Building },
    { name: 'Locataires', href: '/leases', icon: Users },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Paiements', href: '/payments', icon: CreditCard },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
  ];
  
  const getAgentItems = () => [
    { name: 'Tableau de bord', href: '/agent-dashboard', icon: Building },
    { name: 'Propriétés', href: '/property-management', icon: Building },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Communautés', href: '/communities', icon: Users },
  ];
  
  const getManagerItems = () => [
    { name: 'Tableau de bord', href: '/dashboard', icon: Building },
    { name: 'Propriétés', href: '/property-management', icon: Building },
    { name: 'Locataires', href: '/leases', icon: Users },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Paiements', href: '/payments', icon: CreditCard },
    { name: 'Prestataires', href: '/vendors', icon: Users },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
  ];

  // Combine navigation items based on authentication status and role
  let navigationItems = [...publicNavigationItems];
  
  if (user) {
    if (isTenant) {
      navigationItems = [...navigationItems, ...getTenantItems()];
    } else if (isLandlord) {
      navigationItems = [...navigationItems, ...getLandlordItems()];
    } else if (isAgent) {
      navigationItems = [...navigationItems, ...getAgentItems()];
    } else if (isManager) {
      navigationItems = [...navigationItems, ...getManagerItems()];
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background sticky top-0 z-50 border-b">
        <div className="container flex items-center h-16 py-4">
          <Link to="/" className="mr-4 font-bold text-2xl">
            TogoProp
          </Link>
          
          <div className="ml-auto flex items-center space-x-4">
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {navigationItems.slice(0, 6).map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <Link to={item.href} className={cn(
                      "relative block py-2 rounded-md transition-colors hover:bg-secondary hover:text-secondary-foreground data-[active]:bg-secondary/50 data-[active]:text-secondary-foreground px-3",
                      location.pathname === item.href ? "bg-secondary/50 text-secondary-foreground" : "text-muted-foreground"
                    )}>
                      {item.name}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            
            <ToggleTheme />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
                    <AvatarFallback>{profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Se déconnecter
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/auth-page">
                  <Button size="sm" variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    S'inscrire
                  </Button>
                </Link>
                <Link to="/auth-page">
                  <Button size="sm">
                    <Key className="mr-2 h-4 w-4" />
                    Se connecter
                  </Button>
                </Link>
              </div>
            )}
            
            <Sheet>
              <SheetTrigger className="md:hidden">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="right" className="sm:w-2/3 md:w-1/2 lg:w-1/3">
                <SheetHeader className="space-y-2">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Explorez les différentes sections de notre plateforme.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-2 py-2 hover:bg-secondary rounded-md px-3 w-full",
                        location.pathname === item.href ? "bg-secondary/50 text-secondary-foreground" : ""
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  
                  {user ? (
                    <div className="mt-4 space-y-2">
                      <Link 
                        to="/profile" 
                        className={cn(
                          "flex items-center space-x-2 py-2 hover:bg-secondary rounded-md px-3 w-full",
                          location.pathname === '/profile' ? "bg-secondary/50 text-secondary-foreground" : ""
                        )}
                      >
                        <User className="h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center" 
                        onClick={signOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Se déconnecter
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <Link to="/auth-page">
                        <Button className="w-full" variant="outline">
                          <UserPlus className="mr-2 h-4 w-4" />
                          S'inscrire
                        </Button>
                      </Link>
                      <Link to="/auth-page">
                        <Button className="w-full">
                          <Key className="mr-2 h-4 w-4" />
                          Se connecter
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-background border-t py-8">
        <div className="container text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TogoProp. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
