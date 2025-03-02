
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useFavorites, PropertyType } from '@/contexts/FavoritesContext';
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
              Mes Favoris
            </h1>
            <p className="text-muted-foreground mt-1">
              Vous avez {favorites.length} propriétés enregistrées
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={toggleFilter}>
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            {favorites.length > 0 && (
              <Button variant="outline" onClick={clearFavorites}>
                <X className="h-4 w-4 mr-2" />
                Effacer Tout
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
                <Label htmlFor="sort">Trier Par</Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="Ordre de tri" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Par défaut</SelectItem>
                    <SelectItem value="price-asc">Prix: Croissant</SelectItem>
                    <SelectItem value="price-desc">Prix: Décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="property-type">Type de Propriété</Label>
                <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                  <SelectTrigger id="property-type">
                    <SelectValue placeholder="Type de propriété" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="apartment">Appartement</SelectItem>
                    <SelectItem value="house">Maison</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="land">Terrain</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fourchette de Prix</Label>
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
            <h2 className="text-2xl font-medium mb-2">Pas encore de favoris</h2>
            <p className="text-muted-foreground mb-8">Commencez à enregistrer des propriétés pour les voir ici</p>
            <Button onClick={() => navigate('/')}>Parcourir les Propriétés</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onRemoveFromFavorites={() => removeFromFavorites(property.id)}
                showRemoveButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
