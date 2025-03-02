
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard, { PropertyType } from './PropertyCard';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExtendedPropertyType extends PropertyType {
  featured?: boolean;
  new?: boolean;
}

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchProperties();
  }, [limit, type]);
  
  const fetchProperties = async () => {
    setLoading(true);
    try {
      let query = supabase.from('properties').select('*');
      
      if (type === 'featured') {
        query = query.eq('featured', true);
      } else if (type === 'newest') {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query.limit(limit);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedProperties = data.map(property => ({
          id: property.id,
          title: property.title,
          price: property.price,
          property_type: property.property_type,
          status: property.status,
          address: property.address,
          city: property.city,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          square_footage: property.size_sqm || 0,
          main_image_url: property.main_image_url || 'https://placehold.co/600x400',
          description: property.description || '',
          image_urls: property.main_image_url ? [property.main_image_url] : ['https://placehold.co/600x400'],
          year_built: new Date().getFullYear(), // Default if not available
          amenities: property.amenities || [],
          availability_date: property.availability_date || new Date().toISOString()
        }));
        
        setProperties(formattedProperties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties. Using sample data instead.',
        variant: 'destructive',
      });
      
      // Fallback to mock data if API fails
      const mockProperties = getMockProperties();
      let filteredProperties = [...mockProperties] as ExtendedPropertyType[];
      
      if (type === 'featured') {
        filteredProperties = (mockProperties as ExtendedPropertyType[]).filter(p => p.featured);
      } else if (type === 'newest') {
        filteredProperties = (mockProperties as ExtendedPropertyType[]).filter(p => p.new);
      }
      
      setProperties(filteredProperties.slice(0, limit));
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback mock data function
  const getMockProperties = (): PropertyType[] => {
    return [
      {
        id: "1",
        title: "Villa moderne avec piscine",
        price: 75000000,
        property_type: "house",
        status: "available",
        address: "Lomé, Agbalépédogan",
        city: "Lomé",
        bedrooms: 4,
        bathrooms: 3,
        square_footage: 250,
        main_image_url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
        description: "Une belle villa moderne avec piscine",
        image_urls: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"],
        year_built: 2020,
        amenities: ["Piscine", "Jardin", "Garage"],
        availability_date: "2023-06-01",
      },
      {
        id: "2",
        title: "Appartement de standing",
        price: 350000,
        property_type: "apartment",
        status: "available",
        address: "Lomé, Adidogomé",
        city: "Lomé",
        bedrooms: 2,
        bathrooms: 2,
        square_footage: 100,
        main_image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
        description: "Un appartement de standing au cœur de la ville",
        image_urls: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"],
        year_built: 2019,
        amenities: ["Balcon", "Ascenseur", "Parking"],
        availability_date: "2023-07-15",
      },
    ];
  };
  
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
        
        {loading ? (
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
