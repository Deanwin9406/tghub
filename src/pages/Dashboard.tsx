import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/dashboard/StatCard';
import PropertiesTab from '@/components/dashboard/PropertiesTab';
import PropertyManagerTab from '@/components/dashboard/PropertyManagerTab';
import MessagesTab from '@/components/dashboard/MessagesTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import MaintenanceTab from '@/components/dashboard/MaintenanceTab';
import { Building, DollarSign, Wrench, FileText, Home, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqm: number | null;
  status: string;
  main_image_url: string | null;
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

interface TenantDashboardProps {
  properties: any[];
  maintenanceRequests: any[];
  payments: any[];
  messages: any[];
}

interface ManagerDashboardProps {
  properties: any[];
  maintenanceRequests: any[];
  payments: any[];
  messages: any[];
  stats: {
    totalRevenue: number;
    propertiesCount: number;
    maintenanceCount: number;
    pendingPaymentsCount: number;
  };
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ 
  properties, 
  maintenanceRequests, 
  payments, 
  messages 
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tableau de bord locataire</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Mes locations" 
          value={properties.length.toString()} 
          description="Propriétés louées" 
          icon={Home} 
        />
        <StatCard 
          title="Demandes de maintenance" 
          value={maintenanceRequests.length.toString()} 
          description="Demandes actives" 
          icon={Wrench} 
        />
        <StatCard 
          title="Paiements à venir" 
          value={payments.filter(p => p.status === 'pending').length.toString()} 
          description="Paiements en attente" 
          icon={DollarSign} 
        />
      </div>
      
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="properties">Mes locations</TabsTrigger>
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
          <MessagesTab messages={messages} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  properties,
  maintenanceRequests,
  payments,
  messages,
  stats
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tableau de bord gestionnaire</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Revenu total" 
          value={stats.totalRevenue.toString()} 
          description="Revenu annuel total" 
          icon={DollarSign} 
        />
        <StatCard 
          title="Propriétés listées" 
          value={stats.propertiesCount.toString()} 
          description="Nombre total de propriétés" 
          icon={Building} 
        />
        <StatCard 
          title="Demandes de maintenance" 
          value={stats.maintenanceCount.toString()} 
          description="Demandes en attente" 
          icon={Wrench} 
        />
        <StatCard 
          title="Paiements en attente" 
          value={stats.pendingPaymentsCount.toString()} 
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
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    propertiesCount: 0,
    maintenanceCount: 0,
    pendingPaymentsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log("Dashboard - User roles:", roles);
      fetchDashboardData();
    }
  }, [user, roles]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProperties(),
        fetchMaintenanceRequests(),
        fetchMessages(),
        fetchPayments()
      ]);
      
      calculateStats();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du tableau de bord',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      let query = supabase.from('properties').select('*');
      
      if (roles.includes('landlord')) {
        query = query.eq('owner_id', user?.id);
      } else if (roles.includes('agent')) {
        const { data: agentProperties, error: agentError } = await supabase
          .from('agent_properties')
          .select('property_id')
          .eq('agent_id', user?.id);
        
        if (agentError) throw agentError;
        
        if (agentProperties && agentProperties.length > 0) {
          const propertyIds = agentProperties.map(ap => ap.property_id);
          query = query.in('id', propertyIds);
        } else {
          setProperties([]);
          return;
        }
      } else if (roles.includes('tenant')) {
        const { data: leases, error: leaseError } = await supabase
          .from('leases')
          .select('property_id')
          .eq('tenant_id', user?.id);
        
        if (leaseError) throw leaseError;
        
        if (leases && leases.length > 0) {
          const propertyIds = leases.map(lease => lease.property_id);
          query = query.in('id', propertyIds);
        } else {
          setProperties([]);
          return;
        }
      }
      
      const { data, error } = await query.limit(5);
      
      if (error) throw error;
      
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les propriétés',
        variant: 'destructive',
      });
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      let query = supabase
        .from('maintenance_requests')
        .select(`
          id,
          title,
          status,
          priority,
          created_at,
          properties:property_id (
            title
          )
        `);
      
      if (roles.includes('tenant')) {
        query = query.eq('tenant_id', user?.id);
      } else if (roles.includes('landlord')) {
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user?.id);
        
        if (propError) throw propError;
        
        if (properties && properties.length > 0) {
          const propertyIds = properties.map(prop => prop.id);
          query = query.in('property_id', propertyIds);
        } else {
          setMaintenanceRequests([]);
          return;
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(5);
      
      if (error) throw error;
      
      const formattedRequests = data.map(request => ({
        id: request.id,
        title: request.title,
        status: request.status,
        priority: request.priority,
        created_at: request.created_at,
        property: {
          title: request.properties?.title || 'Unknown Property'
        }
      }));
      
      setMaintenanceRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes de maintenance',
        variant: 'destructive',
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id
        `)
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      if (messagesData && messagesData.length > 0) {
        const senderIds = messagesData.map(msg => msg.sender_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', senderIds);
        
        if (profilesError) throw profilesError;
        
        const profilesMap = new Map();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
        
        const formattedMessages = messagesData.map(msg => {
          const senderProfile = profilesMap.get(msg.sender_id);
          return {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            sender: {
              first_name: senderProfile?.first_name || 'Unknown',
              last_name: senderProfile?.last_name || 'User'
            }
          };
        });
        
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages',
        variant: 'destructive',
      });
    }
  };

  const fetchPayments = async () => {
    try {
      let query = supabase
        .from('payments')
        .select(`
          id,
          amount,
          status,
          due_date,
          payment_date,
          lease:lease_id (
            property:property_id (
              title
            )
          )
        `)
        .order('due_date', { ascending: false })
        .limit(5);
      
      if (roles.includes('tenant')) {
        const { data: leases, error: leaseError } = await supabase
          .from('leases')
          .select('id')
          .eq('tenant_id', user?.id);
        
        if (leaseError) throw leaseError;
        
        if (leases && leases.length > 0) {
          const leaseIds = leases.map(lease => lease.id);
          query = query.in('lease_id', leaseIds);
        } else {
          setPayments([]);
          return;
        }
      } else if (roles.includes('landlord')) {
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user?.id);
        
        if (propError) throw propError;
        
        if (properties && properties.length > 0) {
          const { data: leases, error: leaseError } = await supabase
            .from('leases')
            .select('id')
            .in('property_id', properties.map(prop => prop.id));
          
          if (leaseError) throw leaseError;
          
          if (leases && leases.length > 0) {
            const leaseIds = leases.map(lease => lease.id);
            query = query.in('lease_id', leaseIds);
          } else {
            setPayments([]);
            return;
          }
        } else {
          setPayments([]);
          return;
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const formattedPayments = data.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        due_date: payment.due_date,
        payment_date: payment.payment_date,
        lease: {
          property: {
            title: payment.lease?.property?.title || 'Unknown Property'
          }
        }
      }));
      
      setPayments(formattedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paiements',
        variant: 'destructive',
      });
    }
  };

  const calculateStats = () => {
    const totalRevenue = payments.reduce((sum, payment) => {
      if (payment.status === 'paid') {
        return sum + payment.amount;
      }
      return sum;
    }, 0);
    
    const propertiesCount = properties.length;
    
    const maintenanceCount = maintenanceRequests.filter(
      req => req.status === 'pending' || req.status === 'in_progress'
    ).length;
    
    const pendingPaymentsCount = payments.filter(
      payment => payment.status === 'pending'
    ).length;
    
    setStats({
      totalRevenue,
      propertiesCount,
      maintenanceCount,
      pendingPaymentsCount
    });
  };

  const isTenant = roles.includes('tenant') && 
                  !(roles.includes('landlord') || 
                    roles.includes('manager') || 
                    roles.includes('agent') || 
                    roles.includes('admin'));
  
  console.log("Dashboard - Is tenant:", isTenant, "Roles:", roles);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          isTenant ? (
            <TenantDashboard 
              properties={properties} 
              maintenanceRequests={maintenanceRequests} 
              payments={payments} 
              messages={messages} 
            />
          ) : (
            <ManagerDashboard 
              properties={properties} 
              maintenanceRequests={maintenanceRequests} 
              payments={payments} 
              messages={messages} 
              stats={stats} 
            />
          )
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
