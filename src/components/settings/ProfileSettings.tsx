
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProfileSettings = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile?.avatar_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    country: profile?.country || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || '',
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Image trop grande",
        description: "L'image ne doit pas dépasser 2MB",
        variant: "destructive",
      });
      return;
    }
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null;
    
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    try {
      setUploading(true);
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile);
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrl } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image. Veuillez réessayer.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      let avatarPublicUrl = profile?.avatar_url;
      
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          avatarPublicUrl = newAvatarUrl;
        }
      }
      
      const { error } = await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        avatar_url: avatarPublicUrl,
      });
      
      if (error) throw error;
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getInitials = () => {
    if (profile) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>Modifiez vos informations de profil</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarUrl} alt={profile?.first_name} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer">
                <Camera size={18} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Cliquez sur l'icône pour changer votre photo de profil
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
              />
              <p className="text-xs text-muted-foreground">Votre email ne peut pas être modifié</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+228 XX XX XX XX"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading || uploading}>
              {loading || uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
