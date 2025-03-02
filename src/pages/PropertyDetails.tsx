import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { PropertyOwnershipInfo } from '@/components/PropertyOwnershipInfo';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, Bed, Bath, MapPin, CreditCard } from 'lucide-react';

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
  square_footage?: number;
  size_sqm?: number;
  year_built?: number;
  amenities?: string[];
  image_urls?: string[];
  availability_date?: string;
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setProperty(data as PropertyType);
    } catch (error: any) {
      console.error('Error fetching property details:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to load property details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Property Not Found</h2>
            <p className="text-gray-600">Could not retrieve property details.</p>
            <Button onClick={() => navigate('/property-management')}>
              Back to Property Management
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{property.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                {property.address}, {property.city}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <img
              src={property.main_image_url}
              alt={property.title}
              className="rounded-md w-full object-cover h-64"
            />

            <div className="flex justify-between">
              <Badge variant="secondary">{property.status}</Badge>
              <span className="text-xl font-semibold">₣{property.price.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-gray-500" />
                {property.property_type}
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-gray-500" />
                {property.bedrooms} Bedrooms
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-gray-500" />
                {property.bathrooms} Bathrooms
              </div>
              {property.square_footage && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  {property.square_footage} sqft
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{property.description}</p>
            </div>

            <PropertyOwnershipInfo propertyId={property.id} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PropertyDetails;
