
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TenantQrScanner from '@/components/kyc/TenantQrScanner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AddTenant = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [property, setProperty] = useState<any>(null);
  const [tenant, setTenant] = useState<{ userId: string; firstName: string; lastName: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { roles } = useAuth();

  useEffect(() => {
    if (!propertyId) return;
    
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, address')
          .eq('id', propertyId)
          .single();
          
        if (error) throw error;
        setProperty(data);
      } catch (error: any) {
        console.error('Error fetching property:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations de la propriété",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [propertyId, toast]);

  const handleTenantFound = (tenantData: { userId: string; firstName: string; lastName: string }) => {
    setTenant(tenantData);
  };

  const handleFinish = () => {
    navigate(`/property/${propertyId}`);
  };

  const isAllowed = () => {
    return roles.includes('admin') || roles.includes('owner') || roles.includes('property_manager');
  };

  if (!isAllowed()) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Accès non autorisé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour ajouter des locataires.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Ajouter un Locataire</h1>
      
      {property && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Propriété</CardTitle>
            <CardDescription>
              Informations sur la propriété à laquelle vous souhaitez ajouter un locataire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-semibold">{property.title}</h3>
              <p className="text-muted-foreground">{property.address}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {tenant ? (
        <Card>
          <CardHeader>
            <CardTitle>Locataire Ajouté</CardTitle>
            <CardDescription>
              Le locataire a été vérifié et associé à la propriété
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">{tenant.firstName} {tenant.lastName}</h3>
                <p className="text-muted-foreground">Locataire vérifié</p>
              </div>
            </div>
            
            <Button onClick={handleFinish}>
              Terminer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TenantQrScanner 
          onTenantFound={handleTenantFound} 
          propertyId={propertyId} 
        />
      )}
    </div>
  );
};

export default AddTenant;
