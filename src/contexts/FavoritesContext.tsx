import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { PropertyType } from '@/types/property';

export type FavoriteContextType = {
  favorites: PropertyType[];
  isFavorite: (id: string) => boolean;
  addToFavorites: (property: PropertyType) => void;
  removeFromFavorites: (id: string) => void;
  clearFavorites: () => void;
  toggleFavorite: (property: PropertyType) => void;
};

const FavoritesContext = createContext<FavoriteContextType | null>(null);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<PropertyType[]>([]);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      fetchFavorites();
    } else {
      // When logged out, clear favorites
      setFavorites([]);
    }
  }, [session?.user?.id]);

  const fetchFavorites = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          property_id,
          properties(*)
        `)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Transform the retrieved data to match our PropertyType
      const favoriteProperties = data.map(item => {
        // Cast to our PropertyType to ensure type compatibility
        return item.properties as unknown as PropertyType;
      });
      
      setFavorites(favoriteProperties);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const isFavorite = (id: string): boolean => {
    return favorites.some(property => property.id === id);
  };

  const addToFavorites = async (property: PropertyType) => {
    if (!session?.user?.id) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter aux favoris",
        variant: "destructive",
      });
      return;
    }

    try {
      // Add to database if logged in
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: session.user.id,
          property_id: property.id
        });

      if (error) throw error;

      // Update local state
      setFavorites([...favorites, property]);
      
      toast({
        title: "Ajouté aux favoris",
        description: `${property.title} a été ajouté à vos favoris`,
      });
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout aux favoris",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (id: string) => {
    if (!session?.user?.id) return;

    try {
      // Remove from database if logged in
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('property_id', id);

      if (error) throw error;

      // Update local state
      setFavorites(favorites.filter(property => property.id !== id));
      
      toast({
        title: "Retiré des favoris",
        description: "La propriété a été retirée de vos favoris",
      });
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression des favoris",
        variant: "destructive",
      });
    }
  };

  const clearFavorites = async () => {
    if (!session?.user?.id) return;

    try {
      // Remove all user favorites from database
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Clear local state
      setFavorites([]);
      
      toast({
        title: "Favoris effacés",
        description: "Tous vos favoris ont été supprimés",
      });
    } catch (error: any) {
      console.error('Error clearing favorites:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression des favoris",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = (property: PropertyType) => {
    if (isFavorite(property.id)) {
      removeFromFavorites(property.id);
    } else {
      addToFavorites(property);
    }
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      isFavorite, 
      addToFavorites, 
      removeFromFavorites, 
      clearFavorites,
      toggleFavorite 
    }}>
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

export type { PropertyType };
