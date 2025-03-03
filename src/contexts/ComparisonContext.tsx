
import React, { createContext, useContext, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PropertyType } from '@/types/property';

export type ComparisonContextType = {
  comparisonList: PropertyType[];
  addToComparison: (property: PropertyType) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isInComparison: (id: string) => boolean;
};

const ComparisonContext = createContext<ComparisonContextType | null>(null);

export const ComparisonProvider = ({ children }: { children: React.ReactNode }) => {
  const [comparisonList, setComparisonList] = useState<PropertyType[]>([]);
  const { toast } = useToast();

  const addToComparison = (property: PropertyType) => {
    if (comparisonList.length >= 4) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez comparer que jusqu'à 4 propriétés.",
        variant: "destructive",
      });
      return;
    }

    if (comparisonList.find((item) => item.id === property.id)) {
      toast({
        title: "Déjà dans la liste",
        description: "Cette propriété est déjà dans votre liste de comparaison.",
      });
      return;
    }

    setComparisonList([...comparisonList, property]);
    toast({
      title: "Ajouté à la comparaison",
      description: `${property.title} a été ajouté à la liste de comparaison.`,
    });
  };

  const removeFromComparison = (id: string) => {
    setComparisonList(comparisonList.filter((property) => property.id !== id));
    toast({
      title: "Retiré de la comparaison",
      description: "La propriété a été retirée de la liste de comparaison.",
    });
  };

  const clearComparison = () => {
    setComparisonList([]);
    toast({
      title: "Liste de comparaison effacée",
      description: "Toutes les propriétés ont été retirées de la liste de comparaison.",
    });
  };

  const isInComparison = (id: string): boolean => {
    return comparisonList.some(property => property.id === id);
  };

  return (
    <ComparisonContext.Provider value={{ 
      comparisonList, 
      addToComparison, 
      removeFromComparison, 
      clearComparison,
      isInComparison
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
