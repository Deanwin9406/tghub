
import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import PropertiesTab from '@/components/dashboard/PropertiesTab';
import MaintenanceTab from '@/components/dashboard/MaintenanceTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import MessagesTab from '@/components/dashboard/MessagesTab';
import PropertyManagerTab from '@/components/dashboard/PropertyManagerTab';
import StatCard from '@/components/dashboard/StatCard';

const Dashboard = () => {
  const { user, profile, roles, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const { properties, maintenanceRequests, payments, recentMessages } = useDashboardData({ 
    user, 
    roles
  });

  const isLandlord = roles.includes('landlord');
  const isTenant = roles.includes('tenant');
  const isManager = roles.includes('manager');
  const isAgent = roles.includes('agent');

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 flex items-center justify-center min-h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue, {profile.first_name} {profile.last_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Propriétés" 
            value={properties.length.toString()} 
            description="Total de propriétés"
            icon="Building"
          />
          <StatCard 
            title="Demandes" 
            value={maintenanceRequests.length.toString()} 
            description="Demandes de maintenance"
            icon="Wrench"
          />
          <StatCard 
            title="Paiements" 
            value={payments.length.toString()} 
            description="Transactions récentes"
            icon="CreditCard"
          />
          <StatCard 
            title="Messages" 
            value={recentMessages.length.toString()} 
            description="Messages non lus"
            icon="MessageSquare"
          />
        </div>

        {isManager && (
          <PropertyManagerTab 
            properties={properties} 
            maintenanceRequests={maintenanceRequests} 
          />
        )}

        {(isLandlord || isTenant || isAgent) && (
          <Tabs defaultValue="properties" className="space-y-8">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="properties">Propriétés</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="payments">Paiements</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties">
              <PropertiesTab properties={properties} />
            </TabsContent>
            
            <TabsContent value="maintenance">
              <MaintenanceTab maintenanceRequests={maintenanceRequests} />
            </TabsContent>
            
            <TabsContent value="payments">
              <PaymentsTab payments={payments} />
            </TabsContent>
            
            <TabsContent value="messages">
              <MessagesTab messages={recentMessages} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
