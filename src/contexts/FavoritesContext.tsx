
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type FavoriteContextType = {
  favorites: string[];
  addFavorite: (propertyId: string) => void;
  removeFromFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
};

const FavoritesContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('property_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching favorites:', error);
        } else {
          const propertyIds = data.map(item => item.property_id);
          setFavorites(propertyIds);
        }
      } else {
        setFavorites([]);
      }
    };

    fetchFavorites();
  }, [user]);

  const addFavorite = async (propertyId: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setFavorites(prevFavorites => {
      if (prevFavorites.includes(propertyId)) {
        return prevFavorites;
      }
      return [...prevFavorites, propertyId];
    });

    const { error } = await supabase
      .from('user_favorites')
      .insert([{ user_id: user.id, property_id: propertyId }]);

    if (error) {
      console.error('Error adding favorite:', error);
      // Optimistically remove the favorite if the insertion fails
      setFavorites(prevFavorites => prevFavorites.filter(id => id !== propertyId));
    }
  };

  const removeFromFavorite = async (propertyId: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setFavorites(prevFavorites => prevFavorites.filter(id => id !== propertyId));

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId);

    if (error) {
      console.error('Error removing favorite:', error);
      // Optimistically add the favorite back if deletion fails
      setFavorites(prevFavorites => [...prevFavorites, propertyId]);
    }
  };

  const isFavorite = (propertyId: string) => {
    return favorites.includes(propertyId);
  };

  const value: FavoriteContextType = {
    favorites,
    addFavorite,
    removeFromFavorite,
    isFavorite,
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
