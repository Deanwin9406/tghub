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

type RoleCheckResult = {
  user_id: string;
  role: 'tenant' | 'landlord' | 'agent' | 'admin' | 'manager';
};

interface ExtendedPropertyType {
  address: string;
  bathrooms: number;
  bedrooms: number;
  city: string;
  country: string;
  created_at: string;
  description: string;
  featured: boolean;
  id: string;
  main_image_url: string;
  owner_id: string;
  price: number;
  property_type: string;
  status: string;
  title: string;
  updated_at: string;
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

  const checkIfHasRole = async (role: string): Promise<RoleCheckResult> => {
    const { data, error } = await supabase.rpc('has_role', {
      user_id: session?.user.id || '',
      role: role
    });

    if (error) {
      console.error('Error checking role:', error);
      return { user_id: session?.user.id || '', role: 'tenant' };
    }
    
    return { user_id: session?.user.id || '', role: role as 'tenant' | 'landlord' | 'agent' | 'admin' | 'manager' };
  };

  const fetchProperties = async () => {
    setLoading(true);
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', session.user.id);

      if (error) throw error;
      
      const propertyData = data.map(property => ({
        ...property,
        square_footage: property.square_footage || property.size_sqm || 0,
        year_built: property.year_built || 0,
        amenities: property.amenities || [],
        image_urls: property.image_urls || [],
        availability_date: property.availability_date || new Date().toISOString()
      })) as ExtendedPropertyType[];
      
      setProperties(propertyData);
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
