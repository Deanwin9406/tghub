
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
  const { session, user } = useAuth();
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    navigate('/');
  };

  // Modified navigation function to fix routing issues
  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path);
    closeMenu();
    // Use setTimeout to ensure React's state updates complete before navigation
    setTimeout(() => {
      navigate(path);
    }, 0);
  };

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
            <button onClick={() => handleNavigation('/')} className="flex items-center">
              <ShoppingBag className="mr-2 h-6 w-6 text-primary" />
              <span className="text-xl font-bold">TogoPropConnect</span>
            </button>
            <Button variant="ghost" size="icon" onClick={closeMenu}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ul className="space-y-2 font-medium">
            {navItems.map((item) => (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation(item.path)}
                  className="flex w-full items-center p-2 text-left justify-start"
                >
                  <span>{item.name}</span>
                </Button>
              </li>
            ))}
            {session ? (
              <>
                <li>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/property-management')}
                    className="flex w-full items-center p-2 text-left justify-start"
                  >
                    <span>Mes Propriétés</span>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/dashboard')}
                    className="flex w-full items-center p-2 text-left justify-start"
                  >
                    <span>Tableau de bord</span>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/favorites')}
                    className="flex w-full items-center p-2 text-left justify-start"
                  >
                    <span>Favoris</span>
                  </Button>
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
              <Button variant="ghost" onClick={() => handleNavigation('/')} className="flex items-center">
                <ShoppingBag className="mr-2 h-6 w-6 text-primary" />
                <span className="text-xl font-bold">TogoPropConnect</span>
              </Button>
              {/* Desktop Nav Items */}
              <nav className="hidden lg:flex ml-10 space-x-4">
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    onClick={() => handleNavigation(item.path)}
                    className="px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.name}
                  </Button>
                ))}
                {session && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/property-management')}
                      className="px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Mes Propriétés
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/dashboard')}
                      className="px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Tableau de bord
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/favorites')}
                      className="px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Favoris
                    </Button>
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
                        <DropdownMenuItem key={property.id} onClick={() => handleNavigation(`/property/${property.id}`)}>
                          {property.title}
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
                    <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
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
