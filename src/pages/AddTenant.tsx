
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import TenantQrScanner from '@/components/kyc/TenantQrScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Home, QrCode, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Property = {
  id: string;
  title: string;
  address: string;
};

type TenantDetails = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
};

const AddTenant = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(propertyId || '');
  const [tenantId, setTenantId] = useState<string>('');
  const [tenantDetails, setTenantDetails] = useState<TenantDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('qr');
  
  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);
  
  useEffect(() => {
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    }
  }, [propertyId]);
  
  const fetchProperties = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Determine what properties to fetch based on user role
      let query;
      
      if (roles.includes('admin')) {
        // Admins can add tenants to any property
        query = supabase.from('properties').select('id, title, address');
      } else if (roles.includes('property_manager')) {
        // Property managers can only add tenants to properties they manage
        query = supabase
          .from('properties')
          .select('id, title, address')
          .in('id', 
            supabase
              .from('property_managers')
              .select('property_id')
              .eq('manager_id', user.id)
          );
      } else if (roles.includes('owner')) {
        // Owners can only add tenants to properties they own
        query = supabase
          .from('properties')
          .select('id, title, address')
          .eq('owner_id', user.id);
      } else {
        // Regular users/tenants can't add tenants
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions nécessaires pour ajouter des locataires.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setProperties(data || []);
      
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les propriétés. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTenantScanned = async (scannedTenantId: string) => {
    if (!scannedTenantId) return;
    
    setTenantId(scannedTenantId);
    await fetchTenantDetails(scannedTenantId);
  };
  
  const fetchTenantDetails = async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      setTenantDetails(data);
      
    } catch (error) {
      console.error('Error fetching tenant details:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du locataire. Veuillez réessayer.",
        variant: "destructive"
      });
      setTenantDetails(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTenantIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      toast({
        title: "ID manquant",
        description: "Veuillez entrer l'ID du locataire.",
        variant: "destructive"
      });
      return;
    }
    
    await fetchTenantDetails(tenantId);
  };
  
  const assignTenantToProperty = async () => {
    if (!selectedPropertyId || !tenantId) {
      toast({
        title: "Données manquantes",
        description: "Veuillez sélectionner une propriété et un locataire.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // First, check if the tenant already has an active lease for this property
      const { data: existingLeases, error: leaseCheckError } = await supabase
        .from('leases')
        .select('id')
        .eq('property_id', selectedPropertyId)
        .eq('tenant_id', tenantId)
        .eq('status', 'active');
        
      if (leaseCheckError) {
        throw leaseCheckError;
      }
      
      if (existingLeases && existingLeases.length > 0) {
        toast({
          title: "Locataire déjà assigné",
          description: "Ce locataire est déjà assigné à cette propriété.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Create a new lease for the tenant
      const now = new Date();
      const oneYearFromNow = new Date(now);
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      
      const { error } = await supabase
        .from('leases')
        .insert({
          property_id: selectedPropertyId,
          tenant_id: tenantId,
          start_date: now.toISOString().split('T')[0],
          end_date: oneYearFromNow.toISOString().split('T')[0],
          monthly_rent: 0, // This should be set to the actual rent amount
          deposit_amount: 0, // This should be set to the actual deposit amount
          status: 'active'
        });
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Locataire assigné",
        description: "Le locataire a été assigné avec succès à la propriété.",
      });
      
      // Navigate back to the property details page
      navigate(`/properties/${selectedPropertyId}`);
      
    } catch (error) {
      console.error('Error assigning tenant to property:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le locataire à la propriété. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Ajouter un locataire</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Identifier le locataire</CardTitle>
                <CardDescription>
                  Scannez le code QR du locataire ou entrez son ID manuellement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="qr">
                      <QrCode className="h-4 w-4 mr-2" />
                      Scanner un code QR
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                      <User className="h-4 w-4 mr-2" />
                      Saisie manuelle
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="qr" className="py-4">
                    <TenantQrScanner 
                      propertyId={selectedPropertyId} 
                      onTenantFound={handleTenantScanned} 
                    />
                  </TabsContent>
                  <TabsContent value="manual" className="py-4">
                    <form onSubmit={handleTenantIdSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="tenantId">ID du locataire</Label>
                        <Input 
                          id="tenantId" 
                          value={tenantId} 
                          onChange={(e) => setTenantId(e.target.value)}
                          placeholder="Entrez l'ID unique du locataire"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          L'ID unique du locataire se trouve dans son profil après vérification KYC.
                        </p>
                      </div>
                      <Button type="submit" disabled={isLoading || !tenantId}>
                        {isLoading ? 'Recherche en cours...' : 'Rechercher le locataire'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                
                {tenantDetails && (
                  <div className="mt-8">
                    <Separator className="mb-4" />
                    <h3 className="text-lg font-medium mb-4">Détails du locataire</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nom</Label>
                        <div className="p-2 bg-muted/30 rounded">
                          {tenantDetails.first_name} {tenantDetails.last_name}
                        </div>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <div className="p-2 bg-muted/30 rounded">
                          {tenantDetails.email}
                        </div>
                      </div>
                      <div>
                        <Label>Téléphone</Label>
                        <div className="p-2 bg-muted/30 rounded">
                          {tenantDetails.phone || 'Non spécifié'}
                        </div>
                      </div>
                      <div>
                        <Label>ID du locataire</Label>
                        <div className="p-2 bg-muted/30 rounded">
                          {tenantDetails.id}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Détails de l'assignation</CardTitle>
                <CardDescription>
                  Sélectionnez une propriété à laquelle assigner ce locataire.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="property">Propriété</Label>
                  <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une propriété" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedPropertyId && properties.length > 0 && (
                  <div className="p-3 bg-muted/30 rounded flex items-start gap-3">
                    <Home className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {properties.find(p => p.id === selectedPropertyId)?.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {properties.find(p => p.id === selectedPropertyId)?.address}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={!selectedPropertyId || !tenantDetails || isLoading}
                  onClick={assignTenantToProperty}
                >
                  {isLoading ? 'Traitement en cours...' : 'Assigner le locataire'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddTenant;
