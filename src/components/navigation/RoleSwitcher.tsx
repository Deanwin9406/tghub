
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { translateRole } from '@/utils/formatUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface RoleSwitcherProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

const getRoleDestination = (role: string): string => {
  switch (role) {
    case 'vendor':
      return '/vendor-dashboard';
    case 'landlord':
    case 'agent':
    case 'manager':
    case 'admin':
    case 'tenant':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

const RoleSwitcher = ({ className = '', variant = 'default' }: RoleSwitcherProps) => {
  const { roles, activeRole, setActiveRole } = useAuth();
  const navigate = useNavigate();

  if (roles.length <= 1) {
    return variant === 'default' ? (
      <Badge variant="outline" className={className}>
        {translateRole(activeRole)}
      </Badge>
    ) : null;
  }

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    navigate(getRoleDestination(role));
  };

  if (variant === 'minimal') {
    return (
      <Select value={activeRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Changer de rôle" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              {translateRole(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">
        Rôle:
      </span>
      <Select value={activeRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Changer de rôle" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              {translateRole(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSwitcher;
