import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Home,
  Building,
  Users,
  CreditCard,
  Wrench,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  Hourglass,
  MoreHorizontal,
  AlertCircle,
  User,
  Bell,
  MessageCircle,
  Boxes,
  FileText,
  LayoutDashboard,
  MapPin,
  Settings,
  BarChart4,
  Activity,
  HandCoins,
  Construction,
  Landmark,
  Upload
} from 'lucide-react';

// Updated interfaces to match the actual data structure
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
  priority: string; // Changed from number to string to match actual data
  created_at: string;
  property: {
    title: string;
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

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
  };
}

const Dashboard = () => {
  const { user, profile, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  // Fix property query to handle errors
  const { data: propertyData } = useQuery({
    queryKey: ['user-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id);
      
      if (error) {
        console.error("Error fetching properties:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user && roles.includes('landlord'),
  });

  // Update properties data safely
  useEffect(() => {
    if (propertyData) {
      // Only set if the data is valid (not an error)
      if (Array.isArray(propertyData) && !('error' in propertyData[0] || {}) && propertyData.length > 0) {
        setProperties(propertyData as Property[]);
      }
    }
  }, [propertyData]);

  // Fix maintenance requests query
  const { data: maintenanceData } = useQuery({
    queryKey: ['user-maintenance', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const query = roles.includes('landlord')
        ? supabase
            .from('maintenance_requests')
            .select('id, title, status, priority, created_at, property:properties(title)')
            .order('created_at', { ascending: false })
        : supabase
            .from('maintenance_requests')
            .select('id, title, status, priority, created_at, property:properties(title)')
            .eq('tenant_id', user.id)
            .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching maintenance requests:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  // Update maintenance requests safely
  useEffect(() => {
    if (maintenanceData) {
      setMaintenanceRequests(maintenanceData as MaintenanceRequest[]);
    }
  }, [maintenanceData]);

  // Fix payments query
  const { data: paymentData } = useQuery({
    queryKey: ['user-payments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('payments')
        .select('id, amount, status, due_date, payment_date, lease:leases(property:properties(title))')
        .order('due_date', { ascending: false });
      
      if (error) {
        console.error("Error fetching payments:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user && roles.includes('tenant'),
  });

  // Update payments safely
  useEffect(() => {
    if (paymentData) {
      if (Array.isArray(paymentData) && paymentData.length > 0) {
        setPayments(paymentData as Payment[]);
      }
    }
  }, [paymentData]);

  // Fix messages query
  const { data: messageData } = useQuery({
    queryKey: ['recent-messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, created_at, sender:profiles!sender_id(first_name, last_name)')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  // Update messages safely
  useEffect(() => {
    if (messageData) {
      // Create a safe version of messages with default values for missing properties
      const safeMessages = messageData.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender: {
          first_name: msg.sender?.first_name || 'Unknown',
          last_name: msg.sender?.last_name || 'User'
        }
      }));
      
      setRecentMessages(safeMessages as Message[]);
    }
  }, [messageData]);

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
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Propriétés</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold">{properties.length}</p>
                    <span className="text-xs text-green-500 dark:text-green-400">
                      +20%
                    </span>
                  </div>
                </div>
                <Building className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Demandes de maintenance</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold">{maintenanceRequests.length}</p>
                    <span className="text-xs text-red-500 dark:text-red-400">
                      -5%
                    </span>
                  </div>
                </div>
                <Wrench className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paiements en attente</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold">{payments.length}</p>
                    <span className="text-xs text-green-500 dark:text-green-400">
                      +12%
                    </span>
                  </div>
                </div>
                <CreditCard className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nouveaux messages</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold">{recentMessages.length}</p>
                    <span className="text-xs text-green-500 dark:text-green-400">
                      +30%
                    </span>
                  </div>
                </div>
                <MessageCircle className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>
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
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Vos propriétés</CardTitle>
                  <Button size="sm" onClick={() => navigate('/property-management')}>
                    Voir tout
                  </Button>
                </div>
                <CardDescription>Dernières propriétés ajoutées</CardDescription>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <Building className="h-8 w-8 mb-2" />
                    <p>Aucune propriété ajoutée.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((property) => (
                      <Card key={property.id} className="bg-muted">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">{property.title}</CardTitle>
                          <CardDescription>{property.address}, {property.city}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Prix: ${property.price}</p>
                          <p className="text-sm">Type: {property.property_type}</p>
                          <Badge variant="secondary">{property.status}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Demandes de maintenance</CardTitle>
                  <Button size="sm" onClick={() => navigate('/maintenance')}>
                    Voir tout
                  </Button>
                </div>
                <CardDescription>Dernières demandes de maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <Wrench className="h-8 w-8 mb-2" />
                    <p>Aucune demande de maintenance.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {maintenanceRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.property.title}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{request.status}</Badge>
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Paiements récents</CardTitle>
                  <Button size="sm" onClick={() => navigate('/payments')}>
                    Voir tout
                  </Button>
                </div>
                <CardDescription>Derniers paiements effectués</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <CreditCard className="h-8 w-8 mb-2" />
                    <p>Aucun paiement récent.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                        <div>
                          <p className="font-medium">Paiement: ${payment.amount}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.lease.property.title}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{payment.status}</Badge>
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Messages récents</CardTitle>
                  <Button size="sm" onClick={() => navigate('/messages')}>
                    Voir tout
                  </Button>
                </div>
                <CardDescription>Vos dernières conversations</CardDescription>
              </CardHeader>
              <CardContent>
                {recentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mb-2" />
                    <p>Aucun message récent.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentMessages.map((message) => (
                      <div key={message.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                        <div>
                          <p className="font-medium">{message.content}</p>
                          <p className="text-sm text-muted-foreground">
                            De: {message.sender.first_name} {message.sender.last_name}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
