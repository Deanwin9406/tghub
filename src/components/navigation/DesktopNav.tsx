
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Role = 'tenant' | 'landlord' | 'agent' | 'admin' | 'manager' | 'vendor' | 'mod';

interface DesktopNavProps {
  navItems: { name: string; path: string }[];
  isLoggedIn: boolean;
  activeRole?: Role;
}

const DesktopNav = ({ navItems, isLoggedIn, activeRole = 'tenant' }: DesktopNavProps) => {
  const location = useLocation();
  
  // Define role colors for role indicators
  const roleColors: Record<Role, string> = {
    'tenant': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'landlord': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    'agent': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'manager': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    'vendor': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    'mod': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  };

  const getRoleColor = (role: Role) => {
    return roleColors[role] || roleColors.tenant;
  };
  
  return (
    <nav className="hidden lg:flex ml-10 items-center gap-1">
      {isLoggedIn && (
        <Badge 
          variant="outline" 
          className={cn("mr-4 capitalize font-medium", getRoleColor(activeRole))}
        >
          {activeRole}
        </Badge>
      )}
      
      <div className="flex space-x-1">
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
      </div>
    </nav>
  );
};

export default DesktopNav;
