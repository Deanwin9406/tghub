
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PropertyType } from '@/components/PropertyCard';

interface ComparisonContextType {
  comparisonList: PropertyType[];
  addToComparison: (property: PropertyType) => void;
  removeFromComparison: (propertyId: string) => void;
  isInComparison: (propertyId: string) => boolean;
  clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparisonList, setComparisonList] = useState<PropertyType[]>([]);

  // Load comparison list from localStorage on mount
  useEffect(() => {
    const savedComparison = localStorage.getItem('propertyComparison');
    if (savedComparison) {
      try {
        setComparisonList(JSON.parse(savedComparison));
      } catch (error) {
        console.error('Failed to parse saved comparison data', error);
        localStorage.removeItem('propertyComparison');
      }
    }
  }, []);

  // Save to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('propertyComparison', JSON.stringify(comparisonList));
  }, [comparisonList]);

  const addToComparison = (property: PropertyType) => {
    // Limit to maximum 4 properties for comparison
    if (comparisonList.length >= 4) {
      return;
    }
    
    if (!comparisonList.some(item => item.id === property.id)) {
      setComparisonList(prev => [...prev, property]);
    }
  };

  const removeFromComparison = (propertyId: string) => {
    setComparisonList(prev => prev.filter(item => item.id !== propertyId));
  };

  const isInComparison = (propertyId: string) => {
    return comparisonList.some(item => item.id === propertyId);
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  return (
    <ComparisonContext.Provider value={{
      comparisonList,
      addToComparison,
      removeFromComparison,
      isInComparison,
      clearComparison,
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};
