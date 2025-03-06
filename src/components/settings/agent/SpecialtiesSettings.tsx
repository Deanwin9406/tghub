
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BadgePlus, Award, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface Specialization {
  id: string;
  property_type: string;
  years_experience: number;
  certification_info: any;
}

const propertyTypes = [
  { value: 'house', label: 'Maison' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Maison de ville' },
  { value: 'land', label: 'Terrain' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industriel' },
  { value: 'mixed_use', label: 'Usage mixte' },
];

const SpecialtiesSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<{[key: string]: {name: string, year: string}}>({});

  useEffect(() => {
    if (user) {
      fetchSpecializations();
    }
  }, [user]);

  const fetchSpecializations = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('agent_specializations')
        .select('*')
        .eq('agent_id', user.id);
        
      if (error) throw error;
      
      if (data) {
        setSpecializations(data);
        
        // Set selected property types
        const types = data.map(spec => spec.property_type);
        setSelectedTypes(types);
        
        // Set certifications
        const certs: {[key: string]: {name: string, year: string}} = {};
        data.forEach(spec => {
          if (spec.certification_info) {
            certs[spec.property_type] = {
              name: spec.certification_info.name || '',
              year: spec.certification_info.year || ''
            };
          }
        });
        setCertifications(certs);
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos spécialités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedTypes(prev => [...prev, type]);
    } else {
      setSelectedTypes(prev => prev.filter(t => t !== type));
    }
  };

  const handleCertificationChange = (type: string, field: 'name' | 'year', value: string) => {
    setCertifications(prev => ({
      ...prev,
      [type]: {
        ...prev[type] || { name: '', year: '' },
        [field]: value
      }
    }));
  };

  const handleSaveSpecializations = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      // First, delete existing specializations
      await supabase
        .from('agent_specializations')
        .delete()
        .eq('agent_id', user.id);
      
      // Then, insert new ones
      const specializations = selectedTypes.map(type => ({
        agent_id: user.id,
        property_type: type,
        years_experience: 0, // Default value, could be made editable
        certification_info: certifications[type] || null
      }));
      
      if (specializations.length > 0) {
        const { error } = await supabase
          .from('agent_specializations')
          .insert(specializations);
          
        if (error) throw error;
      }
      
      toast({
        title: "Spécialités enregistrées",
        description: "Vos spécialités ont été mises à jour avec succès.",
      });
      
      fetchSpecializations(); // Refresh data
    } catch (error) {
      console.error('Error saving specializations:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer vos spécialités",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Types de propriétés
          </CardTitle>
          <CardDescription>Sélectionnez les types de propriétés dans lesquels vous vous spécialisez</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {propertyTypes.map((type) => (
              <div key={type.value} className="flex items-start space-x-2">
                <Checkbox 
                  id={`type-${type.value}`} 
                  checked={selectedTypes.includes(type.value)}
                  onCheckedChange={(checked) => handleTypeChange(type.value, checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor={`type-${type.value}`} className="font-medium">
                    {type.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Certifications et formations
          </CardTitle>
          <CardDescription>Ajoutez vos certifications professionnelles pour chaque type de propriété</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedTypes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Sélectionnez d'abord des types de propriétés pour ajouter des certifications
            </p>
          ) : (
            selectedTypes.map((type, index) => {
              const propType = propertyTypes.find(t => t.value === type);
              return (
                <div key={type} className="space-y-4">
                  {index > 0 && <Separator />}
                  <h3 className="font-medium text-lg">{propType?.label}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`cert-name-${type}`}>Nom de la certification</Label>
                      <Input 
                        id={`cert-name-${type}`}
                        value={certifications[type]?.name || ''}
                        onChange={(e) => handleCertificationChange(type, 'name', e.target.value)}
                        placeholder="Ex: Courtier immobilier agréé"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`cert-year-${type}`}>Année d'obtention</Label>
                      <Input 
                        id={`cert-year-${type}`}
                        type="number"
                        value={certifications[type]?.year || ''}
                        onChange={(e) => handleCertificationChange(type, 'year', e.target.value)}
                        placeholder="Ex: 2020"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
      
      <Button 
        onClick={handleSaveSpecializations} 
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          'Enregistrer les spécialités'
        )}
      </Button>
    </>
  );
};

export default SpecialtiesSettings;
