
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline';
}

const StatCard = ({ title, value, description, icon: Icon, className, variant = 'default' }: StatCardProps) => {
  // Define variant colors
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20';
      case 'destructive':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'secondary':
        return 'bg-secondary/20';
      case 'outline':
        return 'border-2 border-primary/20 bg-transparent';
      default:
        return '';
    }
  };

  const getIconColorClasses = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'destructive':
        return 'text-red-600 dark:text-red-400';
      case 'secondary':
        return 'text-secondary';
      case 'outline':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={`${className} ${getVariantClasses()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getIconColorClasses()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
