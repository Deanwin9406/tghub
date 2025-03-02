
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import KycRequirementCard from '@/components/kyc/KycRequirementCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

const KycVerification = () => {
  const { user, profile, roles, hasCompletedKyc } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('identity');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingKyc, setExistingKyc] = useState<any>(null);
  const [kycData, setKycData] = useState({
    idType: 'national_id',
    idNumber: '',
    idImage: null as File | null,
    addressProofImage: null as File | null,
    businessLicenseImage: null as File | null,
    professionalCertificateImage: null as File | null
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (hasCompletedKyc) {
      toast({
        title: 'Vérification KYC déjà complétée',
        description: 'Vous allez être redirigé vers votre tableau de bord',
      });
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }
    
    // Check if user has a pending KYC verification
    const checkExistingKyc = async () => {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error("Error fetching KYC verification:", error);
        return;
      }
      
      if (data) {
        setExistingKyc(data);
        
        if (data.status === 'pending') {
          toast({
            title: 'Vérification KYC en cours',
            description: 'Votre vérification KYC est en cours d\'examen',
          });
        } else if (data.status === 'rejected') {
          toast({
            title: 'Vérification KYC rejetée',
            description: 'Votre vérification KYC a été rejetée. Veuillez soumettre à nouveau.',
            variant: 'destructive',
          });
        }
      }
    };
    
    checkExistingKyc();
  }, [user, hasCompletedKyc, navigate, toast]);

  const isLandlord = roles.includes('landlord');
  const isTenant = roles.includes('tenant');
  const isManager = roles.includes('manager');
  const isAgent = roles.includes('agent');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille du fichier ne doit pas dépasser 5 MB",
          variant: "destructive",
        });
        return;
      }
      
      setKycData({
        ...kycData,
        [field]: file,
      });
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!file || !user) return '';
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file);
    
    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }
    
    const { data } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const submitKyc = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      if (!kycData.idNumber || !kycData.idImage) {
        toast({
          title: 'Informations incomplètes',
          description: 'Veuillez fournir toutes les informations d\'identité requises',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Upload ID image
      const idImageUrl = await uploadFile(kycData.idImage, 'identity-documents');
      
      // Upload address proof if provided
      let addressProofUrl = '';
      if (kycData.addressProofImage) {
        addressProofUrl = await uploadFile(kycData.addressProofImage, 'address-documents');
      }
      
      // Upload business license if provided (for landlords and managers)
      let businessLicenseUrl = '';
      if (kycData.businessLicenseImage) {
        businessLicenseUrl = await uploadFile(kycData.businessLicenseImage, 'business-documents');
      }
      
      // Upload professional certificate if provided (for agents)
      let professionalCertificateUrl = '';
      if (kycData.professionalCertificateImage) {
        professionalCertificateUrl = await uploadFile(kycData.professionalCertificateImage, 'certificates');
      }
      
      const kycInfo = {
        user_id: user.id,
        id_type: kycData.idType,
        id_number: kycData.idNumber,
        id_image_url: idImageUrl,
        address_proof_url: addressProofUrl,
        status: 'pending',
        notes: JSON.stringify({
          business_license_url: businessLicenseUrl || null,
          professional_certificate_url: professionalCertificateUrl || null,
          role: roles[0] || 'tenant',
        }),
      };
      
      let operation;
      
      if (existingKyc) {
        // Update existing KYC verification
        operation = supabase
          .from('kyc_verifications')
          .update(kycInfo)
          .eq('id', existingKyc.id);
      } else {
        // Insert new KYC verification
        operation = supabase
          .from('kyc_verifications')
          .insert(kycInfo);
      }
      
      const { error } = await operation;
      
      if (error) {
        throw new Error(`Error ${existingKyc ? 'updating' : 'storing'} KYC data: ${error.message}`);
      }
      
      toast({
        title: 'Vérification KYC soumise',
        description: 'Votre demande de vérification a été soumise avec succès et est en cours d\'examen.',
      });
      
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      toast({
        title: 'Erreur lors de la soumission',
        description: error.message || 'Une erreur est survenue lors de la soumission de votre vérification KYC',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !profile) {
    return (
      <Layout>
        <div className="container mx-auto py-12 flex items-center justify-center min-h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Vérification KYC</h1>
            <p className="text-muted-foreground">
              Complétez la vérification de votre identité pour accéder à toutes les fonctionnalités
            </p>
          </div>

          {existingKyc && existingKyc.status === 'pending' ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Vérification en cours</CardTitle>
                <CardDescription>
                  Votre demande de vérification KYC est en cours d'examen. Vous serez notifié lorsque le processus sera terminé.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-blue-50 p-4 flex items-start">
                  <Loader2 className="h-5 w-5 text-blue-500 mr-2 mt-0.5 animate-spin" />
                  <div className="text-blue-800">
                    <p>Les délais de vérification typiques sont de 1-2 jours ouvrables. Merci de votre patience.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Bienvenue, {profile.first_name} {profile.last_name}</CardTitle>
                  <CardDescription>
                    En tant que {roles.includes('landlord') ? 'propriétaire' : 
                                 roles.includes('tenant') ? 'locataire' : 
                                 roles.includes('agent') ? 'agent immobilier' : 
                                 'gestionnaire immobilier'}, 
                    nous devons vérifier certaines informations pour activer votre compte.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <KycRequirementCard 
                      title="Vérification d'identité" 
                      description="Fournissez une pièce d'identité officielle pour confirmer votre identité"
                      isRequired={true}
                      isCompleted={false}
                      onAction={() => setActiveTab('identity')}
                      actionLabel="Fournir une pièce d'identité"
                    />
                    
                    <KycRequirementCard 
                      title="Preuve d'adresse" 
                      description="Confirmez votre adresse de résidence actuelle"
                      isRequired={isTenant || isLandlord}
                      isCompleted={false}
                      onAction={() => setActiveTab('address')}
                      actionLabel="Fournir une preuve d'adresse"
                    />
                    
                    {(isLandlord || isManager) && (
                      <KycRequirementCard 
                        title="Licence commerciale" 
                        description="Document attestant de votre statut commercial"
                        isRequired={isManager}
                        isCompleted={false}
                        onAction={() => setActiveTab('business')}
                        actionLabel="Soumettre votre licence"
                      />
                    )}
                    
                    {isAgent && (
                      <KycRequirementCard 
                        title="Certification professionnelle" 
                        description="Certification d'agent immobilier"
                        isRequired={true}
                        isCompleted={false}
                        onAction={() => setActiveTab('professional')}
                        actionLabel="Soumettre votre certification"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documents de vérification</CardTitle>
                  <CardDescription>
                    Soumettez les documents requis pour vérifier votre identité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
                      <TabsTrigger value="identity">Identité</TabsTrigger>
                      <TabsTrigger value="address">Adresse</TabsTrigger>
                      {(isLandlord || isManager) && (
                        <TabsTrigger value="business">Licence</TabsTrigger>
                      )}
                      {isAgent && (
                        <TabsTrigger value="professional">Certification</TabsTrigger>
                      )}
                    </TabsList>
                    
                    <TabsContent value="identity" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="idType">Type de pièce d'identité</Label>
                        <Select 
                          value={kycData.idType} 
                          onValueChange={(value) => setKycData({...kycData, idType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="national_id">Carte d'identité nationale</SelectItem>
                            <SelectItem value="passport">Passeport</SelectItem>
                            <SelectItem value="drivers_license">Permis de conduire</SelectItem>
                            <SelectItem value="voters_card">Carte d'électeur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">Numéro de la pièce d'identité</Label>
                        <Input 
                          id="idNumber" 
                          value={kycData.idNumber}
                          onChange={(e) => setKycData({...kycData, idNumber: e.target.value})}
                          placeholder="Entrez le numéro de votre pièce d'identité" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="idImage">Téléchargez une image de votre pièce d'identité</Label>
                        <div className="border-2 border-dashed rounded-md p-6 text-center hover:bg-muted/50 cursor-pointer">
                          <input 
                            type="file" 
                            id="idImage" 
                            accept="image/*,application/pdf" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, 'idImage')}
                          />
                          <label htmlFor="idImage" className="cursor-pointer flex flex-col items-center justify-center">
                            {kycData.idImage ? (
                              <div className="flex flex-col items-center">
                                <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                                <span className="text-sm text-green-600 font-medium">
                                  {kycData.idImage.name}
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                  Cliquez pour changer
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium">Cliquez pour télécharger</span>
                                <span className="text-xs text-muted-foreground mt-1">
                                  PNG, JPG ou PDF (max 5MB)
                                </span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="address" className="space-y-4">
                      <div className="rounded-md bg-amber-50 p-4 text-sm flex items-start mb-4">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                        <div className="text-amber-800">
                          <p className="font-medium">Documents acceptés comme preuve d'adresse:</p>
                          <ul className="list-disc pl-5 mt-1">
                            <li>Facture d'électricité (moins de 3 mois)</li>
                            <li>Facture d'eau (moins de 3 mois)</li>
                            <li>Relevé bancaire (moins de 3 mois)</li>
                            <li>Contrat de bail</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="addressProofImage">Téléchargez une preuve d'adresse</Label>
                        <div className="border-2 border-dashed rounded-md p-6 text-center hover:bg-muted/50 cursor-pointer">
                          <input 
                            type="file" 
                            id="addressProofImage" 
                            accept="image/*,application/pdf" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, 'addressProofImage')}
                          />
                          <label htmlFor="addressProofImage" className="cursor-pointer flex flex-col items-center justify-center">
                            {kycData.addressProofImage ? (
                              <div className="flex flex-col items-center">
                                <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                                <span className="text-sm text-green-600 font-medium">
                                  {kycData.addressProofImage.name}
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                  Cliquez pour changer
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium">Cliquez pour télécharger</span>
                                <span className="text-xs text-muted-foreground mt-1">
                                  PNG, JPG ou PDF (max 5MB)
                                </span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {(isLandlord || isManager) && (
                      <TabsContent value="business" className="space-y-4">
                        <div className="rounded-md bg-amber-50 p-4 text-sm flex items-start mb-4">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                          <div className="text-amber-800">
                            <p className="font-medium">Documents acceptés comme licence commerciale:</p>
                            <ul className="list-disc pl-5 mt-1">
                              <li>Registre du commerce</li>
                              <li>Licence commerciale</li>
                              <li>Autorisation municipale</li>
                              <li>Certificat d'enregistrement fiscal</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="businessLicenseImage">Téléchargez votre licence commerciale</Label>
                          <div className="border-2 border-dashed rounded-md p-6 text-center hover:bg-muted/50 cursor-pointer">
                            <input 
                              type="file" 
                              id="businessLicenseImage" 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, 'businessLicenseImage')}
                            />
                            <label htmlFor="businessLicenseImage" className="cursor-pointer flex flex-col items-center justify-center">
                              {kycData.businessLicenseImage ? (
                                <div className="flex flex-col items-center">
                                  <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                                  <span className="text-sm text-green-600 font-medium">
                                    {kycData.businessLicenseImage.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    Cliquez pour changer
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                  <span className="text-sm font-medium">Cliquez pour télécharger</span>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    PNG, JPG ou PDF (max 5MB)
                                  </span>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </TabsContent>
                    )}
                    
                    {isAgent && (
                      <TabsContent value="professional" className="space-y-4">
                        <div className="rounded-md bg-amber-50 p-4 text-sm flex items-start mb-4">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                          <div className="text-amber-800">
                            <p className="font-medium">Documents acceptés comme certification professionnelle:</p>
                            <ul className="list-disc pl-5 mt-1">
                              <li>Licence d'agent immobilier</li>
                              <li>Certificat de formation immobilière</li>
                              <li>Inscription à l'ordre des agents immobiliers</li>
                              <li>Certification professionnelle immobilière</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="professionalCertificateImage">Téléchargez votre certification</Label>
                          <div className="border-2 border-dashed rounded-md p-6 text-center hover:bg-muted/50 cursor-pointer">
                            <input 
                              type="file" 
                              id="professionalCertificateImage" 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, 'professionalCertificateImage')}
                            />
                            <label htmlFor="professionalCertificateImage" className="cursor-pointer flex flex-col items-center justify-center">
                              {kycData.professionalCertificateImage ? (
                                <div className="flex flex-col items-center">
                                  <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                                  <span className="text-sm text-green-600 font-medium">
                                    {kycData.professionalCertificateImage.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    Cliquez pour changer
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                  <span className="text-sm font-medium">Cliquez pour télécharger</span>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    PNG, JPG ou PDF (max 5MB)
                                  </span>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>

                  <div className="mt-8 flex justify-end">
                    <Button onClick={submitKyc} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        'Soumettre la vérification'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default KycVerification;
