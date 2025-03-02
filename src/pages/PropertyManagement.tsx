
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building, Bed, Bath, MapPin, CreditCard } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';

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
  description: string;
  square_footage: number;
  year_built: number;
  amenities: string[];
  image_urls: string[];
  availability_date: string;
}

const PropertyManagement = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && session) {
      fetchProperties();
    }
  }, [user, session]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Check if the user has the 'manager' role
      const { data: hasRoleResponse, error: hasRoleError } = await supabase.rpc('has_role', {
        role: 'manager'
      });

      if (hasRoleError) {
        throw hasRoleError;
      }

      let query = supabase
        .from('properties')
        .select('*');

      // If the user doesn't have the 'manager' role, only fetch their own properties
      if (!hasRoleResponse) {
        query = query.eq('owner_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Create sample data for missing fields to match PropertyType
      const propertiesData: PropertyType[] = data.map(item => ({
        id: item.id,
        title: item.title,
        address: item.address,
        city: item.city,
        price: item.price,
        property_type: item.property_type,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        main_image_url: item.main_image_url,
        status: item.status,
        description: item.description || 'No description available',
        square_footage: item.square_footage || 0,
        year_built: item.year_built || 2000,
        amenities: item.amenities || [],
        image_urls: item.image_urls || [],
        availability_date: item.availability_date || new Date().toISOString(),
      }));

      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch properties. Please try again.',
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
          <Button onClick={() => navigate('/property/add')}>Add Property</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Properties</CardTitle>
            <CardDescription>Manage your listed properties here.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">You don't have any properties listed yet.</p>
                <Button onClick={() => navigate('/property/add')}>
                  List a Property
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    showFavoriteButton={false}
                    showCompareButton={false}
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
