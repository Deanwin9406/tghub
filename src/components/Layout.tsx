
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { useComparison } from '@/contexts/ComparisonContext';
import { ShoppingBag, Menu, X, LogOut, User, Settings } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import AuthDialog from '@/components/AuthDialog';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { session, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { comparisonList, clearComparison } = useComparison();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openAuthDialog = () => {
    setAuthDialogOpen(true);
  };

  // Updated to use signOut from AuthContext
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Directly use Link for navigation instead of custom function
  const navItems = [
    { name: 'Recherche', path: '/search' },
    { name: 'Agents', path: '/agents' },
    { name: 'Communautés', path: '/communities' },
    { name: 'Prestataires', path: '/vendors' },
  ];

  return (
    <div className="min-h-screen bg-background antialiased">
      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r p-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <ShoppingBag className="mr-2 h-6 w-6 text-primary" />
              <span className="text-xl font-bold">TogoPropConnect</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={closeMenu}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ul className="space-y-2 font-medium">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link 
                  to={item.path} 
                  onClick={closeMenu}
                  className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-accent hover:text-accent-foreground"
                >
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
            {session ? (
              <>
                <li>
                  <Link 
                    to="/property-management" 
                    onClick={closeMenu}
                    className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>Mes Propriétés</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/dashboard" 
                    onClick={closeMenu}
                    className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>Tableau de bord</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/favorites" 
                    onClick={closeMenu}
                    className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>Favoris</span>
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
        </div>
      </div>

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
              {/* Desktop Nav Items */}
              <nav className="hidden lg:flex ml-10 space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.name}
                  </Link>
                ))}
                {session && (
                  <>
                    <Link
                      to="/property-management"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      Mes Propriétés
                    </Link>
                    <Link
                      to="/dashboard"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      Tableau de bord
                    </Link>
                    <Link
                      to="/favorites"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      Favoris
                    </Link>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              {comparisonList.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Comparer <Badge className="ml-2">{comparisonList.length}</Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72" align="end">
                    <DropdownMenuLabel>Liste de comparaison</DropdownMenuLabel>
                    <ScrollArea className="h-64">
                      {comparisonList.map((property) => (
                        <DropdownMenuItem key={property.id}>
                          <Link to={`/property/${property.id}`} className="w-full">
                            {property.title}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearComparison}>
                      Effacer la comparaison
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url as string} alt={user?.user_metadata?.full_name as string} />
                        <AvatarFallback>{getInitials(user?.user_metadata?.full_name as string)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Link to="/profile" className="flex items-center w-full">
                        <User className="h-4 w-4 mr-2" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/settings" className="flex items-center w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Paramètres
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

export default Layout;
