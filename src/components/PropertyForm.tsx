
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PropertyFormValues = {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  country: string;
  property_type: "apartment" | "house" | "villa" | "office" | "land" | "other";
  bedrooms: number;
  bathrooms: number;
  size_sqm: number;
  featured: boolean;
  status: "available" | "rented" | "sold" | "pending";
  main_image_url: string;
};

type PropertyFormProps = {
  initialValues?: Partial<PropertyFormValues>;
  onSubmit: (values: PropertyFormValues) => Promise<void>;
  propertyId?: string;
};

const propertyTypes = [
  { value: "apartment", label: "Appartement" },
  { value: "house", label: "Maison" },
  { value: "villa", label: "Villa" },
  { value: "office", label: "Bureau" },
  { value: "land", label: "Terrain" },
  { value: "other", label: "Autre" },
];

const propertyStatuses = [
  { value: "available", label: "Disponible" },
  { value: "rented", label: "Loué" },
  { value: "sold", label: "Vendu" },
  { value: "pending", label: "En attente" },
];

const PropertyForm: React.FC<PropertyFormProps> = ({ initialValues, onSubmit, propertyId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.main_image_url || null);
  
  const [values, setValues] = useState<PropertyFormValues>({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    price: initialValues?.price || 0,
    address: initialValues?.address || '',
    city: initialValues?.city || '',
    country: initialValues?.country || 'Togo',
    property_type: initialValues?.property_type || "apartment",
    bedrooms: initialValues?.bedrooms || 0,
    bathrooms: initialValues?.bathrooms || 0,
    size_sqm: initialValues?.size_sqm || 0,
    featured: initialValues?.featured || false,
    status: initialValues?.status || "available",
    main_image_url: initialValues?.main_image_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setValues({
      ...values,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleSelectChange = (name: keyof PropertyFormValues, value: string) => {
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSwitchChange = (name: keyof PropertyFormValues, checked: boolean) => {
    setValues({
      ...values,
      [name]: checked,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre un bien immobilier.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = values.main_image_url;

      if (imageFile) {
        // Upload the image to Supabase Storage
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      // Prepare final data with the image URL
      const finalValues: PropertyFormValues = {
        ...values,
        main_image_url: imageUrl,
      };

      await onSubmit(finalValues);

      toast({
        title: propertyId ? "Bien mis à jour" : "Bien ajouté",
        description: propertyId 
          ? "Les informations du bien ont été mises à jour avec succès." 
          : "Le bien a été ajouté avec succès à notre plateforme.",
      });

      navigate(propertyId ? `/property/${propertyId}` : "/property-management");
    } catch (error) {
      console.error("Error submitting property:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission du bien.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                name="title"
                value={values.title}
                onChange={handleChange}
                placeholder="Ex: Appartement de luxe au centre-ville"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={values.description}
                onChange={handleChange}
                placeholder="Description détaillée du bien immobilier"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={values.price}
                  onChange={handleChange}
                  min={0}
                  placeholder="Prix en XOF"
                  required
                />
              </div>

              <div>
                <Label htmlFor="property_type">Type de bien</Label>
                <Select
                  value={values.property_type}
                  onValueChange={(value) => handleSelectChange('property_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                value={values.address}
                onChange={handleChange}
                placeholder="Adresse complète"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  placeholder="Ville"
                  required
                />
              </div>

              <div>
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  name="country"
                  value={values.country}
                  onChange={handleChange}
                  placeholder="Pays"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Chambres</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  value={values.bedrooms}
                  onChange={handleChange}
                  min={0}
                  placeholder="Nombre de chambres"
                />
              </div>

              <div>
                <Label htmlFor="bathrooms">Salles de bain</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  value={values.bathrooms}
                  onChange={handleChange}
                  min={0}
                  placeholder="Nombre de salles de bain"
                />
              </div>

              <div>
                <Label htmlFor="size_sqm">Surface (m²)</Label>
                <Input
                  id="size_sqm"
                  name="size_sqm"
                  type="number"
                  value={values.size_sqm}
                  onChange={handleChange}
                  min={0}
                  placeholder="Surface en m²"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                value={values.status}
                onValueChange={(value) => handleSelectChange('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {propertyStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={values.featured}
                onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Mettre en avant cette propriété
              </Label>
            </div>

            <div>
              <Label htmlFor="image">Image principale</Label>
              <div className="mt-1 flex items-center">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Property preview"
                    className="h-32 w-auto object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/property-management")}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Traitement..." : propertyId ? "Mettre à jour" : "Ajouter"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyForm;
