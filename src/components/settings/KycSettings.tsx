
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, AlertTriangle, Upload } from 'lucide-react';
import TenantQrCode from '@/components/kyc/TenantQrCode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const KycSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [hasCompletedKyc, setHasCompletedKyc] = useState(false);
  const [idType, setIdType] = useState('passport');
  const [idNumber, setIdNumber] = useState('');
  const [idImage, setIdImage] = useState<File | null>(null);
  const [addressProofImage, setAddressProofImage] = useState<File | null>(null);
  const [idImageUrl, setIdImageUrl] = useState<string | null>(null);
  const [addressProofUrl, setAddressProofUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchKycStatus();
    }
  }, [user]);

  const fetchKycStatus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching KYC status:", error);
        return;
      }
      
      if (data) {
        setKycStatus(data.status);
        setHasCompletedKyc(data.status === 'approved');
        setIdType(data.id_type);
        setIdNumber(data.id_number);
        setIdImageUrl(data.id_image_url);
        setAddressProofUrl(data.address_proof_url);
      }
    } catch (error) {
      console.error("Error checking KYC status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIdImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "Le fichier ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }
    setIdImage(file);
  };

  const handleAddressProofChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "Le fichier ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }
    setAddressProofImage(file);
  };

  const uploadFile = async (file: File, path: string) => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${path}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `kyc/${fileName}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrl } = supabase.storage
        .from('kyc_documents')
        .getPublicUrl(filePath);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${path}:`, error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!idNumber.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez saisir le numéro d'identification",
        variant: "destructive",
      });
      return;
    }
    
    if (kycStatus === 'pending' && (!idImage || !addressProofImage)) {
      toast({
        title: "Documents requis",
        description: "Veuillez télécharger tous les documents requis",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let newIdImageUrl = idImageUrl;
      let newAddressProofUrl = addressProofUrl;
      
      if (idImage) {
        const uploadedIdUrl = await uploadFile(idImage, 'id');
        if (uploadedIdUrl) {
          newIdImageUrl = uploadedIdUrl;
        } else {
          throw new Error("Échec du téléchargement de la pièce d'identité");
        }
      }
      
      if (addressProofImage) {
        const uploadedAddressUrl = await uploadFile(addressProofImage, 'address');
        if (uploadedAddressUrl) {
          newAddressProofUrl = uploadedAddressUrl;
        } else {
          throw new Error("Échec du téléchargement du justificatif de domicile");
        }
      }
      
      const kycData = {
        user_id: user.id,
        id_type: idType,
        id_number: idNumber,
        id_image_url: newIdImageUrl,
        address_proof_url: newAddressProofUrl,
        status: 'pending'
      };
      
      let response;
      
      if (kycStatus === 'pending' || kycStatus === 'rejected') {
        if (hasCompletedKyc) {
          // Update existing verification
          response = await supabase
            .from('kyc_verifications')
            .update(kycData)
            .eq('user_id', user.id);
        } else {
          // Create new verification
          response = await supabase
            .from('kyc_verifications')
            .insert([kycData]);
        }
      } else {
        toast({
          title: "Vérification déjà soumise",
          description: "Votre vérification KYC est déjà en cours de traitement ou a été approuvée.",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (response?.error) throw response.error;
      
      toast({
        title: "Vérification soumise",
        description: "Votre vérification KYC a été soumise avec succès et est en attente d'approbation.",
      });
      
      // Refresh status
      fetchKycStatus();
    } catch (error: any) {
      console.error('Error submitting KYC verification:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la soumission. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'approved':
        return (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <Check className="h-5 w-5 mr-1" />
            <span>Approuvé</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 mr-1" />
            <span>Rejeté</span>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="flex items-center text-amber-600 dark:text-amber-400">
            <Loader2 className="h-5 w-5 mr-1 animate-spin" />
            <span>En attente</span>
          </div>
        );
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
          <div className="flex justify-between items-center">
            <CardTitle>Vérification d'identité (KYC)</CardTitle>
            {getStatusBadge()}
          </div>
          <CardDescription>
            La vérification KYC est nécessaire pour accéder à toutes les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kycStatus === 'approved' ? (
            <div className="flex flex-col items-center py-4">
              <Check className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Vérification approuvée</h3>
              <p className="text-center text-muted-foreground mb-4">
                Votre identité a été vérifiée avec succès. Vous avez maintenant accès à toutes les fonctionnalités.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="id-type">Type de pièce d'identité</Label>
                <Select value={idType} onValueChange={setIdType}>
                  <SelectTrigger id="id-type">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passeport</SelectItem>
                    <SelectItem value="national_id">Carte d'identité nationale</SelectItem>
                    <SelectItem value="drivers_license">Permis de conduire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="id-number">Numéro d'identification</Label>
                <Input
                  id="id-number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="id-image">Photo de pièce d'identité</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => document.getElementById('id-image')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {idImageUrl ? 'Changer l\'image' : 'Télécharger l\'image'}
                  </Button>
                  <input
                    id="id-image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    className="hidden"
                    onChange={handleIdImageChange}
                  />
                  {idImageUrl && (
                    <a 
                      href={idImageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Voir l'image actuelle
                    </a>
                  )}
                </div>
                {idImage && (
                  <p className="text-sm text-muted-foreground">
                    Fichier sélectionné: {idImage.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address-proof">Justificatif de domicile</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => document.getElementById('address-proof')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {addressProofUrl ? 'Changer l\'image' : 'Télécharger l\'image'}
                  </Button>
                  <input
                    id="address-proof"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    className="hidden"
                    onChange={handleAddressProofChange}
                  />
                  {addressProofUrl && (
                    <a 
                      href={addressProofUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Voir l'image actuelle
                    </a>
                  )}
                </div>
                {addressProofImage && (
                  <p className="text-sm text-muted-foreground">
                    Fichier sélectionné: {addressProofImage.name}
                  </p>
                )}
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || kycStatus === 'approved' || kycStatus === 'pending'}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Soumission...
                    </>
                  ) : (
                    'Soumettre pour vérification'
                  )}
                </Button>
              </div>
              
              {kycStatus === 'rejected' && (
                <div className="p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <h4 className="font-medium flex items-center text-red-800 dark:text-red-300">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Votre demande précédente a été rejetée
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Veuillez soumettre à nouveau avec des documents valides.
                  </p>
                </div>
              )}
              
              {kycStatus === 'pending' && (
                <div className="p-4 border border-amber-200 rounded-md bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                  <h4 className="font-medium flex items-center text-amber-800 dark:text-amber-300">
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Votre demande est en cours d'examen
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Nous vous informerons dès que votre vérification sera terminée.
                  </p>
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
      
      {kycStatus === 'approved' && (
        <Card>
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
                firstName={user?.user_metadata?.first_name || ''} 
                lastName={user?.user_metadata?.last_name || ''} 
              />
            </div>
          </CardContent>
          <CardFooter className="justify-center flex-col space-y-2">
            <p className="text-sm text-muted-foreground text-center mb-2">
              Ce code QR contient votre identifiant unique de locataire et est valide pendant 15 minutes.
            </p>
            <Button variant="outline">
              Télécharger le code QR
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default KycSettings;
