
import React from 'react';
import Layout from '@/components/Layout';
import { useFavorites } from '@/contexts/FavoritesContext';
import PropertyCard from '@/components/PropertyCard';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Favorites = () => {
  const { favorites, isLoading } = useFavorites();

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mes propriétés favorites</h1>
            <p className="text-muted-foreground mt-1">
              Retrouvez ici toutes les propriétés que vous avez ajoutées à vos favoris
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] bg-muted"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                    <div className="pt-4 flex space-x-4">
                      <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <PropertyCard 
                  property={{
                    ...property,
                    // Ensure property type matches the PropertyCard's expected type
                    type: property.type === 'villa' || property.type === 'office' || property.type === 'other' 
                      ? 'house' 
                      : property.type as 'house' | 'apartment' | 'land' | 'commercial',
                  }} 
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucune propriété en favoris</h2>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore ajouté de propriétés à vos favoris
            </p>
            <Link to="/search">
              <Button>
                Découvrir des propriétés
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
