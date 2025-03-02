import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
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
  const { user } = useAuth();

  // Debug route params
  useEffect(() => {
    console.log("AddTenant - propertyId from params:", propertyId);
  }, [propertyId]);

  // Check if user has the necessary role
  const [roles, setRoles] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        if (error) throw error;
        setRoles(data.map(r => r.role));
      } catch (error: any) {
        console.error('Error fetching user roles:', error);
      }
    };
    
    fetchUserRoles();
  }, [user]);

  useEffect(() => {
    if (!propertyId) {
      console.error("No propertyId provided in route params");
      toast({
        title: "Erreur",
        description: "Identifiant de propriété manquant",
        variant: "destructive"
      });
      return;
    }
    
    const fetchProperty = async () => {
      setLoading(true);
      try {
        console.log("Fetching property with ID:", propertyId);
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, address')
          .eq('id', propertyId)
          .single();
          
        if (error) throw error;
        console.log("Property data retrieved:", data);
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
    
    // Create a lease record
    createLease(tenantData.userId);
  };
  
  const createLease = async (tenantId: string) => {
    if (!propertyId) return;
    
    try {
      // First check if lease already exists
      const { data: existingLease } = await supabase
        .from('leases')
        .select('id')
        .eq('property_id', propertyId)
        .eq('tenant_id', tenantId)
        .single();
        
      if (existingLease) {
        toast({
          title: "Information",
          description: "Ce locataire est déjà associé à cette propriété",
        });
        return;
      }
      
      // Create new lease
      const { error } = await supabase
        .from('leases')
        .insert({
          property_id: propertyId,
          tenant_id: tenantId,
          start_date: new Date().toISOString().split('T')[0], // Today
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // One year from now
          monthly_rent: 0, // Default values, to be updated later
          deposit_amount: 0,
          status: 'active'
        });
        
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Locataire ajouté avec succès à la propriété",
      });
    } catch (error: any) {
      console.error('Error creating lease:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le locataire à la propriété",
        variant: "destructive"
      });
    }
  };

  const handleFinish = () => {
    navigate(`/property/${propertyId}`);
  };

  const isAllowed = () => {
    return roles.includes('admin') || roles.includes('owner') || roles.includes('property_manager');
  };

  if (!isAllowed()) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
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
    </Layout>
  );
};

export default AddTenant;
