import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Loader2, Building, Wrench, CreditCard, MessageSquare, Users } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import PropertiesTab from '@/components/dashboard/PropertiesTab';
import MaintenanceTab from '@/components/dashboard/MaintenanceTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import MessagesTab from '@/components/dashboard/MessagesTab';
import PropertyManagerTab from '@/components/dashboard/PropertyManagerTab';
import StatCard from '@/components/dashboard/StatCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  // New states for property-agent relationships
  const [selectedProperty, setSelectedProperty] = useState<string>('');

  // Fetch managed properties for a property manager
  const { data: managedProperties = [] } = useQuery({
    queryKey: ['managed-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('property_managers')
        .select('property_id, properties(*)')
        .eq('manager_id', user.id);
        
      if (error) {
        console.error("Error fetching managed properties:", error);
        return [];
      }
      
      return data.map(item => item.properties);
    },
    enabled: !!user && isManager
  });

  // Fetch agent-assigned properties
  const { data: agentProperties = [] } = useQuery({
    queryKey: ['agent-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('agent_properties')
        .select('property_id, properties(*), commission_percentage, is_exclusive')
        .eq('agent_id', user.id);
        
      if (error) {
        console.error("Error fetching agent properties:", error);
        return [];
      }
      
      return data.map(item => ({
        ...item.properties,
        commission_percentage: item.commission_percentage,
        is_exclusive: item.is_exclusive
      }));
    },
    enabled: !!user && isAgent
  });

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

  // Check if user can create property listings
  const canCreateListings = roles.some(role => 
    ['landlord', 'agent', 'manager', 'admin'].includes(role)
  );

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
          {canCreateListings && (
            <Button onClick={() => navigate('/add-property')}>
              Add Property
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Propriétés" 
            value={isAgent ? agentProperties.length : properties.length} 
            description="Total de propriétés"
            icon={Building}
          />
          <StatCard 
            title="Demandes" 
            value={maintenanceRequests.length} 
            description="Demandes de maintenance"
            icon={Wrench}
          />
          <StatCard 
            title="Paiements" 
            value={payments.length} 
            description="Transactions récentes"
            icon={CreditCard}
          />
          <StatCard 
            title="Messages" 
            value={recentMessages.length} 
            description="Messages non lus"
            icon={MessageSquare}
          />
        </div>

        {isManager && (
          <PropertyManagerTab 
            properties={managedProperties.length > 0 ? managedProperties : properties} 
            maintenanceRequests={maintenanceRequests} 
          />
        )}

        {isAgent && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agent Properties
              </CardTitle>
              <CardDescription>
                Properties assigned to you for representation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium">Property</th>
                      <th className="text-left py-2 px-4 font-medium">Commission %</th>
                      <th className="text-left py-2 px-4 font-medium">Status</th>
                      <th className="text-left py-2 px-4 font-medium">Exclusivity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentProperties.length > 0 ? (
                      agentProperties.map((property: any) => (
                        <tr key={property.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{property.title}</td>
                          <td className="py-2 px-4">{property.commission_percentage}%</td>
                          <td className="py-2 px-4">
                            <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                              {property.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-4">
                            {property.is_exclusive ? (
                              <Badge variant="default">Exclusive</Badge>
                            ) : (
                              <Badge variant="outline">Non-exclusive</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 px-4 text-center text-muted-foreground">
                          No properties assigned to you yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {(isLandlord || isTenant) && (
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
