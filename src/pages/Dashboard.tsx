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
import { 
  Building, 
  DollarSign, 
  Wrench, 
  FileText, 
  Home, 
  User, 
  Users, 
  CalendarDays, 
  CheckCircle, 
  Clock,
  Shield,
  Clipboard,
  Activity,
  Bell,
  Star,
  HeartHandshake
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Property, MaintenanceRequest, Payment, Message } from '@/types/property';

const TenantDashboard = ({ 
  properties, 
  maintenanceRequests, 
  payments, 
  messages 
}) => {
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const activeMaintenanceRequests = maintenanceRequests.filter(
    m => m.status === 'pending' || m.status === 'in_progress'
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-3">
        <h1 className="text-3xl font-bold">Tableau de bord locataire</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre espace locataire. Gérez vos locations, suivez vos demandes et paiements.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Mes locations" 
          value={properties.length.toString()} 
          description="Propriétés louées" 
          icon={Home}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
        />
        <StatCard 
          title="Demandes de maintenance" 
          value={activeMaintenanceRequests.toString()} 
          description="Demandes actives" 
          icon={Wrench}
          className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900"
        />
        <StatCard 
          title="Paiements à venir" 
          value={pendingPayments.toString()} 
          description="Paiements en attente" 
          icon={DollarSign}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
        />
        <StatCard 
          title="Messages" 
          value={messages.length.toString()} 
          description="Messages non lus" 
          icon={Bell}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
        />
      </div>
      
      <Card className="p-6 border bg-card">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="properties" className="data-[state=active]:bg-primary">Mes locations</TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-primary">Maintenance</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary">Paiements</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary">Messages</TabsTrigger>
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
      </Card>
    </div>
  );
};

const ManagerDashboard = ({
  properties,
  maintenanceRequests,
  payments,
  messages,
  stats
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-3">
        <h1 className="text-3xl font-bold">Tableau de bord gestionnaire</h1>
        <p className="text-muted-foreground">
          Gérez efficacement votre portefeuille immobilier, supervisez les propriétés et maximisez leur rendement.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Revenu total" 
          value={`${stats.totalRevenue.toLocaleString()} €`} 
          description="Revenu annuel total" 
          icon={DollarSign} 
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900"
        />
        <StatCard 
          title="Propriétés gérées" 
          value={stats.propertiesCount.toString()} 
          description="Nombre total de propriétés" 
          icon={Building}
          className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900" 
        />
        <StatCard 
          title="Taux d'occupation" 
          value={`${Math.min(100, stats.propertiesCount > 0 ? Math.round((stats.propertiesCount - stats.pendingPaymentsCount) / stats.propertiesCount * 100) : 0)}%`} 
          description="Des propriétés louées" 
          icon={CheckCircle}
          className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900" 
        />
        <StatCard 
          title="Maintenance" 
          value={stats.maintenanceCount.toString()} 
          description="Demandes en attente" 
          icon={Wrench}
          className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900" 
        />
      </div>
      
      <Card className="p-6 border bg-card">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="properties" className="data-[state=active]:bg-primary">Propriétés</TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-primary">Locataires</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary">Messages</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary">Paiements</TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-primary">Maintenance</TabsTrigger>
          </TabsList>
          <TabsContent value="properties">
            <PropertiesTab properties={properties} />
          </TabsContent>
          <TabsContent value="tenants">
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
      </Card>
    </div>
  );
};

