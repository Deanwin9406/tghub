
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator'; 
import { useAuth } from '@/contexts/AuthContext';
import RoleSwitcher from './RoleSwitcher';
import { cn } from '@/lib/utils';

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
  
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col p-4 space-y-4">
        <h2 className="font-semibold">Navigation</h2>
        
        {/* Role Switcher - only for authenticated users with multiple roles */}
        {isLoggedIn && roles.length > 1 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Rôle actif:</p>
            <RoleSwitcher variant="minimal" />
          </div>
        )}
        
        {isLoggedIn && roles.length > 1 && <Separator />}
        
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
                  "justify-start",
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
