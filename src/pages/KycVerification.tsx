
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Upload, Check, AlertTriangle, FileText, Clock, HomeIcon, UserIcon, Briefcase, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const KycVerification = () => {
  const { user, roles, hasCompletedKyc } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idImage, setIdImage] = useState<File | null>(null);
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected' | null>(null);
  const [notes, setNotes] = useState('');
  
  // Additional fields for specific roles
  const [businessName, setBusinessName] = useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [professionalExperience, setProfessionalExperience] = useState('');
  
  const idImageInputRef = useRef<HTMLInputElement>(null);
  const addressProofInputRef = useRef<HTMLInputElement>(null);
  const licenseImageInputRef = useRef<HTMLInputElement>(null);

  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIdImage(e.target.files[0]);
    }
  };

  const handleAddressProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAddressProof(e.target.files[0]);
    }
  };
  
  const handleLicenseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLicenseImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for all roles
    if (!idType || !idNumber || !idImage || !addressProof) {
      toast({
        title: "Information manquante",
        description: "Veuillez remplir tous les champs obligatoires et télécharger les documents requis.",
        variant: "destructive",
      });
      return;
    }
    
    // Role-specific validation
    if (roles.includes('agent') || roles.includes('manager')) {
      if (!licenseNumber || !licenseImage) {
        toast({
          title: "Information professionnelle manquante",
          description: "Les agents et gestionnaires doivent fournir les informations de licence professionnelle.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (roles.includes('landlord')) {
      if (!businessName) {
        toast({
          title: "Information propriétaire manquante",
          description: "Les propriétaires doivent fournir le nom de leur entreprise ou activité.",
          variant: "destructive",
        });
        return;
      }
    }

    setUploading(true);

    try {
      // Upload ID image
      const idImagePath = `kyc/${user?.id}/id_${Date.now()}.${idImage.name.split('.').pop()}`;
      const { error: idImageError } = await supabase.storage
        .from('avatars')
        .upload(idImagePath, idImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (idImageError) {
        throw new Error(`ID Image Upload Error: ${idImageError.message}`);
      }

      const idImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${idImagePath}`;

      // Upload address proof
      const addressProofPath = `kyc/${user?.id}/address_${Date.now()}.${addressProof.name.split('.').pop()}`;
      const { error: addressProofError } = await supabase.storage
        .from('avatars')
        .upload(addressProofPath, addressProof, {
          cacheControl: '3600',
          upsert: false
        });

      if (addressProofError) {
        throw new Error(`Address Proof Upload Error: ${addressProofError.message}`);
      }

      const addressProofUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${addressProofPath}`;
      
      // Upload license if applicable
      let licenseImageUrl = '';
      if (licenseImage) {
        const licenseImagePath = `kyc/${user?.id}/license_${Date.now()}.${licenseImage.name.split('.').pop()}`;
        const { error: licenseImageError } = await supabase.storage
          .from('avatars')
          .upload(licenseImagePath, licenseImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (licenseImageError) {
          throw new Error(`License Image Upload Error: ${licenseImageError.message}`);
        }

        licenseImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${licenseImagePath}`;
      }

      // Prepare metadata based on role
      const metadata: Record<string, any> = {
        user_role: roles[0] || 'tenant'
      };
      
      if (roles.includes('agent') || roles.includes('manager')) {
        metadata.license_number = licenseNumber;
        metadata.license_image_url = licenseImageUrl;
        metadata.professional_experience = professionalExperience;
      }
      
      if (roles.includes('landlord')) {
        metadata.business_name = businessName;
        metadata.business_registration_number = businessRegistrationNumber;
      }

      // Insert KYC verification record
      const { error: dbError } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: user.id,
          id_type: idType,
          id_number: idNumber,
          id_image_url: idImageUrl,
          address_proof_url: addressProofUrl,
          status: 'pending',
          notes: JSON.stringify(metadata),
        });

      if (dbError) {
        throw new Error(`Database Error: ${dbError.message}`);
      }

      toast({
        title: "Vérification soumise",
        description: "Votre demande de vérification KYC a été soumise et est en attente d'examen.",
      });

      setVerificationStatus('pending');
    } catch (error: any) {
      console.error("KYC Submission Error:", error);
      toast({
        title: "Erreur de soumission",
        description: error.message || "Échec de la soumission de vérification KYC. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const fetchVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('status, notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching KYC status:", error);
        return;
      }

      const statusValue = data?.status === 'approved' ? 'verified' : data?.status;
      setVerificationStatus(statusValue as 'pending' | 'verified' | 'rejected' | null);
      setNotes(data?.notes || '');
    } catch (error) {
      console.error("Error fetching KYC status:", error);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, [user]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="secondary" className="bg-green-500 text-white">Vérifié</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-500 text-white">En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  // Get current role
  const currentRole = roles[0] || 'tenant';
  
  // Set role icon and title
  const getRoleDetails = () => {
    switch (currentRole) {
      case 'landlord':
        return { 
          icon: <HomeIcon className="h-8 w-8 mb-2 text-primary" />, 
          title: "Vérification KYC Propriétaire",
          description: "Vérifiez votre identité en tant que propriétaire immobilier pour accéder à toutes les fonctionnalités."
        };
      case 'agent':
        return { 
          icon: <Briefcase className="h-8 w-8 mb-2 text-primary" />, 
          title: "Vérification KYC Agent Immobilier",
          description: "Confirmez vos qualifications professionnelles pour représenter des propriétés sur notre plateforme."
        };
      case 'manager':
        return { 
          icon: <Building className="h-8 w-8 mb-2 text-primary" />, 
          title: "Vérification KYC Gestionnaire",
          description: "Validez votre identité en tant que gestionnaire immobilier pour gérer les propriétés et les relations locatives."
        };
      default:
        return { 
          icon: <UserIcon className="h-8 w-8 mb-2 text-primary" />, 
          title: "Vérification KYC Locataire",
          description: "Vérifiez votre identité pour accéder à toutes les fonctionnalités locatives de notre plateforme."
        };
    }
  };
  
  const { icon, title, description } = getRoleDetails();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center">
              {icon}
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {verificationStatus ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 justify-center">
                  <h3 className="text-lg font-semibold">Statut de vérification:</h3>
                  {renderStatusBadge(verificationStatus)}
                </div>
                {notes && (
                  <div className="space-y-2">
                    <h4 className="text-md font-semibold">Notes:</h4>
                    <p className="text-muted-foreground">{notes}</p>
                  </div>
                )}
                {verificationStatus === 'rejected' && (
                  <Button onClick={() => {
                    setVerificationStatus(null);
                    setIdType('');
                    setIdNumber('');
                    setIdImage(null);
                    setAddressProof(null);
                    setNotes('');
                    setLicenseNumber('');
                    setLicenseImage(null);
                    setBusinessName('');
                    setBusinessRegistrationNumber('');
                    setProfessionalExperience('');
                  }}>
                    Soumettre à nouveau la vérification
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <Tabs defaultValue="identity" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="identity">Information d'identité</TabsTrigger>
                    <TabsTrigger value="role-specific">Information spécifique</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="identity" className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="idType">Type de pièce d'identité</Label>
                      <RadioGroup defaultValue={idType} onValueChange={setIdType}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="passport" id="passport" />
                          <Label htmlFor="passport" className="cursor-pointer">Passeport</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="drivers_license" id="drivers_license" />
                          <Label htmlFor="drivers_license" className="cursor-pointer">Permis de conduire</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="national_id" id="national_id" />
                          <Label htmlFor="national_id" className="cursor-pointer">Carte d'identité nationale</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="idNumber">Numéro d'identification</Label>
                      <Input
                        type="text"
                        id="idNumber"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="idImage">Image de la pièce d'identité</Label>
                      <Input
                        type="file"
                        id="idImage"
                        accept="image/*"
                        onChange={handleIdImageChange}
                        className="hidden"
                        ref={idImageInputRef}
                      />
                      <Button variant="outline" onClick={() => idImageInputRef.current?.click()}>
                        {idImage ? (
                          <div className="flex items-center">
                            <Check className="mr-2 h-4 w-4" />
                            <span>{idImage.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Upload className="mr-2 h-4 w-4" />
                            <span>Télécharger l'image de la pièce d'identité</span>
                          </div>
                        )}
                      </Button>
                      {idImage && (
                        <aside className="flex items-center space-x-2 mt-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{idImage.name} - {(idImage.size / 1024).toFixed(2)} KB</span>
                        </aside>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="addressProof">Justificatif de domicile</Label>
                      <Input
                        type="file"
                        id="addressProof"
                        accept="image/*, application/pdf"
                        onChange={handleAddressProofChange}
                        className="hidden"
                        ref={addressProofInputRef}
                      />
                      <Button variant="outline" onClick={() => addressProofInputRef.current?.click()}>
                        {addressProof ? (
                          <div className="flex items-center">
                            <Check className="mr-2 h-4 w-4" />
                            <span>{addressProof.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Upload className="mr-2 h-4 w-4" />
                            <span>Télécharger un justificatif de domicile</span>
                          </div>
                        )}
                      </Button>
                      {addressProof && (
                        <aside className="flex items-center space-x-2 mt-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{addressProof.name} - {(addressProof.size / 1024).toFixed(2)} KB</span>
                        </aside>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="role-specific" className="space-y-4">
                    {roles.includes('landlord') && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="businessName">Nom de l'entreprise ou du propriétaire</Label>
                          <Input
                            type="text"
                            id="businessName"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="businessRegistrationNumber">Numéro d'enregistrement (optionnel)</Label>
                          <Input
                            type="text"
                            id="businessRegistrationNumber"
                            value={businessRegistrationNumber}
                            onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    
                    {(roles.includes('agent') || roles.includes('manager')) && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="licenseNumber">Numéro de licence professionnelle</Label>
                          <Input
                            type="text"
                            id="licenseNumber"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="licenseImage">Image de la licence professionnelle</Label>
                          <Input
                            type="file"
                            id="licenseImage"
                            accept="image/*, application/pdf"
                            onChange={handleLicenseImageChange}
                            className="hidden"
                            ref={licenseImageInputRef}
                          />
                          <Button variant="outline" onClick={() => licenseImageInputRef.current?.click()}>
                            {licenseImage ? (
                              <div className="flex items-center">
                                <Check className="mr-2 h-4 w-4" />
                                <span>{licenseImage.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Upload className="mr-2 h-4 w-4" />
                                <span>Télécharger l'image de la licence</span>
                              </div>
                            )}
                          </Button>
                          {licenseImage && (
                            <aside className="flex items-center space-x-2 mt-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{licenseImage.name} - {(licenseImage.size / 1024).toFixed(2)} KB</span>
                            </aside>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="professionalExperience">Expérience professionnelle</Label>
                          <Textarea
                            id="professionalExperience"
                            value={professionalExperience}
                            onChange={(e) => setProfessionalExperience(e.target.value)}
                            placeholder="Décrivez votre expérience dans le secteur immobilier"
                            rows={4}
                          />
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
                
                <CardFooter className="flex justify-center pt-4">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        <span>Soumission en cours...</span>
                      </div>
                    ) : (
                      "Soumettre la vérification"
                    )}
                  </Button>
                </CardFooter>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default KycVerification;
