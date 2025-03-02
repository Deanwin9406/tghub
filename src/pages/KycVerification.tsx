
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Check, 
  ChevronRight, 
  FileText, 
  Loader2, 
  UploadCloud, 
  User, 
  X 
} from 'lucide-react';

const KycVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [idType, setIdType] = useState<'national_id' | 'passport' | 'driver_license'>('national_id');
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: 'Togo',
    idNumber: '',
  });
  const [files, setFiles] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
  });
  const [previews, setPreviews] = useState({
    idFront: null as string | null,
    idBack: null as string | null,
    selfie: null as string | null,
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'idFront' | 'idBack' | 'selfie') => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 5 Mo",
        variant: "destructive",
      });
      return;
    }
    
    setFiles({
      ...files,
      [type]: file,
    });
    
    setPreviews({
      ...previews,
      [type]: URL.createObjectURL(file),
    });
  };

  const uploadFiles = async () => {
    if (!user) return null;
    if (!files.idFront || !files.idBack || !files.selfie) {
      toast({
        title: "Documents manquants",
        description: "Veuillez télécharger tous les documents requis",
        variant: "destructive",
      });
      return null;
    }
    
    setUploading(true);
    
    try {
      const filePaths = {} as { idFront: string, idBack: string, selfie: string };
      
      // Upload ID front
      const frontFileExt = files.idFront.name.split('.').pop();
      const frontFileName = `${user.id}_front_${Math.random().toString(36).substring(2)}.${frontFileExt}`;
      const frontFilePath = `kyc/${frontFileName}`;
      
      // Upload ID back
      const backFileExt = files.idBack.name.split('.').pop();
      const backFileName = `${user.id}_back_${Math.random().toString(36).substring(2)}.${backFileExt}`;
      const backFilePath = `kyc/${backFileName}`;
      
      // Upload selfie
      const selfieFileExt = files.selfie.name.split('.').pop();
      const selfieFileName = `${user.id}_selfie_${Math.random().toString(36).substring(2)}.${selfieFileExt}`;
      const selfieFilePath = `kyc/${selfieFileName}`;
      
      const { error: frontError } = await supabase.storage
        .from('identity_documents')
        .upload(frontFilePath, files.idFront);
      
      if (frontError) throw frontError;
      
      const { error: backError } = await supabase.storage
        .from('identity_documents')
        .upload(backFilePath, files.idBack);
      
      if (backError) throw backError;
      
      const { error: selfieError } = await supabase.storage
        .from('identity_documents')
        .upload(selfieFilePath, files.selfie);
      
      if (selfieError) throw selfieError;
      
      // Get public URLs
      const { data: frontUrl } = supabase.storage
        .from('identity_documents')
        .getPublicUrl(frontFilePath);
      
      const { data: backUrl } = supabase.storage
        .from('identity_documents')
        .getPublicUrl(backFilePath);
      
      const { data: selfieUrl } = supabase.storage
        .from('identity_documents')
        .getPublicUrl(selfieFilePath);
      
      filePaths.idFront = frontUrl.publicUrl;
      filePaths.idBack = backUrl.publicUrl;
      filePaths.selfie = selfieUrl.publicUrl;
      
      return filePaths;
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger les fichiers. Veuillez réessayer.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      const filePaths = await uploadFiles();
      
      if (!filePaths) return;
      
      // Save KYC verification data to database
      const { error } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          date_of_birth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          id_type: idType,
          id_number: formData.idNumber,
          id_front_url: filePaths.idFront,
          id_back_url: filePaths.idBack,
          selfie_url: filePaths.selfie,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      setSubmitted(true);
      toast({
        title: "Vérification soumise",
        description: "Votre demande a été soumise avec succès et est en cours d'examen.",
      });
    } catch (error) {
      console.error('Error submitting KYC verification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre vérification. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (activeStep === 1) {
      // Validate personal info
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || 
          !formData.address || !formData.city || !formData.country) {
        toast({
          title: "Information incomplète",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Validate ID info
      if (!formData.idNumber) {
        toast({
          title: "Information incomplète",
          description: "Veuillez fournir votre numéro d'identification",
          variant: "destructive",
        });
        return;
      }
      setActiveStep(3);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
          <Card className="border-green-100 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-green-100 rounded-full p-3 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-green-700">Vérification soumise avec succès</h2>
                <p className="text-muted-foreground mb-8 max-w-lg">
                  Votre demande de vérification d'identité a été soumise et est en cours d'examen. 
                  Nous vous informerons par email une fois la vérification terminée.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Retour au tableau de bord
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vérification d'identité (KYC)</h1>
          <p className="text-muted-foreground">
            Pour assurer la sécurité de notre plateforme, nous devons vérifier votre identité.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-12">
                <div className="flex flex-col items-center">
                  <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                    activeStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    1
                  </div>
                  <span className="text-sm mt-2">Informations</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                    activeStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <span className="text-sm mt-2">Pièce d'identité</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                    activeStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    3
                  </div>
                  <span className="text-sm mt-2">Documents</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
                  <p className="text-muted-foreground mb-6">
                    Veuillez fournir vos informations personnelles exactement comme elles apparaissent sur votre pièce d'identité.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleFormChange} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleFormChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input 
                    id="dateOfBirth" 
                    name="dateOfBirth" 
                    type="date" 
                    value={formData.dateOfBirth} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleFormChange} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input 
                      id="country" 
                      name="country" 
                      value={formData.country} 
                      onChange={handleFormChange} 
                      required 
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Informations d'identité</h2>
                  <p className="text-muted-foreground mb-6">
                    Choisissez le type de document que vous souhaitez utiliser pour la vérification.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="national_id"
                      name="idType"
                      value="national_id"
                      className="h-5 w-5 text-primary"
                      checked={idType === 'national_id'}
                      onChange={() => setIdType('national_id')}
                    />
                    <Label htmlFor="national_id" className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Carte d'identité nationale
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="passport"
                      name="idType"
                      value="passport"
                      className="h-5 w-5 text-primary"
                      checked={idType === 'passport'}
                      onChange={() => setIdType('passport')}
                    />
                    <Label htmlFor="passport" className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Passeport
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="driver_license"
                      name="idType"
                      value="driver_license"
                      className="h-5 w-5 text-primary"
                      checked={idType === 'driver_license'}
                      onChange={() => setIdType('driver_license')}
                    />
                    <Label htmlFor="driver_license" className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Permis de conduire
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label htmlFor="idNumber">Numéro du document</Label>
                  <Input 
                    id="idNumber" 
                    name="idNumber" 
                    value={formData.idNumber} 
                    onChange={handleFormChange} 
                    required 
                    placeholder={
                      idType === 'passport' 
                        ? 'Ex: AB1234567' 
                        : idType === 'driver_license' 
                          ? 'Ex: 123456789' 
                          : 'Ex: 0123456789'
                    }
                  />
                </div>
              </div>
            )}
            
            {activeStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Téléchargement des documents</h2>
                  <p className="text-muted-foreground mb-6">
                    Veuillez télécharger les documents suivants pour compléter la vérification.
                  </p>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <p className="font-medium mb-2">Recto de votre pièce d'identité</p>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${previews.idFront ? 'border-primary' : 'border-muted'}`}
                      onClick={() => idFrontRef.current?.click()}
                    >
                      {previews.idFront ? (
                        <div className="relative w-full">
                          <img 
                            src={previews.idFront} 
                            alt="ID Front" 
                            className="mx-auto max-h-48 object-contain"
                          />
                          <button 
                            className="absolute top-2 right-2 bg-white rounded-full p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles({...files, idFront: null});
                              setPreviews({...previews, idFront: null});
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                          <p className="text-sm font-medium mb-1">Cliquez pour télécharger</p>
                          <p className="text-xs text-muted-foreground">
                            Formats acceptés: JPG, PNG, PDF (max 5MB)
                          </p>
                        </>
                      )}
                      <input
                        ref={idFrontRef}
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'idFront')}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Verso de votre pièce d'identité</p>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${previews.idBack ? 'border-primary' : 'border-muted'}`}
                      onClick={() => idBackRef.current?.click()}
                    >
                      {previews.idBack ? (
                        <div className="relative w-full">
                          <img 
                            src={previews.idBack} 
                            alt="ID Back" 
                            className="mx-auto max-h-48 object-contain"
                          />
                          <button 
                            className="absolute top-2 right-2 bg-white rounded-full p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles({...files, idBack: null});
                              setPreviews({...previews, idBack: null});
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                          <p className="text-sm font-medium mb-1">Cliquez pour télécharger</p>
                          <p className="text-xs text-muted-foreground">
                            Formats acceptés: JPG, PNG, PDF (max 5MB)
                          </p>
                        </>
                      )}
                      <input
                        ref={idBackRef}
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'idBack')}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Selfie avec votre pièce d'identité</p>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${previews.selfie ? 'border-primary' : 'border-muted'}`}
                      onClick={() => selfieRef.current?.click()}
                    >
                      {previews.selfie ? (
                        <div className="relative w-full">
                          <img 
                            src={previews.selfie} 
                            alt="Selfie" 
                            className="mx-auto max-h-48 object-contain"
                          />
                          <button 
                            className="absolute top-2 right-2 bg-white rounded-full p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles({...files, selfie: null});
                              setPreviews({...previews, selfie: null});
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <User className="h-10 w-10 text-muted-foreground mb-4" />
                          <p className="text-sm font-medium mb-1">Cliquez pour télécharger</p>
                          <p className="text-xs text-muted-foreground">
                            Prenez une photo de vous tenant votre pièce d'identité
                          </p>
                        </>
                      )}
                      <input
                        ref={selfieRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'selfie')}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    En soumettant ces documents, vous consentez à notre traitement de vos informations personnelles
                    conformément à notre politique de confidentialité.
                  </p>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleSubmit} 
                    disabled={!files.idFront || !files.idBack || !files.selfie || uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Téléchargement en cours...
                      </>
                    ) : (
                      'Soumettre pour vérification'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between">
            {activeStep > 1 ? (
              <Button variant="outline" onClick={prevStep}>
                Précédent
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Annuler
              </Button>
            )}
            
            {activeStep < 3 && (
              <Button onClick={nextStep}>
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default KycVerification;
