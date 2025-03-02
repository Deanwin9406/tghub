
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { X, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface PropertyFormProps {
  propertyId?: string;
  isEditing?: boolean;
}

const PropertyForm = ({ propertyId, isEditing = false }: PropertyFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    country: 'Togo',
    property_type: 'apartment',
    bedrooms: '',
    bathrooms: '',
    size_sqm: '',
    featured: false,
    status: 'available',
  });

  useEffect(() => {
    if (isEditing && propertyId) {
      fetchPropertyData(propertyId);
    }
  }, [isEditing, propertyId]);

  const fetchPropertyData = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || 'Togo',
          property_type: data.property_type || 'apartment',
          bedrooms: data.bedrooms?.toString() || '',
          bathrooms: data.bathrooms?.toString() || '',
          size_sqm: data.size_sqm?.toString() || '',
          featured: data.featured || false,
          status: data.status || 'available',
        });

        if (data.main_image_url) {
          setImagePreview(data.main_image_url);
        }
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load property data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `properties/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, imageFile);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to add or edit a property.',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = imagePreview;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        address: formData.address,
        city: formData.city,
        country: formData.country,
        property_type: formData.property_type,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        size_sqm: formData.size_sqm ? parseFloat(formData.size_sqm) : null,
        featured: formData.featured,
        status: formData.status,
        main_image_url: imageUrl,
        owner_id: user.id,
      };
      
      if (isEditing && propertyId) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', propertyId);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Property updated successfully.',
        });
      } else {
        // Add new property
        const { error } = await supabase
          .from('properties')
          .insert([propertyData]);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Property added successfully.',
        });
      }
      
      // Redirect to property management page
      navigate('/property-management');
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save property. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Property' : 'Add New Property'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your property information below.' 
            : 'Fill in the details to list a new property.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="Property Title" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description || ''} 
                  onChange={handleChange} 
                  placeholder="Property Description" 
                  className="min-h-[120px]" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (XOF)*</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  value={formData.price} 
                  onChange={handleChange} 
                  placeholder="Property Price" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type*</Label>
                <Select 
                  value={formData.property_type} 
                  onValueChange={(value) => handleSelectChange('property_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
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
              
              <div className="space-y-2">
                <Label htmlFor="status">Status*</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="featured" 
                  checked={formData.featured} 
                  onCheckedChange={(checked) => handleCheckboxChange('featured', !!checked)} 
                />
                <Label htmlFor="featured" className="cursor-pointer">Feature this property</Label>
              </div>
            </div>
            
            {/* Location & Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address*</Label>
                <Input 
                  id="address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="Street Address" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City*</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="City" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country*</Label>
                <Input 
                  id="country" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange} 
                  placeholder="Country" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input 
                    id="bedrooms" 
                    name="bedrooms" 
                    type="number" 
                    min="0"
                    value={formData.bedrooms} 
                    onChange={handleChange} 
                    placeholder="0" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input 
                    id="bathrooms" 
                    name="bathrooms" 
                    type="number" 
                    min="0"
                    step="0.5"
                    value={formData.bathrooms} 
                    onChange={handleChange} 
                    placeholder="0" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="size_sqm">Size (m²)</Label>
                  <Input 
                    id="size_sqm" 
                    name="size_sqm" 
                    type="number" 
                    min="0"
                    value={formData.size_sqm} 
                    onChange={handleChange} 
                    placeholder="0" 
                  />
                </div>
              </div>
              
              {/* Image Upload */}
              <div className="space-y-2 pt-4">
                <Label>Property Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Property preview" 
                        className="w-full h-48 object-cover rounded-md" 
                      />
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-md">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">Upload an image</p>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full max-w-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/property-management')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Property' : 'Add Property'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PropertyForm;
