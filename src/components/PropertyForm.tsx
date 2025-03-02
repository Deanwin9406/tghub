
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Add 'isEditing' to the PropertyFormProps interface
interface PropertyFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    price: number;
    priceUnit: "XOF" | "USD" | "EUR";
    type: "apartment" | "house" | "villa" | "office" | "land" | "other";
    purpose: string;
    location: string;
    beds: number;
    baths: number;
    area: number;
    image: string;
    features: string[];
  }) => void;
  initialData?: any;
  propertyId?: string;
  isEditing?: boolean;
}

const PropertyForm = ({ onSubmit, initialData, propertyId, isEditing = false }: PropertyFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
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
    features: initialData?.features || []
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Property title"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                required
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleNumberChange}
                placeholder="Price"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="priceUnit">Currency</Label>
              <Select 
                value={formData.priceUnit} 
                onValueChange={(value) => handleSelectChange('priceUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XOF">XOF</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="purpose">Purpose</Label>
              <Select 
                value={formData.purpose} 
                onValueChange={(value) => handleSelectChange('purpose', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="type">Property Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="beds">Bedrooms</Label>
              <Input
                id="beds"
                name="beds"
                type="number"
                value={formData.beds}
                onChange={handleNumberChange}
                placeholder="Number of bedrooms"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="baths">Bathrooms</Label>
              <Input
                id="baths"
                name="baths"
                type="number"
                value={formData.baths}
                onChange={handleNumberChange}
                placeholder="Number of bathrooms"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="area">Area (m²)</Label>
            <Input
              id="area"
              name="area"
              type="number"
              value={formData.area}
              onChange={handleNumberChange}
              placeholder="Property area in square meters"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="image">Main Image URL</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="URL to main property image"
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit">
              {isEditing ? 'Update Property' : 'Add Property'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyForm;
