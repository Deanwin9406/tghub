
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

type UserRole = 'tenant' | 'landlord' | 'agent' | 'admin' | 'manager' | 'vendor' | 'mod';

const getRoleDestination = (role: UserRole): string => {
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

// Define role colors for badges
const roleColors = {
  'tenant': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'landlord': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  'agent': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'manager': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  'vendor': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  'mod': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

const RoleSwitcher = ({ className = '', variant = 'default' }: RoleSwitcherProps) => {
  const { roles, activeRole, setActiveRole } = useAuth();
  const navigate = useNavigate();

  // SafelySetActiveRole ensures we only use valid role types
  const safelySetActiveRole = (role: string) => {
    if (['tenant', 'landlord', 'agent', 'admin', 'manager', 'vendor', 'mod'].includes(role)) {
      setActiveRole(role as UserRole);
      navigate(getRoleDestination(role as UserRole));
    }
  };

  if (roles.length <= 1) {
    return variant === 'default' ? (
      <Badge variant="outline" className={`${className} ${roleColors[activeRole as UserRole] || ''}`}>
        {translateRole(activeRole)}
      </Badge>
    ) : null;
  }

  if (variant === 'minimal') {
    return (
      <Select value={activeRole} onValueChange={safelySetActiveRole}>
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
      <Select value={activeRole} onValueChange={safelySetActiveRole}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Changer de rôle" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role} value={role} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${roleColors[role as UserRole] || ''}`}></div>
              {translateRole(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSwitcher;
