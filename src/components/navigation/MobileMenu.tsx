
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator'; 
import { useAuth } from '@/contexts/AuthContext';
import RoleSwitcher from './RoleSwitcher';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MobileMenuProps {
  navItems: { name: string; path: string }[];
  isLoggedIn: boolean;
  onLinkClick: () => void;
  activeRole?: string;
  roles?: string[];
}

const MobileMenu = ({ 
  navItems, 
  isLoggedIn, 
  onLinkClick, 
  activeRole = 'tenant',
  roles = []
}: MobileMenuProps) => {
  const location = useLocation();
  
  // Define role colors for role indicators
  const roleColors = {
    'tenant': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'landlord': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    'agent': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'manager': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    'vendor': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    'mod': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  };

  const getRoleColor = (role: string) => {
    return roleColors[role as keyof typeof roleColors] || roleColors.tenant;
  };
  
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Navigation</h2>
          
          {/* Active Role Badge */}
          {isLoggedIn && (
            <Badge 
              variant="outline" 
              className={cn("capitalize font-medium", getRoleColor(activeRole))}
            >
              {activeRole}
            </Badge>
          )}
        </div>
        
        {/* Role Switcher - only for authenticated users with multiple roles */}
        {isLoggedIn && roles.length > 1 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Rôle actif:</p>
            <RoleSwitcher variant="minimal" />
          </div>
        )}
        
        {isLoggedIn && roles.length > 1 && <Separator className="my-2" />}
        
        <div className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                asChild
                className={cn(
                  "justify-start w-full",
                  isActive && "bg-primary/10 text-primary"
                )}
                onClick={onLinkClick}
              >
                <Link to={item.path}>{item.name}</Link>
              </Button>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};

export default MobileMenu;
