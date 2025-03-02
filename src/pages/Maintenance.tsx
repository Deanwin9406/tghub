
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, LayoutGrid, ClipboardList, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

// This page is a placeholder with mockup data until we implement the backend
const Maintenance = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state for the new request
  const [newRequest, setNewRequest] = useState({
    propertyId: '',
    category: '',
    title: '',
    description: '',
    urgency: 'medium',
  });
  
  // Mock maintenance requests data
  const [requests, setRequests] = useState([
    {
      id: '1',
      property: 'Villa Olympique 24',
      title: 'Problème de plomberie',
      description: 'Le robinet de la salle de bain fuit constamment.',
      category: 'plumbing',
      status: 'pending',
      urgency: 'medium',
      created_at: '2023-06-15T09:23:00Z',
      updated_at: '2023-06-15T10:45:00Z',
    },
    {
      id: '2',
      property: 'Villa Olympique 24',
      title: 'Panne d\'électricité',
      description: 'La prise électrique dans la cuisine ne fonctionne pas.',
      category: 'electrical',
      status: 'in_progress',
      urgency: 'high',
      created_at: '2023-06-10T14:30:00Z',
      updated_at: '2023-06-11T09:15:00Z',
    },
    {
      id: '3',
      property: 'Villa Olympique 24',
      title: 'Réparation de serrure',
      description: 'La serrure de la porte d\'entrée est difficile à ouvrir.',
      category: 'locksmith',
      status: 'completed',
      urgency: 'medium',
      created_at: '2023-05-25T11:45:00Z',
      updated_at: '2023-05-27T16:20:00Z',
    },
    {
      id: '4',
      property: 'Villa Olympique 24',
      title: 'Problème de climatisation',
      description: 'La climatisation ne refroidit pas correctement la chambre principale.',
      category: 'hvac',
      status: 'pending',
      urgency: 'high',
      created_at: '2023-06-14T08:10:00Z',
      updated_at: '2023-06-14T08:10:00Z',
    },
  ]);
  
  // Mock properties data
  const properties = [
    { id: '1', name: 'Villa Olympique 24' },
    { id: '2', name: 'Appartement Hédzranawoe' },
  ];
  
  const categoryOptions = [
    { value: 'plumbing', label: 'Plomberie' },
    { value: 'electrical', label: 'Électricité' },
    { value: 'hvac', label: 'Climatisation/Chauffage' },
    { value: 'locksmith', label: 'Serrurerie' },
    { value: 'appliance', label: 'Électroménager' },
    { value: 'structural', label: 'Structure/Construction' },
    { value: 'pest', label: 'Nuisibles' },
    { value: 'other', label: 'Autre' },
  ];
  
  const urgencyOptions = [
    { value: 'low', label: 'Basse', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Haute', color: 'bg-red-100 text-red-800' },
  ];
  
  const statusOptions = {
    pending: { label: 'En attente', icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
    in_progress: { label: 'En cours', icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Terminé', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
  };
  
  const getCategoryLabel = (category: string) => {
    return categoryOptions.find(c => c.value === category)?.label || category;
  };
  
  const getUrgencyData = (urgency: string) => {
    return urgencyOptions.find(u => u.value === urgency) || urgencyOptions[1]; // Default to medium
  };
  
  const getStatusData = (status: string) => {
    return statusOptions[status as keyof typeof statusOptions] || statusOptions.pending;
  };
  
  const filteredRequests = activeTab === 'all'
    ? requests
    : requests.filter(req => req.status === activeTab);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewRequest(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app, we would save to the database here
    setTimeout(() => {
      const newId = Math.floor(Math.random() * 1000).toString();
      const propertyName = properties.find(p => p.id === newRequest.propertyId)?.name || '';
      
      const newMaintenanceRequest = {
        id: newId,
        property: propertyName,
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        status: 'pending',
        urgency: newRequest.urgency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setRequests(prev => [newMaintenanceRequest, ...prev]);
      setDialogOpen(false);
      setLoading(false);
      setNewRequest({
        propertyId: '',
        category: '',
        title: '',
        description: '',
        urgency: 'medium',
      });
      
      toast({
        title: 'Demande créée',
        description: 'Votre demande de maintenance a été soumise avec succès.',
      });
    }, 1000);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Maintenance</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvelle demande de maintenance</DialogTitle>
                <DialogDescription>
                  Veuillez fournir les détails de votre problème pour que nous puissions vous aider rapidement.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyId">Propriété</Label>
                  <Select 
                    value={newRequest.propertyId} 
                    onValueChange={(value) => handleSelectChange('propertyId', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une propriété" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select 
                    value={newRequest.category} 
                    onValueChange={(value) => handleSelectChange('category', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgence</Label>
                  <Select 
                    value={newRequest.urgency} 
                    onValueChange={(value) => handleSelectChange('urgency', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le niveau d'urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newRequest.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newRequest.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Soumission...
                      </>
                    ) : (
                      'Soumettre la demande'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all" className="px-4">
                Toutes
              </TabsTrigger>
              <TabsTrigger value="pending" className="px-4">
                En attente
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="px-4">
                En cours
              </TabsTrigger>
              <TabsTrigger value="completed" className="px-4">
                Terminées
              </TabsTrigger>
            </TabsList>
            <div className="hidden md:flex space-x-2">
              <Button variant="outline" size="sm">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grille
              </Button>
              <Button variant="outline" size="sm">
                <ClipboardList className="h-4 w-4 mr-2" />
                Liste
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune demande trouvée</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore soumis de demande de maintenance.
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouvelle demande
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge className={getStatusData(request.status).color}>
                          <span className="flex items-center">
                            {getStatusData(request.status).icon}
                            <span className="ml-1">{getStatusData(request.status).label}</span>
                          </span>
                        </Badge>
                      </div>
                      <CardDescription>{request.property}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3 mb-4">
                        {request.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Catégorie:</span>
                          <p className="font-medium">{getCategoryLabel(request.category)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Urgence:</span>
                          <div className="flex items-center">
                            <Badge variant="outline" className={getUrgencyData(request.urgency).color}>
                              {getUrgencyData(request.urgency).label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Créée le:</span>
                          <p className="font-medium">{formatDate(request.created_at)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mise à jour:</span>
                          <p className="font-medium">{formatDate(request.updated_at)}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            {/* Same content structure as "all" tab but filtered for pending */}
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune demande en attente</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez actuellement aucune demande de maintenance en attente.
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouvelle demande
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Same grid as in "all" tab
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="transition-all hover:shadow-md">
                    {/* Same card content as in "all" tab */}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge className={getStatusData(request.status).color}>
                          <span className="flex items-center">
                            {getStatusData(request.status).icon}
                            <span className="ml-1">{getStatusData(request.status).label}</span>
                          </span>
                        </Badge>
                      </div>
                      <CardDescription>{request.property}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3 mb-4">
                        {request.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Catégorie:</span>
                          <p className="font-medium">{getCategoryLabel(request.category)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Urgence:</span>
                          <div className="flex items-center">
                            <Badge variant="outline" className={getUrgencyData(request.urgency).color}>
                              {getUrgencyData(request.urgency).label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Créée le:</span>
                          <p className="font-medium">{formatDate(request.created_at)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mise à jour:</span>
                          <p className="font-medium">{formatDate(request.updated_at)}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in_progress" className="mt-0">
            {/* Same content structure as other tabs but filtered for in_progress */}
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune demande en cours</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez actuellement aucune demande de maintenance en cours de traitement.
                  </p>
                </CardContent>
              </Card>
            ) : (
              // Same grid as other tabs
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="transition-all hover:shadow-md">
                    {/* Same card content as other tabs */}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge className={getStatusData(request.status).color}>
                          <span className="flex items-center">
                            {getStatusData(request.status).icon}
                            <span className="ml-1">{getStatusData(request.status).label}</span>
                          </span>
                        </Badge>
                      </div>
                      <CardDescription>{request.property}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3 mb-4">
                        {request.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Catégorie:</span>
                          <p className="font-medium">{getCategoryLabel(request.category)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Urgence:</span>
                          <div className="flex items-center">
                            <Badge variant="outline" className={getUrgencyData(request.urgency).color}>
                              {getUrgencyData(request.urgency).label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Créée le:</span>
                          <p className="font-medium">{formatDate(request.created_at)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mise à jour:</span>
                          <p className="font-medium">{formatDate(request.updated_at)}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            {/* Same content structure as other tabs but filtered for completed */}
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune demande terminée</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez actuellement aucune demande de maintenance terminée.
                  </p>
                </CardContent>
              </Card>
            ) : (
              // Same grid as other tabs
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="transition-all hover:shadow-md">
                    {/* Same card content as other tabs */}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge className={getStatusData(request.status).color}>
                          <span className="flex items-center">
                            {getStatusData(request.status).icon}
                            <span className="ml-1">{getStatusData(request.status).label}</span>
                          </span>
                        </Badge>
                      </div>
                      <CardDescription>{request.property}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3 mb-4">
                        {request.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Catégorie:</span>
                          <p className="font-medium">{getCategoryLabel(request.category)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Urgence:</span>
                          <div className="flex items-center">
                            <Badge variant="outline" className={getUrgencyData(request.urgency).color}>
                              {getUrgencyData(request.urgency).label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Créée le:</span>
                          <p className="font-medium">{formatDate(request.created_at)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mise à jour:</span>
                          <p className="font-medium">{formatDate(request.updated_at)}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Maintenance;