const AgentDashboard = ({
  properties,
  maintenanceRequests,
  payments,
  messages,
  stats
}) => {
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = lastDayOfMonth.getDate() - today.getDate();
  const viewingsCount = maintenanceRequests.length; // Using as placeholder for viewings
  const leadsCount = messages.length; // Using as placeholder for leads

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-3">
        <h1 className="text-3xl font-bold">Tableau de bord agent</h1>
        <p className="text-muted-foreground">
          Suivez vos performances, gérez vos visites et maximisez vos commissions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Commissions" 
          value={`${stats.totalRevenue.toLocaleString()} €`} 
          description={`Objectif: ${(stats.totalRevenue * 1.5).toLocaleString()} €`} 
          icon={DollarSign}
          className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900"
        />
        <StatCard 
          title="Visites planifiées" 
          value={viewingsCount.toString()} 
          description={`${daysLeft} jours restants ce mois`} 
          icon={CalendarDays}
          className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900"
        />
        <StatCard 
          title="Leads actifs" 
          value={leadsCount.toString()} 
          description="À contacter cette semaine" 
          icon={User}
          className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900"
        />
        <StatCard 
          title="Taux de conversion" 
          value={`${(stats.pendingPaymentsCount * 10)}%`} 
          description="Visites → Contrats" 
          icon={CheckCircle}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
        />
      </div>
      
      <Card className="p-6 border bg-card">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="properties" className="data-[state=active]:bg-primary">Propriétés</TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-primary">Leads</TabsTrigger>
            <TabsTrigger value="viewings" className="data-[state=active]:bg-primary">Visites</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary">Messages</TabsTrigger>
            <TabsTrigger value="commissions" className="data-[state=active]:bg-primary">Commissions</TabsTrigger>
          </TabsList>
          <TabsContent value="properties">
            <PropertiesTab properties={properties} />
          </TabsContent>
          <TabsContent value="leads">
            <PropertyManagerTab properties={properties} maintenanceRequests={maintenanceRequests} />
          </TabsContent>
          <TabsContent value="viewings">
            <MaintenanceTab maintenanceRequests={maintenanceRequests} />
          </TabsContent>
          <TabsContent value="messages">
            <MessagesTab messages={messages} />
          </TabsContent>
          <TabsContent value="commissions">
            <PaymentsTab payments={payments} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

const LandlordDashboard = ({
  properties,
  maintenanceRequests,
  payments,
  messages,
  stats
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-3">
        <h1 className="text-3xl font-bold">Tableau de bord propriétaire</h1>
        <p className="text-muted-foreground">
          Gérez vos propriétés, suivez vos revenus et supervisez l'ensemble de votre portefeuille immobilier.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Revenu total" 
          value={`${stats.totalRevenue.toLocaleString()} €`} 
          description="Revenu annuel total" 
          icon={DollarSign} 
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900"
        />
        <StatCard 
          title="Propriétés listées" 
          value={stats.propertiesCount.toString()} 
          description="Nombre total de propriétés" 
          icon={Building}
          className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900" 
        />
        <StatCard 
          title="Demandes de maintenance" 
          value={stats.maintenanceCount.toString()} 
          description="Demandes en attente" 
          icon={Wrench}
          className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900" 
        />
        <StatCard 
          title="Paiements en attente" 
          value={stats.pendingPaymentsCount.toString()} 
          description="Paiements à recevoir" 
          icon={FileText}
          className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900" 
        />
      </div>
      
      <Card className="p-6 border bg-card">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="properties" className="data-[state=active]:bg-primary">Propriétés</TabsTrigger>
            <TabsTrigger value="property-managers" className="data-[state=active]:bg-primary">Gestionnaires</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary">Messages</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary">Paiements</TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-primary">Maintenance</TabsTrigger>
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
      </Card>
    </div>
  );
};

const AdminDashboard = ({
  properties,
  maintenanceRequests,
  payments,
  messages,
  stats
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-3">
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        <p className="text-muted-foreground">
          Supervisez l'ensemble du système, gérez les utilisateurs et contrôlez les paramètres de la plateforme.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Utilisateurs actifs" 
          value={(stats.totalRevenue / 500).toFixed(0)} 
          description="Utilisateurs inscrits" 
          icon={Users}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
        />
        <StatCard 
          title="Transactions" 
          value={`${stats.totalRevenue.toLocaleString()} €`} 
          description="Volume total" 
          icon={DollarSign}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
        />
        <StatCard 
          title="Propriétés" 
          value={stats.propertiesCount.toString()} 
          description="Total sur la plateforme" 
          icon={Building}
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"
        />
        <StatCard 
          title="Temps moyen" 
          value="24j" 
          description="Pour finaliser une location" 
          icon={Clock}
          className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900"
        />
      </div>
      
      <Card className="p-6 border bg-card">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="properties" className="data-[state=active]:bg-primary">Propriétés</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary">Utilisateurs</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-primary">Système</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary">Paiements</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary">Rapports</TabsTrigger>
          </TabsList>
          <TabsContent value="properties">
            <PropertiesTab properties={properties} />
          </TabsContent>
          <TabsContent value="users">
            <PropertyManagerTab properties={properties} maintenanceRequests={maintenanceRequests} />
          </TabsContent>
          <TabsContent value="system">
            <MessagesTab messages={messages} />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsTab payments={payments} />
          </TabsContent>
          <TabsContent value="reports">
            <MaintenanceTab maintenanceRequests={maintenanceRequests} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, roles, activeRole } = useAuth();
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
      console.log("Dashboard - Active role:", activeRole);
      fetchDashboardData();
    }
  }, [user, roles, activeRole]);

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
      
      const transformedProperties = data.map(p => ({
        ...p,
        city: p.city || '',
        size_sqm: p.size_sqm || p.area_size,
        main_image_url: p.main_image_url || '/placeholder.svg',
        availability_date: p.availability_date || new Date().toISOString(),
        latitude: p.latitude || 0,
        longitude: p.longitude || 0,
        country: p.country || 'France'
      })) as Property[];
      
      setProperties(transformedProperties);
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
          title: request.properties?.title || 'Propriété inconnue'
        }
      })) as MaintenanceRequest[];
      
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
              first_name: senderProfile?.first_name || 'Inconnu',
              last_name: senderProfile?.last_name || 'Utilisateur'
            }
          };
        }) as Message[];
        
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
            title: payment.lease?.property?.title || 'Propriété inconnue'
          }
        }
      })) as Payment[];
      
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

  const getDashboardByRole = () => {
    console.log("Dashboard - determining dashboard type by active role:", activeRole);
    
    switch(activeRole) {
      case 'admin':
        return 'admin';
      case 'landlord':
        return 'landlord';
      case 'manager':
        return 'manager';
      case 'agent':
        return 'agent';
      case 'tenant':
        return 'tenant';
      case 'vendor':
        navigate('/vendor-dashboard');
        return 'tenant';
      default:
        return 'tenant';
    }
  };

  const dashboardType = getDashboardByRole();
  console.log("Dashboard - selected dashboard type:", dashboardType);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {dashboardType === 'tenant' && (
              <TenantDashboard 
                properties={properties} 
                maintenanceRequests={maintenanceRequests} 
                payments={payments} 
                messages={messages} 
              />
            )}
            {dashboardType === 'manager' && (
              <ManagerDashboard 
                properties={properties} 
                maintenanceRequests={maintenanceRequests} 
                payments={payments} 
                messages={messages} 
                stats={stats} 
              />
            )}
            {dashboardType === 'agent' && (
              <AgentDashboard 
                properties={properties} 
                maintenanceRequests={maintenanceRequests} 
                payments={payments} 
                messages={messages} 
                stats={stats} 
              />
            )}
            {dashboardType === 'landlord' && (
              <LandlordDashboard 
                properties={properties} 
                maintenanceRequests={maintenanceRequests} 
                payments={payments} 
                messages={messages} 
                stats={stats} 
              />
            )}
            {dashboardType === 'admin' && (
              <AdminDashboard 
                properties={properties} 
                maintenanceRequests={maintenanceRequests} 
                payments={payments} 
                messages={messages} 
                stats={stats} 
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
