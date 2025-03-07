
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PropertyFormBasicInfo from './property/PropertyFormBasicInfo';
import PropertyFormPricing from './property/PropertyFormPricing';
import PropertyFormDetails from './property/PropertyFormDetails';
import { PropertyType } from '@/types/property';

interface PropertyFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  propertyId?: string;
  isEditing?: boolean;
}

const PropertyForm = ({ onSubmit, initialData, propertyId, isEditing = false }: PropertyFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    priceUnit: initialData?.priceUnit || "XOF",
    type: initialData?.property_type || "apartment",
    purpose: initialData?.purpose || "sale",
    location: initialData?.city || "",
    beds: initialData?.bedrooms || 0,
    baths: initialData?.bathrooms || 0,
    area: initialData?.size_sqm || 0,
    image: initialData?.main_image_url || "",
    address: initialData?.address || "",
    country: initialData?.country || "Togo",
    amenities: initialData?.amenities || []
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a property",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const propertyData: Partial<PropertyType> = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        property_type: formData.type as PropertyType['property_type'],
        bedrooms: formData.beds,
        bathrooms: formData.baths,
        size_sqm: formData.area,
        main_image_url: formData.image,
        city: formData.location,
        address: formData.address,
        country: formData.country,
        amenities: formData.amenities,
        owner_id: user.id,
        status: 'available' as PropertyType['status'],
      };
      
      let result;
      
      if (isEditing && propertyId) {
        // Update existing property
        const { data, error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', propertyId)
          .select();
          
        if (error) throw error;
        result = data?.[0];
        
        toast({
          title: "Success",
          description: "Property has been updated successfully"
        });
      } else {
        // Create new property
        const { data, error } = await supabase
          .from('properties')
          .insert(propertyData)
          .select();
          
        if (error) throw error;
        result = data?.[0];
        
        toast({
          title: "Success",
          description: "Property has been created successfully"
        });
      }
      
      // Call the onSubmit callback with the result
      onSubmit(result);
      
      // Redirect after successful submission
      navigate('/property-management');
      
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save property",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <PropertyFormBasicInfo 
            title={formData.title}
            location={formData.location}
            address={formData.address}
            description={formData.description}
            onInputChange={handleChange}
          />
          
          <PropertyFormPricing 
            price={formData.price}
            priceUnit={formData.priceUnit}
            purpose={formData.purpose}
            onNumberChange={handleNumberChange}
            onSelectChange={handleSelectChange}
          />
          
          <PropertyFormDetails 
            type={formData.type}
            beds={formData.beds}
            baths={formData.baths}
            area={formData.area}
            image={formData.image}
            onNumberChange={handleNumberChange}
            onInputChange={handleChange}
            onSelectChange={handleSelectChange}
          />
          
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Update Property' : 'Add Property'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyForm;
