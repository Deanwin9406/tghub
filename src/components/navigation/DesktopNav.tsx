
import React from 'react';
import { Link } from 'react-router-dom';

interface DesktopNavProps {
  navItems: { name: string; path: string }[];
  isLoggedIn: boolean;
  isTenantOnly: boolean;
}

const DesktopNav = ({ navItems, isLoggedIn, isTenantOnly }: DesktopNavProps) => {
  return (
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
      {isLoggedIn && (
        <>
          {!isTenantOnly && (
            <Link
              to="/property-management"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Mes Propriétés
            </Link>
          )}
          <Link
            to="/dashboard"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Tableau de bord
          </Link>
          <Link
            to="/profile"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Profil
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
  );
};

export default DesktopNav;
