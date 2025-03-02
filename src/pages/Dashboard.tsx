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
import { Building, DollarSign, Wrench, FileText } from 'lucide-react';

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

interface MaintenanceRequest {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: string;
  created_at: string;
  property: {
    title: string;
  };
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  payment_date: string | null;
  lease: {
    property: {
      title: string;
    };
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    const mockMaintenanceRequests: MaintenanceRequest[] = [
      {
        id: '1',
        title: 'Leaky Faucet',
        status: 'pending',
        priority: 'medium',
        created_at: '2023-04-15',
        property: {
          title: 'Luxury Villa'
        }
      },
      {
        id: '2',
        title: 'Broken AC',
        status: 'in_progress',
        priority: 'high',
        created_at: '2023-04-10',
        property: {
          title: 'Cozy Apartment'
        }
      }
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Is the property still available?',
        created_at: '2023-04-15',
        sender: {
          first_name: 'John',
          last_name: 'Doe'
        }
      },
      {
        id: '2',
        content: 'When can I schedule a viewing?',
        created_at: '2023-04-16',
        sender: {
          first_name: 'Jane',
          last_name: 'Smith'
        }
      }
    ];

    const mockPayments: Payment[] = [
      {
        id: '1',
        amount: 1200,
        status: 'paid',
        due_date: '2023-04-01',
        payment_date: '2023-03-29',
        lease: {
          property: {
            title: 'Luxury Villa'
          }
        }
      },
      {
        id: '2',
        amount: 850,
        status: 'pending',
        due_date: '2023-05-01',
        payment_date: null,
        lease: {
          property: {
            title: 'Cozy Apartment'
          }
        }
      }
    ];

    setLoading(true);
    setTimeout(() => {
      setProperties(mockProperties);
      setMaintenanceRequests(mockMaintenanceRequests);
      setMessages(mockMessages);
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Revenu total" 
            value="250000" 
            description="Revenu annuel total" 
            icon={DollarSign} 
          />
          <StatCard 
            title="Propriétés listées" 
            value="12" 
            description="Nombre total de propriétés" 
            icon={Building} 
          />
          <StatCard 
            title="Demandes de maintenance" 
            value="5" 
            description="Demandes en attente" 
            icon={Wrench} 
          />
          <StatCard 
            title="Paiements en attente" 
            value="3" 
            description="Paiements à recevoir" 
            icon={FileText} 
          />
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
            <PropertyManagerTab properties={properties} maintenanceRequests={maintenanceRequests} />
          </TabsContent>
          <TabsContent value="messages">
            <MessagesTab messages={messages} />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsTab payments={payments} />
          </TabsContent>
          <TabsContent value="maintenance">
            <MaintenanceTab maintenanceRequests={maintenanceRequests} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
