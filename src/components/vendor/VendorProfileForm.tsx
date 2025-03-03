
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define the schema for vendor profile
const vendorProfileSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  description: z.string().min(10, "Please provide a description of your services"),
  services_offered: z.string().array().min(1, "Select at least one service"),
  experience_years: z.number().min(0, "Years must be 0 or greater"),
  service_area: z.string().min(3, "Service area is required"),
  hourly_rate: z.number().min(0, "Rate must be 0 or greater"),
  is_available: z.boolean().default(true),
  logo_url: z.string().optional(),
});

type VendorProfileFormValues = z.infer<typeof vendorProfileSchema>;

// Common service categories
const serviceCategories = [
  "Electrical", "Plumbing", "Painting", "Carpentry", 
  "Gardening", "Cleaning", "Moving", "HVAC", 
  "Roofing", "Flooring", "Security", "Renovation",
  "Pool Maintenance", "Pest Control", "Appliance Repair", "Interior Design"
];

interface VendorProfileFormProps {
  onComplete?: () => void;
}

const VendorProfileForm = ({ onComplete }: VendorProfileFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newService, setNewService] = useState("");
  const [customServices, setCustomServices] = useState<string[]>([]);
  
  // Initialize form with default values
  const form = useForm<VendorProfileFormValues>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      business_name: "",
      description: "",
      services_offered: [],
      experience_years: 0,
      service_area: "",
      hourly_rate: 0,
      is_available: true,
      logo_url: "",
    },
  });
  
  useEffect(() => {
    if (user) {
      fetchVendorProfile();
    }
  }, [user]);
  
  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is 'not found', which is fine for new profiles
        throw error;
      }
      
      if (data) {
        // Populate the form with existing data
        form.reset({
          business_name: data.business_name || "",
          description: data.description || "",
          services_offered: data.services_offered || [],
          experience_years: data.experience_years || 0,
          service_area: data.service_area || "",
          hourly_rate: data.hourly_rate || 0,
          is_available: data.is_available,
          logo_url: data.logo_url || "",
        });
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vendor profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (values: VendorProfileFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Combine form services with custom services
      const allServices = [...values.services_offered, ...customServices];
      
      const { error } = await supabase
        .from('vendor_profiles')
        .upsert({
          id: user.id,
          business_name: values.business_name,
          description: values.description,
          services_offered: allServices,
          experience_years: values.experience_years,
          service_area: values.service_area,
          hourly_rate: values.hourly_rate,
          is_available: values.is_available,
          logo_url: values.logo_url,
          updated_at: new Date(),
        });
      
      if (error) throw error;
      
      toast({
        title: 'Profile Updated',
        description: 'Your vendor profile has been updated successfully.',
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vendor profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddCustomService = () => {
    if (!newService.trim()) return;
    
    if (!customServices.includes(newService.trim())) {
      setCustomServices(prev => [...prev, newService.trim()]);
      setNewService("");
    }
  };
  
  const removeCustomService = (service: string) => {
    setCustomServices(prev => prev.filter(s => s !== service));
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="business_name">Business Name</Label>
          <Input
            id="business_name"
            {...form.register("business_name")}
            placeholder="Your Business Name"
          />
          {form.formState.errors.business_name && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.business_name.message}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Describe your services and expertise"
            rows={4}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>
        
        <div>
          <Label>Services Offered</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
            {serviceCategories.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={`service-${service}`}
                  checked={form.watch("services_offered").includes(service)}
                  onCheckedChange={(checked) => {
                    const current = form.watch("services_offered");
                    if (checked) {
                      form.setValue("services_offered", [...current, service]);
                    } else {
                      form.setValue(
                        "services_offered",
                        current.filter((s) => s !== service)
                      );
                    }
                  }}
                />
                <Label htmlFor={`service-${service}`} className="text-sm cursor-pointer">
                  {service}
                </Label>
              </div>
            ))}
          </div>
          {form.formState.errors.services_offered && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.services_offered.message}
            </p>
          )}
        </div>
        
        <div>
          <Label>Custom Services</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Add a custom service"
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleAddCustomService}
              variant="outline"
            >
              Add
            </Button>
          </div>
          
          {customServices.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {customServices.map((service) => (
                <Badge key={service} variant="secondary" className="px-3 py-1">
                  {service}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => removeCustomService(service)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              {...form.register("experience_years", { 
                valueAsNumber: true 
              })}
            />
          </div>
          
          <div>
            <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
            <Input
              id="hourly_rate"
              type="number"
              min="0"
              step="0.01"
              {...form.register("hourly_rate", { 
                valueAsNumber: true 
              })}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="service_area">Service Area</Label>
          <Input
            id="service_area"
            {...form.register("service_area")}
            placeholder="Cities or regions you serve"
          />
          {form.formState.errors.service_area && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.service_area.message}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input
            id="logo_url"
            {...form.register("logo_url")}
            placeholder="URL to your business logo"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_available"
            checked={form.watch("is_available")}
            onCheckedChange={(checked) => {
              form.setValue("is_available", checked === true);
            }}
          />
          <Label htmlFor="is_available">Currently Available for Work</Label>
        </div>
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
};

export default VendorProfileForm;
