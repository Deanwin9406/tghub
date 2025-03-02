import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard, { PropertyType } from './PropertyCard';
import { motion } from 'framer-motion';
import mockProperties from '@/data/mockProperties';

interface FeaturedPropertiesProps {
  title?: string;
  viewAllLink?: string;
  limit?: number;
  type?: 'featured' | 'newest' | 'all';
}

const FeaturedProperties = ({ 
  title = "Propriétés à la une", 
  viewAllLink = "/search", 
  limit = 6,
  type = 'featured'
}: FeaturedPropertiesProps) => {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  
  useEffect(() => {
    // Simulate API call with delay
    const timer = setTimeout(() => {
      let filteredProperties = [...mockProperties];
      
      if (type === 'featured') {
        filteredProperties = mockProperties.filter(p => p.featured);
      } else if (type === 'newest') {
        filteredProperties = mockProperties.filter(p => p.new);
      }
      
      setProperties(filteredProperties.slice(0, limit));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [limit, type]);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <div className="py-16">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">{title}</h2>
          
          <Link to={viewAllLink}>
            <Button variant="outline" className="group">
              Voir tout 
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        {properties.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3]"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted-foreground/20 rounded w-3/4"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                  <div className="pt-4 flex justify-between">
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {properties.map((property) => (
              <motion.div key={property.id} variants={item}>
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FeaturedProperties;
