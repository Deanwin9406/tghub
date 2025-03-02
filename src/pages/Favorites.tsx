
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useFavorites } from '@/contexts/FavoritesContext';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, Filter, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define a complete PropertyType
interface PropertyType {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  main_image_url: string | null;
  status: string;
  description: string;
  square_footage: number;
  year_built: number;
  amenities: string[];
  image_urls: string[];
  availability_date: string;
}

const Favorites = () => {
  const { session } = useAuth();
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const navigate = useNavigate();
  const [filteredProperties, setFilteredProperties] = useState<PropertyType[]>([]);
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [priceFilter, setPriceFilter] = useState<{ min: string; max: string }>({
    min: '',
    max: '',
  });
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/auth');
    }
  }, [session, navigate]);

  useEffect(() => {
    let result = [...favorites];

    // Apply property type filter
    if (propertyTypeFilter !== 'all') {
      result = result.filter(property => property.property_type === propertyTypeFilter);
    }

    // Apply price filter
    if (priceFilter.min) {
      result = result.filter(property => property.price >= parseInt(priceFilter.min));
    }
    if (priceFilter.max) {
      result = result.filter(property => property.price <= parseInt(priceFilter.max));
    }

    // Apply sorting
    if (sortOrder === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProperties(result);
  }, [favorites, sortOrder, priceFilter, propertyTypeFilter]);

  const toggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Heart className="h-7 w-7 mr-2 text-primary" />
              My Favorites
            </h1>
            <p className="text-muted-foreground mt-1">
              You have {favorites.length} saved properties
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={toggleFilter}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {favorites.length > 0 && (
              <Button variant="outline" onClick={clearFavorites}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {isFilterVisible && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-muted/50 rounded-lg p-6 mb-8 border"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="Sort Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="property-type">Property Type</Label>
                <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                  <SelectTrigger id="property-type">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price Range</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceFilter.min}
                    onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceFilter.max}
                    onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {filteredProperties.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-medium mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-8">Start saving properties to see them here</p>
            <Button onClick={() => navigate('/')}>Browse Properties</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onRemoveFromFavorites={() => removeFromFavorites(property.id)}
                showRemoveButton
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
