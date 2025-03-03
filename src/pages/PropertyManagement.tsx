
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import { PropertyType } from '@/contexts/FavoritesContext';

const PropertyManagement = () => {
  const navigate = useNavigate();
  const { user, session, roles } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [canCreateListings, setCanCreateListings] = useState(false);

  useEffect(() => {
    if (user && session) {
      fetchProperties();
      checkUserPermissions();
    }
  }, [user, session, roles]);

  const checkUserPermissions = () => {
    const authorizedRoles = ['landlord', 'agent', 'manager', 'admin'];
    const hasPermission = roles.some(role => authorizedRoles.includes(role));
    setCanCreateListings(hasPermission);
  };

  const fetchProperties = async () => {
    setLoading(true);
    if (!session) return;

    try {
      let query = supabase
        .from('properties')
        .select('*');

      if (roles.includes('agent')) {
        const { data: agentProperties, error: agentError } = await supabase
          .from('agent_properties')
          .select('property_id')
          .eq('agent_id', session.user.id);

        if (agentError) throw agentError;
        
        if (agentProperties && agentProperties.length > 0) {
          const propertyIds = agentProperties.map(ap => ap.property_id);
          query = query.or(`id.in.(${propertyIds.join(',')}),owner_id.eq.${session.user.id}`);
        } else {
          query = query.eq('owner_id', session.user.id);
        }
      } else if (roles.includes('manager')) {
        const { data: managedProperties, error: managerError } = await supabase
          .from('property_managers')
          .select('property_id')
          .eq('manager_id', session.user.id);

        if (managerError) throw managerError;
        
        if (managedProperties && managedProperties.length > 0) {
          const propertyIds = managedProperties.map(mp => mp.property_id);
          query = query.or(`id.in.(${propertyIds.join(',')}),owner_id.eq.${session.user.id}`);
        } else {
          query = query.eq('owner_id', session.user.id);
        }
      } else {
        query = query.eq('owner_id', session.user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const formattedProperties = data?.map(property => ({
        ...property,
        square_footage: property.size_sqm || 0,
        year_built: 2023,
        image_urls: property.main_image_url ? [property.main_image_url] : [],
        availability_date: property.availability_date || null,
        latitude: property.latitude || null,
        longitude: property.longitude || null
      })) || [];
      
      setProperties(formattedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos propriétés',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Property Management</h1>
          {canCreateListings && (
            <Button onClick={() => navigate('/add-property')}>Add Property</Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Properties</CardTitle>
            <CardDescription>
              {canCreateListings 
                ? "Manage your listed properties here."
                : "View properties assigned to you."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  {canCreateListings
                    ? "You don't have any properties listed yet."
                    : "You don't have any properties assigned to you yet."}
                </p>
                {canCreateListings && (
                  <Button onClick={() => navigate('/add-property')}>
                    List a Property
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PropertyManagement;
