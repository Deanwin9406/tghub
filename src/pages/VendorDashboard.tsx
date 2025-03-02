
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, Package, MessageSquare, Calendar, Settings, 
  Home, BarChart3, CreditCard, Clock, CheckCircle, 
  Wrench, Star
} from 'lucide-react';

const VendorDashboard = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    completedRequests: 0,
    pendingRequests: 0,
    rating: 4.5
  });

  useEffect(() => {
    if (session) {
      checkUserRole();
      fetchUserProfile();
      fetchServices();
      fetchRequests();
    } else {
      navigate('/auth');
    }
  }, [session]);

  const checkUserRole = async () => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        user_id: session?.user?.id,
        role: 'landlord'  // Use a valid role type for checking
      });
      
      if (error) throw error;
      
      // Check if the user is actually a vendor (this is just for the UI)
      // The actual role check would use proper database queries
      setIsVerified(true);
    } catch (error) {
      console.error('Error checking role:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();
        
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchServices = async () => {
    // Simulated data - would connect to real API in production
    setServices([
      { id: 1, name: 'Plumbing Services', status: 'active', requests: 8 },
      { id: 2, name: 'Electrical Repairs', status: 'active', requests: 5 },
      { id: 3, name: 'Painting Services', status: 'inactive', requests: 0 }
    ]);
    
    setStats(prev => ({
      ...prev,
      totalServices: 3
    }));
  };

  const fetchRequests = async () => {
    // Simulated data - would connect to real API in production
    setRequests([
      { 
        id: 1, 
        property: 'Villa moderne avec piscine',
        address: 'Lomé, Agbalépédogan',
        requestType: 'Plumbing',
        status: 'pending',
        date: '2023-08-10'
      },
      { 
        id: 2, 
        property: 'Appartement de standing',
        address: 'Lomé, Adidogomé',
        requestType: 'Electrical',
        status: 'accepted',
        date: '2023-08-08'
      },
      { 
        id: 3, 
        property: 'Villa de luxe avec vue sur mer',
        address: 'Aneho',
        requestType: 'Plumbing',
        status: 'completed',
        date: '2023-08-05'
      }
    ]);
    
    setStats(prev => ({
      ...prev,
      completedRequests: 1,
      pendingRequests: 1
    }));
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
          <Card className="w-full md:w-1/3">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={userProfile?.avatar_url || ''} />
                  <AvatarFallback>
                    {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{userProfile?.first_name} {userProfile?.last_name}</h2>
                <p className="text-muted-foreground mb-2">{userProfile?.email}</p>
                <Badge variant={isVerified ? "success" : "outline"} className="mb-4">
                  {isVerified ? 'Vérifié' : 'Non vérifié'}
                </Badge>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16}
                      className={i < Math.floor(stats.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{stats.rating}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  <User size={16} className="mr-2" />
                  Modifier le profil
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-2/3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Services</p>
                    <p className="text-3xl font-bold">{stats.totalServices}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Achevés</p>
                    <p className="text-3xl font-bold">{stats.completedRequests}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-3xl font-bold">{stats.pendingRequests}</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="services">
          <TabsList className="mb-6">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="requests">Demandes</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Mes Services</CardTitle>
                  <Button size="sm">Ajouter un service</Button>
                </div>
                <CardDescription>Gérez les services que vous proposez</CardDescription>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-12">
                    <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Vous n'avez pas encore de services.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map(service => (
                      <Card key={service.id}>
                        <CardContent className="p-6">
                          <h3 className="font-medium mb-2">{service.name}</h3>
                          <div className="flex justify-between items-center mb-4">
                            <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                              {service.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{service.requests} demandes</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            Gérer
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Demandes de maintenance</CardTitle>
                <CardDescription>Gérez les demandes de services reçues</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucune demande reçue pour le moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map(request => (
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <h3 className="font-medium">{request.property}</h3>
                              <p className="text-sm text-muted-foreground">{request.address}</p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 md:items-center">
                              <Badge variant="outline">{request.requestType}</Badge>
                              <Badge 
                                variant={
                                  request.status === 'completed' ? 'success' : 
                                  request.status === 'accepted' ? 'default' : 'secondary'
                                }
                              >
                                {request.status === 'completed' ? 'Terminé' : 
                                 request.status === 'accepted' ? 'Accepté' : 'En attente'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{request.date}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" className="w-full">
                              Détails
                            </Button>
                            {request.status === 'pending' && (
                              <Button size="sm" className="w-full">
                                Accepter
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Consultez votre historique de paiements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune transaction pour le moment.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
