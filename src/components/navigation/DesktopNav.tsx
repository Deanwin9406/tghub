
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DesktopNavProps {
  navItems: { name: string; path: string }[];
  isLoggedIn: boolean;
  activeRole?: string;
}

const DesktopNav = ({ navItems, isLoggedIn, activeRole = 'tenant' }: DesktopNavProps) => {
  const location = useLocation();
  
  return (
    <nav className="hidden lg:flex ml-10 space-x-4">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
                        (item.path !== '/' && location.pathname.startsWith(item.path));
        
        return (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default DesktopNav;
