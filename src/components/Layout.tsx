
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Home, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
            <Link to="/about" className="font-medium hover:text-primary transition-colors">À propos</Link>
            <Link to="/contact" className="font-medium hover:text-primary transition-colors">Contact</Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" className="btn-effect">
              <User size={18} className="mr-1" /> Connexion
            </Button>
            <Button size="sm" className="btn-effect">
              Publier une annonce
            </Button>
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
        
        <nav className="flex flex-col p-6 space-y-6">
          <Link to="/" className="font-medium text-xl hover:text-primary transition-colors">
            Accueil
          </Link>
          <Link to="/search" className="font-medium text-xl hover:text-primary transition-colors">
            Rechercher
          </Link>
          <Link to="/about" className="font-medium text-xl hover:text-primary transition-colors">
            À propos
          </Link>
          <Link to="/contact" className="font-medium text-xl hover:text-primary transition-colors">
            Contact
          </Link>
          
          <div className="pt-6 space-y-4">
            <Button variant="outline" className="w-full justify-start btn-effect">
              <User size={18} className="mr-2" /> Connexion
            </Button>
            <Button className="w-full justify-center btn-effect">
              Publier une annonce
            </Button>
          </div>
        </nav>
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
                <li><Link to="/agents" className="text-muted-foreground hover:text-primary transition-colors">Agents</Link></li>
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
