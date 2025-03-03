import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TenantQrCode from '@/components/kyc/TenantQrCode';

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile?.avatar_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
  });
  const [hasCompletedKyc, setHasCompletedKyc] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
      });
      setAvatarUrl(profile.avatar_url);
    }
    
    if (user) {
      checkKycStatus();
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

  const checkKycStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking KYC status:", error);
        return;
      }
      
      setHasCompletedKyc(data?.status === 'approved');
    } catch (error) {
      console.error("Error checking KYC status:", error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Profil</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Photo de profil</CardTitle>
                <CardDescription>Votre avatar sera visible par les autres utilisateurs</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} alt={profile?.first_name} />
                    <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer">
                    <Camera size={16} />
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
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Vérification</CardTitle>
                <CardDescription>Statut de vérification de votre compte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Email vérifié</p>
                      <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5">
                      {hasCompletedKyc ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {hasCompletedKyc ? "KYC complété" : "KYC non complété"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {hasCompletedKyc 
                          ? "Votre identité a été vérifiée" 
                          : "Complétez la vérification d'identité pour accéder à toutes les fonctionnalités"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/kyc')} disabled={hasCompletedKyc}>
                  {hasCompletedKyc ? "Identité vérifiée" : "Vérifier mon identité"}
                </Button>
              </CardFooter>
            </Card>
            
            {hasCompletedKyc && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Code QR Locataire</CardTitle>
                  <CardDescription>
                    À présenter à votre propriétaire ou gestionnaire pour être ajouté à une propriété
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <TenantQrCode 
                      userId={user?.id || ''} 
                      firstName={profile?.first_name || ''} 
                      lastName={profile?.last_name || ''} 
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="outline" onClick={() => navigate('/kyc')}>
                    Voir en plein écran
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Modifiez vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                  
                  <Button type="submit" className="w-full" disabled={loading}>
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
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Gérez les paramètres de sécurité de votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Changer votre mot de passe</h3>
                  <p className="text-muted-foreground mb-4">
                    Nous vous enverrons un lien par email pour réinitialiser votre mot de passe
                  </p>
                  <Button variant="outline" onClick={() => navigate('/auth?reset=true')}>
                    Réinitialiser le mot de passe
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2 text-destructive">Zone de danger</h3>
                  <p className="text-muted-foreground mb-4">
                    La suppression de votre compte est permanente et ne peut pas être annulée
                  </p>
                  <Button variant="destructive">
                    Supprimer mon compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
