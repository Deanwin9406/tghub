
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export const SettingsLayout = ({ children }: { children?: React.ReactNode }) => {
  const { activeRole } = useAuth();
  const location = useLocation();

  // Define navigation items based on role
  const getNavItems = () => {
    const commonItems = [
      { name: 'Profil', path: '/settings' },
      { name: 'Sécurité', path: '/settings/security' },
      { name: 'Préférences', path: '/settings/preferences' },
    ];

    // KYC verification should only be available for tenant role
    const kycItem = { name: 'Vérification KYC', path: '/settings/kyc' };

    switch (activeRole) {
      case 'tenant':
        return [...commonItems, kycItem];
      case 'landlord':
        return [
          ...commonItems,
          { name: 'Préférences de location', path: '/settings/rental' },
        ];
      case 'agent':
        return [
          ...commonItems,
          { name: 'Spécialités', path: '/settings/specialties' },
          { name: 'Territoires', path: '/settings/territories' },
        ];
      case 'vendor':
        return [
          ...commonItems,
          { name: 'Services', path: '/settings/services' },
        ];
      case 'manager':
        return [
          ...commonItems,
          { name: 'Préférences de gestion', path: '/settings/management' },
        ];
      case 'admin':
        return [
          ...commonItems,
          { name: 'Paramètres système', path: '/settings/system' },
        ];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4 md:col-span-1">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </Card>

          <div className="md:col-span-3">
            {children || <Outlet />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsLayout;
