
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PropertyType } from '@/components/PropertyCard';
import { useToast } from '@/hooks/use-toast';

// Define the shape of the context
interface FavoritesContextType {
  favorites: PropertyType[];
  isLoading: boolean;
  isFavorite: (propertyId: string) => boolean;
  addFavorite: (property: PropertyType) => void;
  removeFavorite: (propertyId: string) => void;
}

// Create the context with default values
const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isLoading: true,
  isFavorite: () => false,
  addFavorite: () => {},
  removeFavorite: () => {}
});

// Create a provider component
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch favorites from local storage or database
  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      
      if (user) {
        try {
          // Fetch user's favorite properties
          const { data, error } = await supabase
            .from('user_favorites')
            .select('property_id')
            .eq('user_id', user.id);
            
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Get property details for each favorite
            const propertyIds = data.map(fav => fav.property_id);
            
            // In a real app, you would fetch from a properties table
            // For now, we'll use mockProperties
            const mockPropertiesModule = await import('@/data/mockProperties');
            const mockProperties = mockPropertiesModule.default;
            
            const favoriteProperties = mockProperties.filter(
              property => propertyIds.includes(property.id)
            );
            
            setFavorites(favoriteProperties);
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible de charger vos favoris.',
            variant: 'destructive',
          });
        }
      } else {
        // For non-authenticated users, use localStorage
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          try {
            const parsedFavorites = JSON.parse(storedFavorites);
            setFavorites(parsedFavorites);
          } catch (error) {
            console.error('Error parsing favorites from localStorage:', error);
            localStorage.removeItem('favorites');
          }
        }
      }
      
      setIsLoading(false);
    };
    
    fetchFavorites();
  }, [user, toast]);
  
  // Save favorites to localStorage for non-authenticated users
  useEffect(() => {
    if (!user && !isLoading) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, user, isLoading]);
  
  // Check if a property is in favorites
  const isFavorite = (propertyId: string): boolean => {
    return favorites.some(property => property.id === propertyId);
  };
  
  // Add a property to favorites
  const addFavorite = async (property: PropertyType) => {
    if (isFavorite(property.id)) return;
    
    if (user) {
      try {
        // Add to database for authenticated users
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            property_id: property.id,
            created_at: new Date().toISOString(),
          });
          
        if (error) throw error;
        
        setFavorites([...favorites, property]);
        
        toast({
          title: 'Ajouté aux favoris',
          description: 'La propriété a été ajoutée à vos favoris.',
        });
      } catch (error) {
        console.error('Error adding favorite:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible d\'ajouter aux favoris.',
          variant: 'destructive',
        });
      }
    } else {
      // Add to localStorage for non-authenticated users
      setFavorites([...favorites, property]);
      
      toast({
        title: 'Ajouté aux favoris',
        description: 'La propriété a été ajoutée à vos favoris.',
      });
    }
  };
  
  // Remove a property from favorites
  const removeFavorite = async (propertyId: string) => {
    if (!isFavorite(propertyId)) return;
    
    if (user) {
      try {
        // Remove from database for authenticated users
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
          
        if (error) throw error;
        
        setFavorites(favorites.filter(property => property.id !== propertyId));
        
        toast({
          title: 'Retiré des favoris',
          description: 'La propriété a été retirée de vos favoris.',
        });
      } catch (error) {
        console.error('Error removing favorite:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de retirer des favoris.',
          variant: 'destructive',
        });
      }
    } else {
      // Remove from localStorage for non-authenticated users
      setFavorites(favorites.filter(property => property.id !== propertyId));
      
      toast({
        title: 'Retiré des favoris',
        description: 'La propriété a été retirée de vos favoris.',
      });
    }
  };
  
  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      isLoading, 
      isFavorite, 
      addFavorite, 
      removeFavorite 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Create a custom hook to use the context
export const useFavorites = () => useContext(FavoritesContext);
