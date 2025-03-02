
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertyMap from '@/components/PropertyMap';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useComparison } from '@/contexts/ComparisonContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PropertyOwnershipInfo from '@/components/PropertyOwnershipInfo';
import { 
  Heart, 
  Home, 
  CalendarDays, 
  MapPin, 
  Ruler, 
  Bath, 
  BedDouble, 
  Clock, 
  Scale, 
  Share2 
} from 'lucide-react';

interface DatabasePropertyType {
  address: string;
  bathrooms: number;
  bedrooms: number;
  city: string;
  country: string;
  created_at: string;
  description: string;
  featured: boolean;
  id: string;
  main_image_url: string;
  owner_id: string;
  price: number;
  property_type: string;
  status: string;
  title: string;
  updated_at: string;
  square_footage?: number;
  size_sqm?: number;
  year_built?: number;
  amenities?: string[];
  image_urls?: string[];
  availability_date?: string;
}

interface EnhancedPropertyType extends DatabasePropertyType {
  square_footage: number;
  year_built: number;
  amenities: string[];
  image_urls: string[];
  availability_date: string;
}

const fetchProperty = async (id: string) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

const getPropertyDetails = (baseProperty: DatabasePropertyType): EnhancedPropertyType => {
  return {
    ...baseProperty,
    square_footage: baseProperty.square_footage || baseProperty.size_sqm || 1200,
    year_built: baseProperty.year_built || 2015,
    amenities: baseProperty.amenities || ['Parking', 'Garden', 'Security', 'Swimming Pool'],
    image_urls: baseProperty.image_urls || [
      baseProperty.main_image_url,
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8',
    ],
    availability_date: baseProperty.availability_date || '2023-10-01',
  };
};

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { session } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const { addToComparison } = useComparison();
  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState<EnhancedPropertyType | null>(null);
  const [isLoading, setLoading] = useState(true);

  const { data: propertyData, isLoading: propertyLoading, error: propertyError } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const enhancedProperty = getPropertyDetails(data as DatabasePropertyType);
          setProperty(enhancedProperty);
          checkFavoriteStatus(enhancedProperty.id);
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const checkFavoriteStatus = (propertyId: string) => {
    if (favorites.some(fav => fav.id === propertyId)) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!session) {
      toast({
        title: 'Login Required',
        description: 'Please login to save properties to your favorites.',
      });
      return;
    }

    if (property) {
      if (isFavorite) {
        removeFromFavorites(property.id);
        toast({
          title: 'Removed from favorites',
          description: 'Property has been removed from your favorites.',
        });
      } else {
        addToFavorites(property);
        toast({
          title: 'Added to favorites',
          description: 'Property has been added to your favorites.',
        });
      }
      setIsFavorite(!isFavorite);
    }
  };

  const handleAddToComparison = () => {
    if (!property) return;
    addToComparison(property);
    toast({
      title: 'Added to comparison',
      description: 'Property has been added to your comparison list.',
    });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (propertyLoading || propertyError || !property) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Error loading property</h1>
            <p className="mt-4">We couldn't find the property you're looking for.</p>
            <Button asChild className="mt-6">
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Carousel 
                showThumbs={false} 
                showStatus={false} 
                infiniteLoop={true} 
                autoPlay={true} 
                interval={5000}
              >
                {property.image_urls.map((url, index) => (
                  <div key={index} className="h-[400px] relative">
                    <img 
                      src={url} 
                      alt={`Property image ${index + 1}`} 
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </Carousel>
            </div>

            <div className="flex flex-wrap items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleAddToComparison}
                >
                  <Scale className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center text-muted-foreground mb-6">
              <MapPin className="h-5 w-5 mr-1" />
              <span>{property.address}, {property.city}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="flex items-center p-4">
                  <BedDouble className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-4">
                  <Bath className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-4">
                  <Ruler className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="font-medium">{property.square_footage} m²</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-4">
                  <Home className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{property.year_built}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <p>{property.description}</p>
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Property Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                          <span>Property Type: {property.property_type}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                          <span>Status: {property.status}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                          <span>Price: ${property.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                          <span>Available from: {formatDate(property.availability_date)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="location" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="h-[400px] rounded-lg overflow-hidden">
                      <PropertyMap properties={[property]} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card className="mb-6 sticky top-24">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-3xl font-bold">${property.price.toLocaleString()}</p>
                    <Badge variant="outline" className="mt-1">
                      {property.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Listed on {new Date(property.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span>Available from {formatDate(property.availability_date)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full">Contact Agent</Button>
                  <Button variant="outline" className="w-full">Schedule a Visit</Button>
                </div>
              </CardContent>
            </Card>

            <PropertyOwnershipInfo
              propertyId={property.id}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Add the formatDate function
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default PropertyDetails;
