
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface VendorProfile {
  id: string;
  business_name: string;
  description: string | null;
  services_offered: string[];
  experience_years: number | null;
  service_area: string | null;
  hourly_rate: number | null;
  is_available: boolean;
  logo_url: string | null;
}

const VendorProfileForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    servicesOffered: '',
    experienceYears: '',
    serviceArea: '',
    hourlyRate: '',
    isAvailable: true,
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
        throw error;
      }
      
      if (data) {
        setProfile(data as VendorProfile);
        setFormData({
          businessName: data.business_name || '',
          description: data.description || '',
          servicesOffered: (data.services_offered || []).join(', '),
          experienceYears: data.experience_years?.toString() || '',
          serviceArea: data.service_area || '',
          hourlyRate: data.hourly_rate?.toString() || '',
          isAvailable: data.is_available || false,
        });
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les informations du profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isAvailable: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUpdating(true);
    try {
      // Parse numeric values
      const experienceYears = formData.experienceYears ? parseInt(formData.experienceYears) : null;
      const hourlyRate = formData.hourlyRate ? parseFloat(formData.hourlyRate) : null;
      
      // Parse services offered as array
      const servicesOffered = formData.servicesOffered
        .split(',')
        .map(service => service.trim())
        .filter(service => service.length > 0);
        
      const vendorData = {
        id: user.id,
        business_name: formData.businessName,
        description: formData.description,
        services_offered: servicesOffered,
        experience_years: experienceYears,
        service_area: formData.serviceArea,
        hourly_rate: hourlyRate,
        is_available: formData.isAvailable,
        updated_at: new Date().toISOString()
      };
      
      let response;
      
      if (profile) {
        // Update existing profile
        response = await supabase
          .from('vendor_profiles')
          .update(vendorData)
          .eq('id', user.id);
      } else {
        // Create new profile
        response = await supabase
          .from('vendor_profiles')
          .insert(vendorData);
      }
      
      if (response.error) throw response.error;
      
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès',
      });
      
      fetchVendorProfile(); // Refresh data
    } catch (error: any) {
      console.error('Error updating vendor profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations professionnelles</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nom de l'entreprise</Label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez votre entreprise et vos services..."
              className="min-h-[120px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="servicesOffered">Services offerts (séparés par des virgules)</Label>
            <Input
              id="servicesOffered"
              name="servicesOffered"
              value={formData.servicesOffered}
              onChange={handleChange}
              placeholder="Plomberie, Électricité, Rénovation..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Années d'expérience</Label>
              <Input
                id="experienceYears"
                name="experienceYears"
                type="number"
                value={formData.experienceYears}
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Taux horaire (XOF)</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={handleChange}
                min="0"
                step="500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="serviceArea">Zone de service</Label>
            <Input
              id="serviceArea"
              name="serviceArea"
              value={formData.serviceArea}
              onChange={handleChange}
              placeholder="Lomé, Tout le Togo..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isAvailable"
              checked={formData.isAvailable}
              onCheckedChange={handleToggleChange}
            />
            <Label htmlFor="isAvailable">Disponible pour de nouveaux clients</Label>
          </div>
          
          <Button type="submit" disabled={updating}>
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VendorProfileForm;
