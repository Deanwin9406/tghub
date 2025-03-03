
import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { name: string; path: string }[];
  isLoggedIn: boolean;
  isTenantOnly: boolean;
}

const MobileMenu = ({ isOpen, onClose, navItems, isLoggedIn, isTenantOnly }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden">
      <div className="fixed inset-y-0 left-0 w-64 bg-background border-r p-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center" onClick={onClose}>
            <ShoppingBag className="mr-2 h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TogoPropConnect</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                to={item.path} 
                onClick={onClose}
                className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-accent hover:text-accent-foreground"
              >
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          {isLoggedIn && (
            <>
              {!isTenantOnly && (
                <li>
                  <Link 
                    to="/property-management" 
                    onClick={onClose}
                    className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>Mes Propriétés</span>
                  </Link>
                </li>
              )}
              <li>
                <Link 
                  to="/dashboard" 
                  onClick={onClose}
                  className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Tableau de bord</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  onClick={onClose}
                  className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Profil</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/favorites" 
                  onClick={onClose}
                  className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Favoris</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MobileMenu;
