
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import KycRequirementCard from '@/components/kyc/KycRequirementCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const KycVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('identity');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(null);
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  const handleIdentityUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    setIdentityFile(file);
  };

  const handleAddressUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    setProofOfAddressFile(file);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Non authentifié",
        description: "Vous devez être connecté pour soumettre la vérification KYC.",
        variant: "destructive",
      });
      return;
    }

    if (!identityFile || !proofOfAddressFile) {
      toast({
        title: "Fichiers manquants",
        description: "Veuillez télécharger à la fois une pièce d'identité et un justificatif de domicile.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload identity file
      const identityFileExt = identityFile.name.split('.').pop();
      const identityFileName = `identity_${user.id}_${Date.now()}.${identityFileExt}`;
      const { error: identityError } = await supabase.storage
        .from('kyc')
        .upload(identityFileName, identityFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (identityError) {
        throw new Error(`Erreur lors du téléchargement de la pièce d'identité: ${identityError.message}`);
      }

      // Upload proof of address file
      const addressFileExt = proofOfAddressFile.name.split('.').pop();
      const addressFileName = `address_${user.id}_${Date.now()}.${addressFileExt}`;
      const { error: addressError } = await supabase.storage
        .from('kyc')
        .upload(addressFileName, proofOfAddressFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (addressError) {
        throw new Error(`Erreur lors du téléchargement du justificatif de domicile: ${addressError.message}`);
      }

      // Save KYC verification request
      const { error: dbError } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: user.id,
          id_type: 'passport', // Default value or add a selector in the UI
          id_number: 'ID-' + Math.random().toString(36).substring(2, 10).toUpperCase(), // This should be user-provided
          id_image_url: identityFileName,
          address_proof_url: addressFileName,
          status: 'pending',
        });

      if (dbError) {
        throw new Error(`Erreur lors de la sauvegarde de la demande KYC: ${dbError.message}`);
      }

      setKycStatus('pending');
      toast({
        title: "Demande soumise",
        description: "Votre demande de vérification KYC a été soumise avec succès et est en attente d'approbation.",
      });
      navigate('/profile');

    } catch (error: any) {
      console.error("KYC Verification Error:", error);
      toast({
        title: "Erreur de soumission",
        description: error.message || "Une erreur s'est produite lors de la soumission de votre demande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Vérification KYC</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Soumettre votre vérification KYC</CardTitle>
            <CardDescription>
              Veuillez soumettre les documents requis pour vérifier votre identité.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="identity">Pièce d'identité</TabsTrigger>
                <TabsTrigger value="address">Justificatif de domicile</TabsTrigger>
              </TabsList>
              <TabsContent value="identity">
                <KycRequirementCard
                  title="Pièce d'identité"
                  description="Veuillez télécharger une copie claire de votre pièce d'identité (carte d'identité, passeport, permis de conduire)."
                  onUpload={handleIdentityUpload}
                  fileName={identityFile?.name}
                />
              </TabsContent>
              <TabsContent value="address">
                <KycRequirementCard
                  title="Justificatif de domicile"
                  description="Veuillez télécharger une copie d'un justificatif de domicile récent (facture d'électricité, facture d'eau, relevé bancaire)."
                  onUpload={handleAddressUpload}
                  fileName={proofOfAddressFile?.name}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Soumettre la vérification'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default KycVerification;
