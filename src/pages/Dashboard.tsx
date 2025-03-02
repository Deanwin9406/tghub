import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/dashboard/StatCard';
import PropertiesTab from '@/components/dashboard/PropertiesTab';
import PropertyManagerTab from '@/components/dashboard/PropertyManagerTab';
import MessagesTab from '@/components/dashboard/MessagesTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import MaintenanceTab from '@/components/dashboard/MaintenanceTab';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  size_sqm: number;
  status: string;
  main_image_url: string;
  property_type: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'Luxury Villa',
        price: 1200000,
        address: '123 Main St',
        city: 'Miami',
        bedrooms: 5,
        bathrooms: 4,
        size_sqm: 300,
        status: 'For Sale',
        main_image_url: '/images/property1.jpg',
        property_type: 'Villa',
      },
      {
        id: '2',
        title: 'Cozy Apartment',
        price: 350000,
        address: '456 Elm St',
        city: 'New York',
        bedrooms: 2,
        bathrooms: 2,
        size_sqm: 100,
        status: 'For Rent',
        main_image_url: '/images/property2.jpg',
        property_type: 'Apartment',
      },
      {
        id: '3',
        title: 'Modern House',
        price: 800000,
        address: '789 Oak St',
        city: 'Los Angeles',
        bedrooms: 4,
        bathrooms: 3,
        size_sqm: 200,
        status: 'For Sale',
        main_image_url: '/images/property3.jpg',
        property_type: 'House',
      },
    ];

    setLoading(true);
    setTimeout(() => {
      setProperties(mockProperties);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Revenu total" value="$250,000" />
          <StatCard title="Propriétés listées" value="12" />
          <StatCard title="Demandes de maintenance" value="5" />
          <StatCard title="Paiements en attente" value="3" />
        </div>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">Propriétés</TabsTrigger>
            <TabsTrigger value="property-managers">Gestionnaires</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
          <TabsContent value="properties">
            <PropertiesTab properties={properties} />
          </TabsContent>
          <TabsContent value="property-managers">
            <PropertyManagerTab />
          </TabsContent>
          <TabsContent value="messages">
            <MessagesTab />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>
          <TabsContent value="maintenance">
            <MaintenanceTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
