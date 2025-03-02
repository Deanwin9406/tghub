
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Calendar, CheckCircle, Clock, Home, Newspaper, Package, ShoppingBag, Tool, UserPlus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { session, user, roles } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("services");
  
  // Form state
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    category: 'maintenance',
    price: '',
    price_type: 'fixed'
  });
  
  useEffect(() => {
    if (!session) {
      navigate('/auth');
      return;
    }
    
    // Check if user has vendor role
    if (!roles.includes('vendor')) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions d'accéder au tableau de bord des prestataires.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
    
    fetchServices();
    fetchServiceRequests();
  }, [session, navigate, roles]);
  
  const fetchServices = async () => {
    setLoading(true);
    try {
      // This is a mock implementation since the table doesn't exist yet
      // In a real app, we would fetch from a vendor_services table
      setTimeout(() => {
        setServices([
          {
            id: '1',
            title: 'Plomberie - Réparation de fuite',
            description: 'Service de réparation rapide pour tout type de fuite d\'eau.',
            category: 'maintenance',
            price: 25000,
            price_type: 'hourly',
            created_at: '2023-05-15T10:30:00Z',
            status: 'active'
          },
          {
            id: '2',
            title: 'Électricité - Installation',
            description: 'Installation électrique complète ou partielle.',
            category: 'installation',
            price: 45000,
            price_type: 'fixed',
            created_at: '2023-06-20T14:45:00Z',
            status: 'active'
          },
          {
            id: '3',
            title: 'Peinture - Intérieure',
            description: 'Peinture intérieure de qualité professionnelle.',
            category: 'renovation',
            price: 3500,
            price_type: 'sqm',
            created_at: '2023-07-05T09:15:00Z',
            status: 'active'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos services',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };
  
  const fetchServiceRequests = async () => {
    // This is a mock implementation since the table doesn't exist yet
    // In a real app, we would fetch from a service_requests table
    setTimeout(() => {
      setRequests([
        {
          id: '1',
          service_id: '1',
          service_title: 'Plomberie - Réparation de fuite',
          client_name: 'Sophie Mensah',
          property_address: '45 Rue Gbaga, Lomé',
          requested_date: '2023-11-15T09:00:00Z',
          status: 'pending',
          message: 'J\'ai une fuite sous l\'évier qui s\'aggrave.'
        },
        {
          id: '2',
          service_id: '2',
          service_title: 'Électricité - Installation',
          client_name: 'Koffi Abalo',
          property_address: '23 Boulevard du 30 Août, Lomé',
          requested_date: '2023-11-18T14:30:00Z',
          status: 'confirmed',
          message: 'J\'ai besoin d\'installer des prises supplémentaires dans ma cuisine.'
        },
        {
          id: '3',
          service_id: '3',
          service_title: 'Peinture - Intérieure',
          client_name: 'Ama Kodjo',
          property_address: '7 Rue des Hydrocarbures, Lomé',
          requested_date: '2023-12-05T10:00:00Z',
          status: 'completed',
          message: 'Je veux repeindre mon salon et ma chambre principale.'
        }
      ]);
    }, 1000);
  };
  
  const addService = () => {
    // Mock implementation
    const newServiceObj = {
      id: Date.now().toString(),
      ...newService,
      price: parseFloat(newService.price),
      created_at: new Date().toISOString(),
      status: 'active'
    };
    
    setServices([newServiceObj, ...services]);
    setServiceFormOpen(false);
    toast({
      title: 'Service ajouté',
      description: 'Votre nouveau service a été créé avec succès.',
    });
    
    // Reset form
    setNewService({
      title: '',
      description: '',
      category: 'maintenance',
      price: '',
      price_type: 'fixed'
    });
  };
  
  const updateRequestStatus = (id: string, newStatus: string) => {
    // Mock implementation
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));
    
    toast({
      title: 'Statut mis à jour',
      description: 'Le statut de la demande a été mis à jour.',
    });
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance':
        return <Tool className="h-4 w-4" />;
      case 'installation':
        return <Home className="h-4 w-4" />;
      case 'renovation':
        return <Package className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };
  
  const formatPrice = (price: number, type: string) => {
    const formattedPrice = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(price);
    
    switch (type) {
      case 'hourly':
        return `${formattedPrice}/heure`;
      case 'sqm':
        return `${formattedPrice}/m²`;
      default:
        return formattedPrice;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">En attente</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Confirmé</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tableau de Bord Prestataire</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos services et suivez vos demandes
            </p>
          </div>
          <Button onClick={() => setServiceFormOpen(true)} className="mt-4 md:mt-0">
            Ajouter un nouveau service
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{services.length}</CardTitle>
              <CardDescription>Services actifs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-primary">
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Total des services proposés</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                {requests.filter(req => req.status === 'pending').length}
              </CardTitle>
              <CardDescription>Demandes en attente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-yellow-500">
                <Clock className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Nécessitent votre attention</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                {requests.filter(req => req.status === 'completed').length}
              </CardTitle>
              <CardDescription>Services complétés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-green-500">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Ce mois-ci</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="services">Mes Services</TabsTrigger>
            <TabsTrigger value="requests">Demandes de Service</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{service.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            {getCategoryIcon(service.category)}
                            <span className="ml-1 capitalize">{service.category}</span>
                          </CardDescription>
                        </div>
                        <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                          {service.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                      <div className="font-semibold text-lg">
                        {formatPrice(service.price, service.price_type)}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        {service.status === 'active' ? 'Désactiver' : 'Activer'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Aucun service disponible</CardTitle>
                  <CardDescription>
                    Vous n'avez pas encore ajouté de services à votre profil.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setServiceFormOpen(true)}>
                    Ajouter votre premier service
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-4">
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div>
                          <CardTitle className="text-lg">{request.service_title}</CardTitle>
                          <CardDescription>
                            Demandé par {request.client_name}
                          </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Adresse</p>
                          <p className="text-sm text-muted-foreground">{request.property_address}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Date demandée</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.requested_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium">Message</p>
                        <p className="text-sm text-muted-foreground">{request.message}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2 w-full">
                          <Button 
                            className="flex-1"
                            onClick={() => updateRequestStatus(request.id, 'confirmed')}
                          >
                            Confirmer
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => updateRequestStatus(request.id, 'cancelled')}
                          >
                            Refuser
                          </Button>
                        </div>
                      )}
                      
                      {request.status === 'confirmed' && (
                        <div className="flex space-x-2 w-full">
                          <Button 
                            className="flex-1"
                            onClick={() => updateRequestStatus(request.id, 'completed')}
                          >
                            Marquer comme terminé
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Contacter le client
                          </Button>
                        </div>
                      )}
                      
                      {request.status === 'completed' && (
                        <div className="w-full text-center text-sm text-muted-foreground">
                          Service terminé le {new Date().toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      )}
                      
                      {request.status === 'cancelled' && (
                        <div className="w-full text-center text-sm text-muted-foreground">
                          Cette demande a été annulée
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Aucune demande de service</CardTitle>
                  <CardDescription>
                    Vous n'avez pas encore reçu de demandes pour vos services.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Les demandes apparaîtront ici lorsque des clients seront intéressés par vos services.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Service Creation Dialog */}
      <Dialog open={serviceFormOpen} onOpenChange={setServiceFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau service</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du service</Label>
              <Input 
                id="title" 
                placeholder="Ex: Plomberie - Réparation de fuite" 
                value={newService.title}
                onChange={(e) => setNewService({...newService, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                value={newService.category} 
                onValueChange={(value) => setNewService({...newService, category: value})}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="renovation">Rénovation</SelectItem>
                  <SelectItem value="cleaning">Nettoyage</SelectItem>
                  <SelectItem value="security">Sécurité</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Décrivez votre service en détail..." 
                value={newService.description}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix</Label>
                <Input 
                  id="price" 
                  type="number" 
                  placeholder="15000" 
                  value={newService.price}
                  onChange={(e) => setNewService({...newService, price: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price_type">Type de prix</Label>
                <Select 
                  value={newService.price_type} 
                  onValueChange={(value) => setNewService({...newService, price_type: value})}
                >
                  <SelectTrigger id="price_type">
                    <SelectValue placeholder="Type de prix" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixe</SelectItem>
                    <SelectItem value="hourly">Par heure</SelectItem>
                    <SelectItem value="sqm">Par m²</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceFormOpen(false)}>Annuler</Button>
            <Button type="button" onClick={addService}>Créer le service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default VendorDashboard;
