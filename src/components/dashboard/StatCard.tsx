
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <span 
                  className={`text-xs ${
                    trend.positive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {trend.value}
                </span>
              )}
            </div>
          </div>
          <Icon className="h-8 w-8 text-primary/80" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
