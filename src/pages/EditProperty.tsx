
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PropertyForm from '@/components/PropertyForm';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PropertyType {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  main_image_url: string | null;
  status: string;
  description: string | null;
  size_sqm: number | null;
  amenities: string[] | null;
  owner_id: string;
}

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchPropertyData();
    }
  }, [id, user]);

  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      // Fetch the property data
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;
      
      // Check permission
      const authorizedRoles = ['landlord', 'agent', 'manager', 'admin'];
      let permitted = roles.some(role => authorizedRoles.includes(role));
      
      // Only the owner, assigned agents, or property managers can edit
      if (propertyData.owner_id !== user.id) {
        // Check if user is an assigned agent for this property
        if (roles.includes('agent')) {
          const { data: agentAssignment, error: agentError } = await supabase
            .from('agent_properties')
            .select('*')
            .eq('agent_id', user.id)
            .eq('property_id', id)
            .single();
            
          permitted = permitted && !!agentAssignment;
        }
        
        // Check if user is a property manager for this property
        if (roles.includes('manager')) {
          const { data: managerAssignment, error: managerError } = await supabase
            .from('property_managers')
            .select('*')
            .eq('manager_id', user.id)
            .eq('property_id', id)
            .single();
            
          permitted = permitted && !!managerAssignment;
        }
        
        // If not owner, agent, or manager, deny permission
        if (!permitted) {
          toast({
            title: 'Permission denied',
            description: 'You do not have permission to edit this property.',
            variant: 'destructive',
          });
          setTimeout(() => navigate('/property-management'), 2000);
          return;
        }
      }
      
      setProperty(propertyData);
      setHasPermission(permitted);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (propertyData: any) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price,
          property_type: propertyData.type,
          bedrooms: propertyData.beds,
          bathrooms: propertyData.baths,
          size_sqm: propertyData.area,
          main_image_url: propertyData.image,
          city: propertyData.location,
          address: propertyData.address,
          country: propertyData.country || 'Togo',
          amenities: propertyData.amenities
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Propriété mise à jour',
        description: 'La propriété a été mise à jour avec succès.',
      });
      navigate('/property-management');
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update property',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!hasPermission) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to edit this property.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Modifier la propriété</h1>
        <PropertyForm 
          onSubmit={handleSubmit} 
          propertyId={id} 
          isEditing={true}
          initialData={property}
        />
      </div>
    </Layout>
  );
};

export default EditProperty;
