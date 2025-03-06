
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';
import { translateRole } from '@/utils/formatUtils';
import { useAuth } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';

export interface UserMenuProps {
  user: User;
  onSignOut: () => Promise<void>;
  activeRole?: string;
  roles?: string[];
}

const UserMenu = ({ user, onSignOut, activeRole = 'tenant', roles = [] }: UserMenuProps) => {
  const navigate = useNavigate();
  const { setActiveRole } = useAuth();
  const email = user?.email || '';
  const initial = email.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await onSignOut();
    navigate('/');
  };

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    
    // Navigate to appropriate dashboard based on role
    if (role === 'vendor') {
      navigate('/vendor-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const getMainDashboardLink = () => {
    return activeRole === 'vendor' ? '/vendor-dashboard' : '/dashboard';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={email} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Mon compte</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
            {activeRole && (
              <p className="text-xs mt-1 text-primary">
                {translateRole(activeRole)}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">Profil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={getMainDashboardLink()}>Tableau de bord</Link>
        </DropdownMenuItem>
        
        {/* Role Switcher Sub-Menu (only if user has multiple roles) */}
        {roles.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Changer de rôle</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {roles.map(role => (
                  <DropdownMenuItem 
                    key={role}
                    onClick={() => handleRoleChange(role)}
                  >
                    <span className="mr-2">{translateRole(role)}</span>
                    {activeRole === role && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
