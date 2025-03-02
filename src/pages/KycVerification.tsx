import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Shield, Check, AlertTriangle, Info } from 'lucide-react';

type IdType = 'national_id' | 'passport' | 'driver_license';

interface KycFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  idType: IdType;
  idNumber: string;
}

const KycVerification = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<KycFormData>({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    idType: 'national_id',
    idNumber: '',
  });
  
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'rejected' | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const checkKycStatus = async () => {
    if (!user) return;
    
    setLoadingStatus(true);
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('status')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setKycStatus(data.status);
      } else {
        setKycStatus(null);
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check verification status.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }
    
    setIdDocument(file);
    setDocumentPreview(URL.createObjectURL(file));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !idDocument) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields and upload your ID document.',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const fileExt = idDocument.name.split('.').pop();
      const fileName = `${user.id}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `kyc/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(filePath, idDocument);
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrl } = supabase.storage
        .from('kyc_documents')
        .getPublicUrl(filePath);
      
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
          id_type: formData.idType,
          id_number: formData.idNumber,
          id_document_url: publicUrl.publicUrl,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      toast({
        title: 'Verification submitted',
        description: 'Your verification details have been submitted successfully.',
      });
      
      setKycStatus('pending');
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  useState(() => {
    checkKycStatus();
  }, [user]);

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Vérification d'identité (KYC)</h1>
        </div>

        {loadingStatus ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : kycStatus ? (
          <KycStatusCard status={kycStatus} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Pourquoi vérifier votre identité ?</CardTitle>
                  <CardDescription>
                    La vérification d'identité permet de sécuriser notre plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Sécurité renforcée</h3>
                      <p className="text-sm text-muted-foreground">
                        La vérification d'identité permet de lutter contre la fraude et les faux comptes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Accès à toutes les fonctionnalités</h3>
                      <p className="text-sm text-muted-foreground">
                        Certaines fonctionnalités nécessitent une vérification d'identité.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Confidentialité garantie</h3>
                      <p className="text-sm text-muted-foreground">
                        Vos informations sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Formulaire de vérification</CardTitle>
                  <CardDescription>
                    Veuillez remplir tous les champs ci-dessous pour compléter votre vérification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="font-semibold text-lg">Informations personnelles</h3>
                    
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
                      <Label htmlFor="dateOfBirth">Date de naissance</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <Separator />
                    
                    <h3 className="font-semibold text-lg">Adresse</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse complète</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Pays</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <h3 className="font-semibold text-lg">Pièce d'identité</h3>
                    
                    <div className="space-y-2">
                      <Label>Type de pièce d'identité</Label>
                      <Select 
                        value={formData.idType} 
                        onValueChange={(value) => handleSelectChange('idType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un type de pièce d'identité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national_id">Carte d'identité nationale</SelectItem>
                          <SelectItem value="passport">Passeport</SelectItem>
                          <SelectItem value="driver_license">Permis de conduire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">Numéro de pièce d'identité</Label>
                      <Input
                        id="idNumber"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Document d'identité (recto-verso)</Label>
                      <div
                        className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center ${
                          documentPreview ? 'border-gray-200' : 'border-gray-300 hover:border-primary cursor-pointer'
                        }`}
                        onClick={() => !documentPreview && fileInputRef.current?.click()}
                      >
                        {documentPreview ? (
                          <div className="space-y-4 w-full">
                            <img
                              src={documentPreview}
                              alt="ID Preview"
                              className="max-h-48 mx-auto rounded-md"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                            >
                              Changer d'image
                            </Button>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-sm font-medium">Cliquez pour télécharger</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG ou PDF (max 5MB)
                            </p>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,application/pdf"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-md p-4 text-sm">
                      <p className="font-medium mb-2">
                        <AlertTriangle className="h-4 w-4 inline-block mr-1 text-amber-500" /> Important
                      </p>
                      <p className="text-muted-foreground">
                        Veuillez vous assurer que toutes les informations fournies sont correctes et correspondent à votre pièce d'identité.
                        Des informations incorrectes pourraient entraîner un refus de votre vérification.
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={submitting || !idDocument}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Soumission en cours...
                        </>
                      ) : (
                        'Soumettre ma vérification'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

interface KycStatusCardProps {
  status: 'pending' | 'verified' | 'rejected';
}

const KycStatusCard = ({ status }: KycStatusCardProps) => {
  const statusConfig = {
    pending: {
      title: 'Vérification en cours',
      description: 'Votre demande de vérification est en cours de traitement. Cela peut prendre jusqu'à 48 heures ouvrables.',
      icon: <Loader2 className="h-12 w-12 text-primary animate-spin" />,
      color: 'bg-primary/10 text-primary',
    },
    verified: {
      title: 'Vérification réussie',
      description: 'Votre identité a été vérifiée avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.',
      icon: <Check className="h-12 w-12 text-green-500" />,
      color: 'bg-green-100 text-green-700',
    },
    rejected: {
      title: 'Vérification refusée',
      description: 'Votre demande de vérification a été refusée. Veuillez contacter notre service client pour plus d'informations.',
      icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
      color: 'bg-red-100 text-red-700',
    },
  };

  const config = statusConfig[status];

  return (
    <Card>
      <CardContent className="p-6 md:p-10">
        <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
          <div className={`p-4 rounded-full ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
          {status === 'pending' && (
            <div className="w-full max-w-xs bg-muted h-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse w-1/2"></div>
            </div>
          )}
          {status === 'rejected' && (
            <Button>Contacter le support</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KycVerification;
