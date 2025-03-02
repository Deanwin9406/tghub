import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Home, User, Menu, X, LogOut, MessageCircle, Bell, FileText, Settings, Briefcase, Users, MapPin, Wrench, CreditCard, BuildingIcon, HandshakeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, roles, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isLandlord = roles.includes('landlord');
  const isTenant = roles.includes('tenant');
  const isAdmin = roles.includes('admin');

  const getInitials = () => {
    if (profile) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-apple py-4 px-6",
          isScrolled ? "bg-white/90 backdrop-blur-lg shadow-sm" : "bg-transparent"
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl bg-gradient-to-r from-togo-green via-togo-yellow to-togo-red bg-clip-text text-transparent">
              TogoProp
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium hover:text-primary transition-colors">Accueil</Link>
            <Link to="/search" className="font-medium hover:text-primary transition-colors">Rechercher</Link>
            <Link to="/communities" className="font-medium hover:text-primary transition-colors">Communautés</Link>
            <Link to="/vendors" className="font-medium hover:text-primary transition-colors">Prestataires</Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageCircle size={20} />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Home className="mr-2 h-4 w-4" />
                      Tableau de bord
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Messages
                    </DropdownMenuItem>
                    {isTenant && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/leases')}>
                          <FileText className="mr-2 h-4 w-4" />
                          Mes baux
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/payments')}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Paiements
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/maintenance')}>
                          <Wrench className="mr-2 h-4 w-4" />
                          Maintenance
                        </DropdownMenuItem>
                      </>
                    )}
                    {isLandlord && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/property-management')}>
                          <BuildingIcon className="mr-2 h-4 w-4" />
                          Mes propriétés
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/leases')}>
                          <HandshakeIcon className="mr-2 h-4 w-4" />
                          Contrats
                        </DropdownMenuItem>
                      </>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Administration
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {isLandlord && (
                  <Button size="sm" className="btn-effect" onClick={() => navigate('/property-management')}>
                    Publier une annonce
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="btn-effect" onClick={() => navigate('/auth')}>
                  <User size={18} className="mr-1" /> Connexion
                </Button>
                <Button size="sm" className="btn-effect" onClick={() => navigate('/auth?tab=register')}>
                  Inscription
                </Button>
              </>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu size={24} />
          </Button>
        </div>
      </header>
      
      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-background flex flex-col transition-transform duration-300 ease-apple transform md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6">
          <span className="font-bold text-2xl bg-gradient-to-r from-togo-green via-togo-yellow to-togo-red bg-clip-text text-transparent">
            TogoProp
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMobileMenu}
          >
            <X size={24} />
          </Button>
        </div>
        
        {user ? (
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <nav className="flex flex-col space-y-6">
              <Link to="/dashboard" className="flex items-center space-x-2 font-medium text-xl">
                <Home size={20} />
                <span>Tableau de bord</span>
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 font-medium text-xl">
                <User size={20} />
                <span>Mon profil</span>
              </Link>
              <Link to="/messages" className="flex items-center space-x-2 font-medium text-xl">
                <MessageCircle size={20} />
                <span>Messages</span>
              </Link>
              
              {isTenant && (
                <>
                  <Link to="/leases" className="flex items-center space-x-2 font-medium text-xl">
                    <FileText size={20} />
                    <span>Mes baux</span>
                  </Link>
                  <Link to="/payments" className="flex items-center space-x-2 font-medium text-xl">
                    <CreditCard size={20} />
                    <span>Paiements</span>
                  </Link>
                  <Link to="/maintenance" className="flex items-center space-x-2 font-medium text-xl">
                    <Wrench size={20} />
                    <span>Maintenance</span>
                  </Link>
                </>
              )}
              
              {isLandlord && (
                <>
                  <Link to="/property-management" className="flex items-center space-x-2 font-medium text-xl">
                    <BuildingIcon size={20} />
                    <span>Mes propriétés</span>
                  </Link>
                  <Link to="/leases" className="flex items-center space-x-2 font-medium text-xl">
                    <HandshakeIcon size={20} />
                    <span>Contrats</span>
                  </Link>
                </>
              )}
              
              <Link to="/communities" className="flex items-center space-x-2 font-medium text-xl">
                <Users size={20} />
                <span>Communautés</span>
              </Link>
              
              <Link to="/vendors" className="flex items-center space-x-2 font-medium text-xl">
                <Briefcase size={20} />
                <span>Prestataires</span>
              </Link>
              
              {isAdmin && (
                <Link to="/admin" className="flex items-center space-x-2 font-medium text-xl">
                  <Settings size={20} />
                  <span>Administration</span>
                </Link>
              )}
              
              <Button onClick={handleSignOut} variant="outline" className="w-full justify-start">
                <LogOut size={20} className="mr-2" />
                <span>Déconnexion</span>
              </Button>
            </nav>
          </div>
        ) : (
          <nav className="flex flex-col p-6 space-y-6">
            <Link to="/" className="font-medium text-xl hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link to="/search" className="font-medium text-xl hover:text-primary transition-colors">
              Rechercher
            </Link>
            <Link to="/communities" className="font-medium text-xl hover:text-primary transition-colors">
              Communautés
            </Link>
            <Link to="/vendors" className="font-medium text-xl hover:text-primary transition-colors">
              Prestataires
            </Link>
            
            <div className="pt-6 space-y-4">
              <Button variant="outline" className="w-full justify-start btn-effect" onClick={() => navigate('/auth')}>
                <User size={18} className="mr-2" /> Connexion
              </Button>
              <Button className="w-full justify-center btn-effect" onClick={() => navigate('/auth?tab=register')}>
                Inscription
              </Button>
            </div>
          </nav>
        )}
      </div>
      
      <main className="flex-1 pt-24">
        {children}
      </main>
      
      <footer className="bg-zinc-50 border-t border-border py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">TogoProp</h3>
              <p className="text-muted-foreground">
                Trouvez votre prochain chez-vous au Togo. Le premier marché immobilier taillé pour les Togolais locaux et de la diaspora.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><Link to="/search" className="text-muted-foreground hover:text-primary transition-colors">Rechercher</Link></li>
                <li><Link to="/search?type=sale" className="text-muted-foreground hover:text-primary transition-colors">Acheter</Link></li>
                <li><Link to="/search?type=rent" className="text-muted-foreground hover:text-primary transition-colors">Louer</Link></li>
                <li><Link to="/vendors" className="text-muted-foreground hover:text-primary transition-colors">Prestataires</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">À propos</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">Notre mission</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors">Carrières</Link></li>
                <li><Link to="/press" className="text-muted-foreground hover:text-primary transition-colors">Presse</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Légal</h3>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Politique de confidentialité</Link></li>
                <li><Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} TogoProp. Tous droits réservés.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Facebook</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
