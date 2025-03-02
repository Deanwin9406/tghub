
// Fix the Favorites component
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
}

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('property_id, properties(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const propertiesData = data.map(item => item.properties as PropertyType);
        setFavorites(propertiesData);
      }
      
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch favorites. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('property_id', propertyId);
        
      if (error) throw error;
      
      // Remove from local state
      setFavorites(favorites.filter(property => property.id !== propertyId));
      
      toast({
        title: 'Success',
        description: 'Property removed from favorites.',
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove property from favorites.',
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Favorites</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Saved Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">You don't have any favorites yet.</p>
                <Button onClick={() => navigate('/search')}>
                  Browse Properties
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((property) => (
                  <PropertyCard 
                    key={property.id}
                    property={property}
                    onRemoveFromFavorites={() => handleRemoveFromFavorites(property.id)}
                    showFavoriteButton
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

export default Favorites;
