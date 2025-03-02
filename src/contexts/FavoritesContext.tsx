import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type PropertyType = {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: "XOF" | "USD" | "EUR";
  type: "apartment" | "house" | "villa" | "office" | "land" | "other";
  purpose: string;
  location: string;
  beds: number;
  baths: number;
  area: number;
  image: string;
  features: string[];
  created_at: string;
};

type FavoritesContextType = {
  favorites: PropertyType[];
  addFavorite: (property: PropertyType) => void;
  removeFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  isLoading: boolean;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('property_id, properties(*)')
            .eq('user_id', user.id);

          if (error) {
            throw error;
          }

          if (data) {
            const properties = data.map(item => (item.properties ? {
              id: item.properties.id,
              title: item.properties.title,
              description: item.properties.description,
              price: item.properties.price,
              priceUnit: item.properties.price_unit,
              type: item.properties.type,
              purpose: item.properties.purpose,
              location: item.properties.location,
              beds: item.properties.beds,
              baths: item.properties.baths,
              area: item.properties.area,
              image: item.properties.image,
              features: item.properties.features,
              created_at: item.properties.created_at,
            } : null)).filter(property => property !== null) as PropertyType[];
            setFavorites(properties);
          }
        } catch (error: any) {
          console.error('Error fetching favorites:', error);
          toast({
            title: 'Error fetching favorites',
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setFavorites([]);
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user, toast]);

  const addFavorite = async (property: PropertyType) => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'You must be logged in to add favorites.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, property_id: property.id }]);

      if (error) {
        throw error;
      }

      setFavorites(prevFavorites => [...prevFavorites, property]);
      toast({
        title: 'Property added to favorites',
        description: `${property.title} has been added to your favorites.`,
      });
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      toast({
        title: 'Error adding favorite',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const removeFavorite = async (propertyId: string) => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'You must be logged in to remove favorites.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) {
        throw error;
      }

      setFavorites(prevFavorites => prevFavorites.filter(property => property.id !== propertyId));
      toast({
        title: 'Property removed from favorites',
        description: 'The property has been removed from your favorites.',
      });
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Error removing favorite',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const isFavorite = (propertyId: string) => {
    return favorites.some(property => property.id === propertyId);
  };

  const value: FavoritesContextType = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    isLoading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
