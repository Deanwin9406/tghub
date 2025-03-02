import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import PropertyCard, { PropertyType } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Filter, SlidersHorizontal, MapPin, X, ChevronDown, Grid, Map as MapIcon } from 'lucide-react';
import mockProperties from "../data/mockProperties";
import PropertyMap from '@/components/PropertyMap';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 200000000]); // XOF
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [beds, setBeds] = useState<number | null>(null);
  const [baths, setBaths] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<number>(0);
  
  // Get search parameters
  const searchType = searchParams.get('type') || 'all';
  const searchLocation = searchParams.get('location') || '';
  
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      let filtered = [...mockProperties];
      
      if (searchType === 'buy' || searchType === 'sale') {
        filtered = filtered.filter(p => p.purpose === 'sale');
      } else if (searchType === 'rent') {
        filtered = filtered.filter(p => p.purpose === 'rent');
      }
      
      if (searchLocation) {
        filtered = filtered.filter(p => 
          (p.location || p.address || p.city).toLowerCase().includes(searchLocation.toLowerCase())
        );
      }
      
      setProperties(filtered);
      setFilteredProperties(filtered);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [searchType, searchLocation]);
  
  useEffect(() => {
    let filtered = [...properties];
    let activeFilterCount = 0;
    
    // Filter by price
    if (priceRange[0] > 0 || priceRange[1] < 200000000) {
      filtered = filtered.filter(p => 
        p.price >= priceRange[0] && p.price <= priceRange[1]
      );
      activeFilterCount++;
    }
    
    // Filter by property type
    if (propertyTypes.length > 0) {
      filtered = filtered.filter(p => propertyTypes.includes(p.property_type));
      activeFilterCount++;
    }
    
    // Filter by beds
    if (beds !== null) {
      filtered = filtered.filter(p => (p.bedrooms !== undefined ? p.bedrooms : p.beds) !== undefined && (p.bedrooms || p.beds || 0) >= beds);
      activeFilterCount++;
    }
    
    // Filter by baths
    if (baths !== null) {
      filtered = filtered.filter(p => (p.bathrooms !== undefined ? p.bathrooms : p.baths) !== undefined && (p.bathrooms || p.baths || 0) >= baths);
      activeFilterCount++;
    }
    
    setFilteredProperties(filtered);
    setActiveFilters(activeFilterCount);
  }, [properties, priceRange, propertyTypes, beds, baths]);
  
  const togglePropertyType = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter(t => t !== type));
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };
  
  const clearFilters = () => {
    setPriceRange([0, 200000000]);
    setPropertyTypes([]);
    setBeds(null);
    setBaths(null);
  };
  
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} XOF`;
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
    <Layout>
      <div className="bg-muted/30 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Trouver une propriété</h1>
            <SearchBar />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Mobile Toggle */}
          <div className="flex md:hidden justify-between items-center mb-4">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={16} className="mr-2" />
              Filtres
              {activeFilters > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">{activeFilters}</Badge>
              )}
            </Button>
            
            <Select defaultValue="recommended">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommandés</SelectItem>
                <SelectItem value="price_asc">Prix (croissant)</SelectItem>
                <SelectItem value="price_desc">Prix (décroissant)</SelectItem>
                <SelectItem value="newest">Plus récents</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Filters - Sidebar */}
          <div 
            className={`md:w-1/4 bg-white rounded-2xl shadow-sm border border-border overflow-hidden ${filterOpen ? 'block' : 'hidden md:block'}`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">Filtres</h2>
                <div className="flex items-center">
                  {activeFilters > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="mr-2 h-8 px-2">
                      Effacer
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden h-8 w-8"
                    onClick={() => setFilterOpen(false)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-medium mb-4">Prix</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 200000000]}
                      max={200000000}
                      step={1000000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-6"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Type de propriété</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="type-house" 
                        checked={propertyTypes.includes('house')}
                        onCheckedChange={() => togglePropertyType('house')}
                      />
                      <label htmlFor="type-house" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Maison
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="type-apartment" 
                        checked={propertyTypes.includes('apartment')}
                        onCheckedChange={() => togglePropertyType('apartment')}
                      />
                      <label htmlFor="type-apartment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Appartement
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="type-land" 
                        checked={propertyTypes.includes('land')}
                        onCheckedChange={() => togglePropertyType('land')}
                      />
                      <label htmlFor="type-land" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Terrain
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="type-commercial" 
                        checked={propertyTypes.includes('commercial')}
                        onCheckedChange={() => togglePropertyType('commercial')}
                      />
                      <label htmlFor="type-commercial" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Commercial
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Chambres</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={beds === null ? "default" : "outline"} 
                      size="sm"
                      className="rounded-full"
                      onClick={() => setBeds(null)}
                    >
                      Tous
                    </Button>
                    {[1, 2, 3, 4, 5].map(num => (
                      <Button 
                        key={num}
                        variant={beds === num ? "default" : "outline"} 
                        size="sm"
                        className="rounded-full"
                        onClick={() => setBeds(beds === num ? null : num)}
                      >
                        {num}+
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Salles de bain</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={baths === null ? "default" : "outline"} 
                      size="sm"
                      className="rounded-full"
                      onClick={() => setBaths(null)}
                    >
                      Tous
                    </Button>
                    {[1, 2, 3, 4].map(num => (
                      <Button 
                        key={num}
                        variant={baths === num ? "default" : "outline"} 
                        size="sm"
                        className="rounded-full"
                        onClick={() => setBaths(baths === num ? null : num)}
                      >
                        {num}+
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="md:w-3/4">
            <div className="hidden md:flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {loading ? 'Chargement...' : `${filteredProperties.length} résultats trouvés`}
                </h2>
                {searchLocation && (
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span>Recherche près de: {searchLocation}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <Select defaultValue="recommended">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommandés</SelectItem>
                    <SelectItem value="price_asc">Prix (croissant)</SelectItem>
                    <SelectItem value="price_desc">Prix (décroissant)</SelectItem>
                    <SelectItem value="newest">Plus récents</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="bg-muted rounded-lg p-1 flex">
                  <Button
                    type="button"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-md"
                  >
                    <Grid size={18} />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className="rounded-md"
                  >
                    <MapIcon size={18} />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* View mode toggle for mobile */}
            <div className="flex md:hidden items-center justify-between mb-4">
              <div className="text-sm">
                {loading ? 'Chargement...' : `${filteredProperties.length} résultats`}
              </div>
              <div className="bg-muted rounded-lg p-1 flex">
                <Button
                  type="button"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-md"
                >
                  <Grid size={16} />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="rounded-md"
                >
                  <MapIcon size={16} />
                </Button>
              </div>
            </div>
            
            {/* Active filters */}
            {activeFilters > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {priceRange[0] > 0 || priceRange[1] < 200000000 ? (
                  <Badge variant="outline" className="flex items-center bg-accent">
                    Prix: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1"
                      onClick={() => setPriceRange([0, 200000000])}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ) : null}
                
                {propertyTypes.map(type => (
                  <Badge key={type} variant="outline" className="flex items-center bg-accent">
                    Type: {
                      type === 'house' ? 'Maison' : 
                      type === 'apartment' ? 'Appartement' : 
                      type === 'land' ? 'Terrain' : 'Commercial'
                    }
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1"
                      onClick={() => togglePropertyType(type)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ))}
                
                {beds !== null && (
                  <Badge variant="outline" className="flex items-center bg-accent">
                    Chambres: {beds}+
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1"
                      onClick={() => setBeds(null)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                )}
                
                {baths !== null && (
                  <Badge variant="outline" className="flex items-center bg-accent">
                    Salles de bain: {baths}+
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1"
                      onClick={() => setBaths(null)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                )}
                
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
                  Effacer tous les filtres
                </Button>
              </div>
            )}
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {[...Array(4)].map((_, i) => (
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
            ) : filteredProperties.length === 0 ? (
              <div className="bg-muted/30 rounded-2xl p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  Aucune propriété ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
                </p>
                <Button onClick={clearFilters}>Effacer les filtres</Button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {filteredProperties.map((property) => (
                      <motion.div key={property.id} variants={item}>
                        <PropertyCard property={property} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="h-[700px] rounded-2xl overflow-hidden border border-border">
                    <PropertyMap properties={filteredProperties} />
                  </div>
                )}
              </>
            )}
            
            {viewMode === 'grid' && filteredProperties.length > 0 && (
              <div className="mt-12 text-center">
                <Button variant="outline" size="lg">
                  Charger plus de résultats
                  <ChevronDown size={16} className="ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
