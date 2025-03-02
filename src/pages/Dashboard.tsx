import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Building, CreditCard, Wrench, MessageCircle, Users, AlertTriangle } from 'lucide-react';
import Map from '@/components/Map';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  price: number;
  price_unit: string;
  address: string;
  city: string;
  status: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  status: string;
  priority: number;
  created_at: string;
  property: {
    title: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
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
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const isLandlord = roles.includes('landlord');
  const isTenant = roles.includes('tenant');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        if (isLandlord) {
          // Fetch landlord properties
          const { data: propertiesData, error: propertiesError } = await supabase
            .from('properties')
            .select('id, title, price, price_unit, address, city, status, type, latitude, longitude')
            .eq('owner_id', user?.id)
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (propertiesError) throw propertiesError;
          setProperties(propertiesData || []);
          
          // Fetch maintenance requests for landlord properties
          const { data: maintenanceData, error: maintenanceError } = await supabase
            .from('maintenance_requests')
            .select(`
              id, title, status, priority, created_at,
              property:property_id (title)
            `)
            .in('property_id', propertiesData?.map(p => p.id) || [])
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (maintenanceError) throw maintenanceError;
          setMaintenanceRequests(maintenanceData || []);
        }
        
        if (isTenant) {
          // Fetch tenant's recent payments
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select(`
              id, amount, currency, status, due_date,
              lease:lease_id (
                property:property_id (title)
              )
            `)
            .eq('tenant_id', user?.id)
            .order('due_date', { ascending: false })
            .limit(5);
            
          if (paymentsError) throw paymentsError;
          setPayments(paymentsData || []);
          
          // Fetch tenant's maintenance requests
          const { data: maintenanceData, error: maintenanceError } = await supabase
            .from('maintenance_requests')
            .select(`
              id, title, status, priority, created_at,
              property:property_id (title)
            `)
            .eq('tenant_id', user?.id)
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (maintenanceError) throw maintenanceError;
          setMaintenanceRequests(maintenanceData || []);
        }
        
        // Fetch recent messages for all users
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id, content, created_at,
            sender:sender_id (first_name, last_name)
          `)
          .or(`recipient_id.eq.${user?.id},sender_id.eq.${user?.id}`)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (messagesError) throw messagesError;
        setMessages(messagesData || []);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, isLandlord, isTenant]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-60 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bonjour, {profile?.first_name || 'Utilisateur'}
            </h1>
            <p className="text-muted-foreground">
              Bienvenue sur votre tableau de bord TogoProp
            </p>
          </div>
          {!isLandlord && !isTenant && (
            <Card className="w-full md:w-auto mt-4 md:mt-0 bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  <p className="text-sm text-amber-700">
                    Complétez votre profil pour accéder à toutes les fonctionnalités
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            {isLandlord && <TabsTrigger value="properties">Propriétés</TabsTrigger>}
            {isTenant && <TabsTrigger value="leases">Baux</TabsTrigger>}
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                    Messages récents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucun message récent</p>
                  ) : (
                    <ul className="space-y-2">
                      {messages.slice(0, 3).map((message) => (
                        <li key={message.id} className="text-sm">
                          <span className="font-medium">{message.sender.first_name} {message.sender.last_name}: </span>
                          {message.content.length > 40 ? `${message.content.substring(0, 40)}...` : message.content}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/messages')}>
                    Voir tous les messages
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-primary" />
                    Demandes de maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {maintenanceRequests.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucune demande en cours</p>
                  ) : (
                    <ul className="space-y-2">
                      {maintenanceRequests.slice(0, 3).map((request) => (
                        <li key={request.id} className="text-sm flex items-center justify-between">
                          <span>{request.title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/maintenance')}>
                    Gérer les demandes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    Paiements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {payments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucun paiement récent</p>
                  ) : (
                    <ul className="space-y-2">
                      {payments.slice(0, 3).map((payment) => (
                        <li key={payment.id} className="text-sm flex items-center justify-between">
                          <span>{payment.amount.toLocaleString()} {payment.currency}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/payments')}>
                    Voir tous les paiements
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {properties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Carte des propriétés</CardTitle>
                  <CardDescription>Localisez vos propriétés sur la carte</CardDescription>
                </CardHeader>
                <CardContent>
                  <Map 
                    properties={properties.map(p => ({
                      id: p.id,
                      latitude: p.latitude || 0,
                      longitude: p.longitude || 0,
                      title: p.title,
                      price: p.price,
                      currency: p.price_unit,
                      type: p.type
                    }))}
                    height="400px"
                    onPropertyClick={(id) => navigate(`/property/${id}`)}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {isLandlord && (
            <TabsContent value="properties" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mes Propriétés</h2>
                <Button onClick={() => navigate('/property-management')}>
                  + Ajouter une propriété
                </Button>
              </div>
              
              {properties.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Building className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-xl font-medium mb-2">Aucune propriété</p>
                    <p className="text-muted-foreground mb-6 text-center">
                      Vous n'avez pas encore ajouté de propriétés à votre compte.
                    </p>
                    <Button onClick={() => navigate('/property-management')}>
                      Ajouter votre première propriété
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <Card key={property.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted"></div>
                      <CardHeader>
                        <CardTitle>{property.title}</CardTitle>
                        <CardDescription>{property.address}, {property.city}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <p className="font-bold text-lg">{property.price.toLocaleString()} {property.price_unit}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(property.status)}`}>
                            {property.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{property.type}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/property/${property.id}`)}>
                          Détails
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/property-management/${property.id}`)}>
                          Modifier
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {isTenant && (
            <TabsContent value="leases" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mes Baux</h2>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-10">
                    <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-xl font-medium mb-2">Section en construction</p>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      La section des baux est en cours de développement. Revenez bientôt pour voir vos contrats de location.
                    </p>
                    <Button onClick={() => navigate('/search')}>
                      Rechercher des propriétés
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="maintenance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Maintenance</h2>
              {isTenant && (
                <Button onClick={() => navigate('/maintenance/new')}>
                  + Nouvelle demande
                </Button>
              )}
            </div>
            
            {maintenanceRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-medium mb-2">Aucune demande</p>
                  <p className="text-muted-foreground mb-6 text-center">
                    Vous n'avez pas encore de demandes de maintenance.
                  </p>
                  {isTenant && (
                    <Button onClick={() => navigate('/maintenance/new')}>
                      Créer une demande
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Titre</th>
                      <th className="text-left p-3 font-medium">Propriété</th>
                      <th className="text-left p-3 font-medium">Statut</th>
                      <th className="text-left p-3 font-medium">Priorité</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRequests.map((request) => (
                      <tr key={request.id} className="border-t">
                        <td className="p-3">{request.title}</td>
                        <td className="p-3">{request.property?.title || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            request.priority > 2 ? 'bg-red-100 text-red-800' : 
                            request.priority > 1 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.priority > 2 ? 'Urgente' : 
                            request.priority > 1 ? 'Moyenne' : 'Basse'}
                          </span>
                        </td>
                        <td className="p-3">{formatDate(request.created_at)}</td>
                        <td className="p-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/maintenance/${request.id}`)}
                          >
                            Détails
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Paiements</h2>
              {isTenant && (
                <Button onClick={() => navigate('/payments/new')}>
                  + Nouveau paiement
                </Button>
              )}
            </div>
            
            {payments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-medium mb-2">Aucun paiement</p>
                  <p className="text-muted-foreground mb-6 text-center">
                    Vous n'avez pas encore effectué de paiements.
                  </p>
                  {isTenant && (
                    <Button onClick={() => navigate('/payments/new')}>
                      Effectuer un paiement
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Montant</th>
                      <th className="text-left p-3 font-medium">Propriété</th>
                      <th className="text-left p-3 font-medium">Statut</th>
                      <th className="text-left p-3 font-medium">Date d'échéance</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-t">
                        <td className="p-3 font-medium">{payment.amount.toLocaleString()} {payment.currency}</td>
                        <td className="p-3">{payment.lease?.property?.title || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="p-3">{formatDate(payment.due_date)}</td>
                        <td className="p-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/payments/${payment.id}`)}
                          >
                            Détails
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Messages</h2>
              <Button onClick={() => navigate('/messages')}>
                Voir tous les messages
              </Button>
            </div>
            
            {messages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-medium mb-2">Aucun message</p>
                  <p className="text-muted-foreground mb-6 text-center">
                    Vous n'avez pas encore de messages.
                  </p>
                  <Button onClick={() => navigate('/messages/new')}>
                    Envoyer un message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {messages.map((message) => (
                      <li key={message.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium">De: {message.sender.first_name} {message.sender.last_name}</h3>
                          <span className="text-xs text-muted-foreground">{formatDate(message.created_at)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {message.content.length > 100 
                            ? `${message.content.substring(0, 100)}...` 
                            : message.content}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <Button className="w-full" onClick={() => navigate('/messages')}>
                    Voir tous les messages
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
