
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Wrench, CreditCard, MessageCircle, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import the custom components we created
import StatCard from '@/components/dashboard/StatCard';
import PropertiesTab from '@/components/dashboard/PropertiesTab';
import MaintenanceTab from '@/components/dashboard/MaintenanceTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import MessagesTab from '@/components/dashboard/MessagesTab';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { user, profile, roles } = useAuth();
  const { toast } = useToast();
  
  // Use our custom hook to fetch and process data
  const { 
    properties, 
    maintenanceRequests, 
    payments, 
    recentMessages 
  } = useDashboardData({ user, roles });

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">Aperçu de votre activité immobilière</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
            <Button size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Propriétés" 
            value={properties.length} 
            icon={Building} 
            trend={{ value: "+20%", positive: true }} 
          />
          
          <StatCard 
            title="Demandes de maintenance" 
            value={maintenanceRequests.length} 
            icon={Wrench} 
            trend={{ value: "-5%", positive: false }} 
          />
          
          <StatCard 
            title="Paiements en attente" 
            value={payments.length} 
            icon={CreditCard} 
            trend={{ value: "+12%", positive: true }} 
          />
          
          <StatCard 
            title="Nouveaux messages" 
            value={recentMessages.length} 
            icon={MessageCircle} 
            trend={{ value: "+30%", positive: true }} 
          />
        </div>

        <Tabs defaultValue="properties" className="space-y-4">
          <TabsList>
            <TabsTrigger value="properties">
              <Building className="mr-2 h-4 w-4" />
              Propriétés
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="mr-2 h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="mr-2 h-4 w-4" />
              Paiements
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
            </TabsTrigger>
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
      </div>
    </Layout>
  );
};

export default Dashboard;
