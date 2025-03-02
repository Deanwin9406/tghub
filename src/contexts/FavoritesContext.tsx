
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
          // Using user_favorites table instead of favorites
          const { data, error } = await supabase
            .from('user_favorites')
            .select('property_id');

          if (error) {
            throw error;
          }

          if (data && data.length > 0) {
            // Get the actual property data from the properties table
            const propertyIds = data.map(item => item.property_id);
            
            const { data: propertiesData, error: propertiesError } = await supabase
              .from('properties')
              .select('*')
              .in('id', propertyIds);
              
            if (propertiesError) {
              throw propertiesError;
            }
            
            // Map database properties to our PropertyType format
            const formattedProperties = propertiesData ? propertiesData.map(prop => ({
              id: prop.id,
              title: prop.title || '',
              description: prop.description || '',
              price: prop.price || 0,
              priceUnit: "XOF" as const,
              type: prop.property_type as "apartment" | "house" | "villa" | "office" | "land" | "other",
              purpose: prop.status === 'for_rent' ? 'rent' : 'sale',
              location: `${prop.city}, ${prop.country}`,
              beds: prop.bedrooms || 0,
              baths: prop.bathrooms || 0,
              area: prop.size_sqm || 0,
              image: prop.main_image_url || '',
              features: [],
              created_at: prop.created_at
            })) : [];
            
            setFavorites(formattedProperties);
          } else {
            setFavorites([]);
          }
        } catch (error: any) {
          console.error('Error fetching favorites:', error);
          toast({
            title: 'Erreur lors du chargement des favoris',
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
        title: 'Non authentifié',
        description: 'Vous devez être connecté pour ajouter des favoris.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Use user_favorites table instead of favorites
      const { error } = await supabase
        .from('user_favorites')
        .insert([{ user_id: user.id, property_id: property.id }]);

      if (error) {
        throw error;
      }

      setFavorites(prevFavorites => [...prevFavorites, property]);
      toast({
        title: 'Propriété ajoutée aux favoris',
        description: `${property.title} a été ajoutée à vos favoris.`,
      });
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      toast({
        title: 'Erreur lors de l\'ajout aux favoris',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const removeFavorite = async (propertyId: string) => {
    if (!user) {
      toast({
        title: 'Non authentifié',
        description: 'Vous devez être connecté pour supprimer des favoris.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Use user_favorites table instead of favorites
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) {
        throw error;
      }

      setFavorites(prevFavorites => prevFavorites.filter(property => property.id !== propertyId));
      toast({
        title: 'Propriété retirée des favoris',
        description: 'La propriété a été retirée de vos favoris.',
      });
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Erreur lors de la suppression du favori',
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
