
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PropertyType } from '@/components/PropertyCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface FavoritesContextType {
  favorites: PropertyType[];
  isInFavorites: (propertyId: string) => boolean;
  addToFavorites: (property: PropertyType) => void;
  removeFromFavorites: (propertyId: string) => void;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load favorites from local storage for non-authenticated users
  // or from the database for authenticated users
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      
      if (user) {
        // Load from database for authenticated users
        try {
          // First get the favorite property IDs
          const { data: favoritesData, error: favoritesError } = await supabase
            .from('user_favorites')
            .select('property_id')
            .eq('user_id', user.id);
          
          if (favoritesError) throw favoritesError;
          
          if (favoritesData && favoritesData.length > 0) {
            // Get all property details in a separate query
            const propertyIds = favoritesData.map(fav => fav.property_id);
            
            const { data: propertiesData, error: propertiesError } = await supabase
              .from('properties')
              .select('*')
              .in('id', propertyIds);
            
            if (propertiesError) throw propertiesError;
            
            if (propertiesData) {
              // Transform the data to match PropertyType
              const favoriteProperties = propertiesData.map(property => ({
                id: property.id,
                title: property.title,
                price: property.price,
                priceUnit: 'XOF', // Default currency
                type: property.property_type,
                purpose: property.status === 'available' ? 'sale' : 'rent',
                location: `${property.city}, ${property.country}`,
                beds: property.bedrooms,
                baths: property.bathrooms,
                area: property.size_sqm,
                image: property.main_image_url,
                featured: property.featured,
                new: false // Default value
              }));
              
              setFavorites(favoriteProperties);
            }
          } else {
            setFavorites([]);
          }
        } catch (error) {
          console.error('Error loading favorites:', error);
          toast({
            title: "Error",
            description: "Failed to load favorites. Please try again.",
            variant: "destructive",
          });
          
          // Fallback to local storage if database fails
          const storedFavorites = localStorage.getItem('favorites');
          if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
          }
        }
      } else {
        // Load from local storage for non-authenticated users
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      }
      
      setLoading(false);
    };
    
    loadFavorites();
  }, [user, toast]);

  // Save favorites to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Check if a property is in favorites
  const isInFavorites = (propertyId: string) => {
    return favorites.some(property => property.id === propertyId);
  };

  // Add property to favorites
  const addToFavorites = async (property: PropertyType) => {
    // Don't add if already in favorites
    if (isInFavorites(property.id)) return;
    
    const newFavorites = [...favorites, property];
    setFavorites(newFavorites);
    
    toast({
      title: "Ajouté aux favoris",
      description: `${property.title} a été ajouté à vos favoris.`,
    });
    
    // If user is authenticated, save to database
    if (user) {
      try {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            property_id: property.id
          });
          
        if (error) throw error;
      } catch (error) {
        console.error('Error saving favorite to database:', error);
        // We don't revert the UI state since it's already saved in local storage
      }
    }
  };

  // Remove property from favorites
  const removeFromFavorites = async (propertyId: string) => {
    const newFavorites = favorites.filter(property => property.id !== propertyId);
    setFavorites(newFavorites);
    
    toast({
      title: "Retiré des favoris",
      description: "Cette propriété a été retirée de vos favoris.",
    });
    
    // If user is authenticated, remove from database
    if (user) {
      try {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error removing favorite from database:', error);
        // We don't revert the UI state since it's already saved in local storage
      }
    }
  };

  const value = {
    favorites,
    isInFavorites,
    addToFavorites,
    removeFromFavorites,
    loading
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
