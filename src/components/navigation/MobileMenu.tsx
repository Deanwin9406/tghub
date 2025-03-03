
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileMenuProps {
  navItems: { name: string; path: string }[];
  isLoggedIn: boolean;
  isTenantOnly: boolean;
  onLinkClick: () => void;
  isVendor?: boolean;
}

const MobileMenu = ({ navItems, isLoggedIn, isTenantOnly, onLinkClick, isVendor = false }: MobileMenuProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col p-4 space-y-4">
        <h2 className="font-semibold">Navigation</h2>
        <div className="flex flex-col space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              asChild
              className="justify-start"
              onClick={onLinkClick}
            >
              <Link to={item.path}>{item.name}</Link>
            </Button>
          ))}
          
          {isLoggedIn && !isVendor && (
            <>
              {!isTenantOnly && (
                <Button
                  variant="ghost"
                  asChild
                  className="justify-start"
                  onClick={onLinkClick}
                >
                  <Link to="/property-management">Mes Propriétés</Link>
                </Button>
              )}
              <Button
                variant="ghost"
                asChild
                className="justify-start"
                onClick={onLinkClick}
              >
                <Link to="/dashboard">Tableau de bord</Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className="justify-start"
                onClick={onLinkClick}
              >
                <Link to="/profile">Profil</Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className="justify-start"
                onClick={onLinkClick}
              >
                <Link to="/favorites">Favoris</Link>
              </Button>
            </>
          )}
          
          {isLoggedIn && isVendor && (
            <>
              <Button
                variant="ghost"
                asChild
                className="justify-start"
                onClick={onLinkClick}
              >
                <Link to="/vendor-dashboard">Tableau de bord</Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className="justify-start"
                onClick={onLinkClick}
              >
                <Link to="/profile">Profil</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default MobileMenu;
