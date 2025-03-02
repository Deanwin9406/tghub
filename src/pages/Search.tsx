
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import { supabase } from '@/integrations/supabase/client';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { CheckIcon, Filter, Loader2 } from 'lucide-react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, Dialog } from '@/components/ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';

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

const Search = () => {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000000,
    propertyTypes: [] as string[],
    bedrooms: 'any',
    bathrooms: 'any',
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  console.log("Search page loaded");

  useEffect(() => {
    console.log("Fetching properties");
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      console.log("Fetching from Supabase");
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available');

      if (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les propriétés. Veuillez réessayer.",
          variant: "destructive"
        });
        throw error;
      }

      console.log("Properties fetched:", data?.length);
      
      const formattedProperties = (data || []).map(property => ({
        ...property,
        square_footage: property.size_sqm || 0,
        year_built: 0,
        amenities: [],
        image_urls: [],
        availability_date: new Date().toISOString()
      })) as PropertyType[];

      setProperties(formattedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredProperties = properties.filter(property => {
    // Apply search term filter
    if (searchTerm && !property.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !property.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !property.city.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Apply price filter
    if (property.price < filters.minPrice || property.price > filters.maxPrice) {
      return false;
    }

    // Apply property type filter
    if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.property_type)) {
      return false;
    }

    // Apply bedroom filter
    if (filters.bedrooms !== 'any' && property.bedrooms !== (filters.bedrooms === '4+' ? 4 : parseInt(filters.bedrooms))) {
      if (!(filters.bedrooms === '4+' && property.bedrooms && property.bedrooms >= 4)) {
        return false;
      }
    }

    // Apply bathroom filter
    if (filters.bathrooms !== 'any' && property.bathrooms !== (filters.bathrooms === '3+' ? 3 : parseInt(filters.bathrooms))) {
      if (!(filters.bathrooms === '3+' && property.bathrooms && property.bathrooms >= 3)) {
        return false;
      }
    }

    return true;
  });

  const propertyTypes = ["apartment", "house", "villa", "office", "land", "other"];

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const togglePropertyType = (type: string) => {
    setFilters(prev => {
      const types = [...prev.propertyTypes];
      if (types.includes(type)) {
        return { ...prev, propertyTypes: types.filter(t => t !== type) };
      } else {
        return { ...prev, propertyTypes: [...types, type] };
      }
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Available Properties</h1>
          
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Properties</DialogTitle>
                <DialogDescription>
                  Adjust the filters below to refine your search results.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Price Range (₣)</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{filters.minPrice.toLocaleString()}</span>
                    <span className="text-sm">{filters.maxPrice.toLocaleString()}</span>
                  </div>
                  <Slider
                    defaultValue={[filters.minPrice, filters.maxPrice]}
                    max={5000000}
                    step={100000}
                    onValueChange={(value) => {
                      handleFilterChange('minPrice', value[0]);
                      handleFilterChange('maxPrice', value[1]);
                    }}
                    className="mt-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Property Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {propertyTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={type}
                          checked={filters.propertyTypes.includes(type)}
                          onCheckedChange={() => togglePropertyType(type)}
                        />
                        <label
                          htmlFor={type}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bedrooms</Label>
                  <ToggleGroup 
                    type="single" 
                    variant="outline"
                    value={filters.bedrooms}
                    onValueChange={(value) => value && handleFilterChange('bedrooms', value)}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="any">Any</ToggleGroupItem>
                    <ToggleGroupItem value="1">1</ToggleGroupItem>
                    <ToggleGroupItem value="2">2</ToggleGroupItem>
                    <ToggleGroupItem value="3">3</ToggleGroupItem>
                    <ToggleGroupItem value="4+">4+</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bathrooms</Label>
                  <ToggleGroup 
                    type="single" 
                    variant="outline"
                    value={filters.bathrooms}
                    onValueChange={(value) => value && handleFilterChange('bathrooms', value)}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="any">Any</ToggleGroupItem>
                    <ToggleGroupItem value="1">1</ToggleGroupItem>
                    <ToggleGroupItem value="2">2</ToggleGroupItem>
                    <ToggleGroupItem value="3+">3+</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setFiltersOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium mb-2">No properties found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find properties.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
