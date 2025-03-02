
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard, { PropertyType } from './PropertyCard';
import { motion } from 'framer-motion';

const mockProperties: PropertyType[] = [
  {
    id: "1",
    title: "Villa moderne avec piscine",
    price: 75000000,
    priceUnit: "XOF",
    type: "house",
    purpose: "sale",
    location: "Lomé, Agbalépédogan",
    beds: 4,
    baths: 3,
    area: 250,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
    featured: true
  },
  {
    id: "2",
    title: "Appartement de standing",
    price: 350000,
    priceUnit: "XOF",
    type: "apartment",
    purpose: "rent",
    location: "Lomé, Adidogomé",
    beds: 2,
    baths: 2,
    area: 100,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
  },
  {
    id: "3",
    title: "Terrain constructible",
    price: 15000000,
    priceUnit: "XOF",
    type: "land",
    purpose: "sale",
    location: "Tsévié",
    area: 600,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1032&q=80",
    new: true
  },
  {
    id: "4",
    title: "Maison familiale avec jardin",
    price: 45000000,
    priceUnit: "XOF",
    type: "house",
    purpose: "sale",
    location: "Lomé, Agoè",
    beds: 3,
    baths: 2,
    area: 180,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: "5",
    title: "Espace bureau moderne",
    price: 550000,
    priceUnit: "XOF",
    type: "commercial",
    purpose: "rent",
    location: "Lomé, Centre-ville",
    area: 120,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
  },
  {
    id: "6",
    title: "Villa de luxe avec vue sur mer",
    price: 150000000,
    priceUnit: "XOF",
    type: "house",
    purpose: "sale",
    location: "Aneho",
    beds: 5,
    baths: 4,
    area: 350,
    image: "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: true
  }
];

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
