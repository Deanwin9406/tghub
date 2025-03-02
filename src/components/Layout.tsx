
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from '@/components/ModeToggle';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Menu, X } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navigationItems = [
    { name: 'Accueil', href: '/' },
    { name: 'Recherche', href: '/search' },
    { name: 'Agents', href: '/agents' },
    { name: 'Favoris', href: '/favorites' },
    { name: 'Tableau de bord', href: '/dashboard', protected: true },
    { name: 'Annonces', href: '/property-management', protected: true },
    { name: 'Communautés', href: '/communities', protected: true },
  ];

  const protectedNavigationItems = navigationItems.filter(item => !item.protected);

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
                {navigationItems.map((item) => (
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
            
            <ModeToggle />
            
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
              <Link to="/auth">
                <Button size="sm">Se connecter</Button>
              </Link>
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
                      className="flex items-center space-x-2 py-2 hover:bg-secondary rounded-md px-3 w-full"
                    >
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  
                  {user ? (
                    <div className="mt-4 space-y-2">
                      <Link to="/profile" className="flex items-center space-x-2 py-2 hover:bg-secondary rounded-md px-3 w-full">
                        <span>Profil</span>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
                        Se déconnecter
                      </Button>
                    </div>
                  ) : (
                    <Link to="/auth">
                      <Button size="sm" className="w-full">Se connecter</Button>
                    </Link>
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
