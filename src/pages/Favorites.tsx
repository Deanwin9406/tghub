
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Building, MapPin, Bed, Bath, CreditCard, SquareFootage } from 'lucide-react';
import PropertyCard, { PropertyType } from '@/components/PropertyCard';

const Favorites = () => {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();
  
  if (!favorites || favorites.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto py-16">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="text-center">Aucune propriété en favoris</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Vous n'avez pas encore ajouté de propriétés à vos favoris.
                Parcourez notre catalogue pour trouver des propriétés qui correspondent à vos besoins.
              </p>
              <Button onClick={() => navigate('/search')}>
                Parcourir les propriétés
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">Vos Propriétés Favorites</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property: PropertyType) => (
            <div key={property.id} className="relative">
              <PropertyCard property={property} />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-10 rounded-full"
                onClick={() => removeFavorite(property.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Favorites;
