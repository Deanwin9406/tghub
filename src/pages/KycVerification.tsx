
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import KycRequirementCard from '@/components/kyc/KycRequirementCard';
import TenantQrCode from '@/components/kyc/TenantQrCode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const KycVerification = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('identity');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(null);
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  useEffect(() => {
    if (user) {
      checkKycStatus();
    }
  }, [user]);

  const checkKycStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('status')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching KYC status:", error);
        setKycStatus(null);
        return;
      }

      setKycStatus(data?.status || null);
    } catch (error) {
      console.error("Error checking KYC status:", error);
      setKycStatus(null);
    }
  };

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
      
      // For demo purposes, automatically approve KYC
      // In a real app, this would be handled by an admin
      await autoApproveKycForDemo(user.id);
      
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
  
  // This is for demo purposes only - in a real app, KYC would be reviewed by an admin
  const autoApproveKycForDemo = async (userId: string) => {
    try {
      // Wait 3 seconds to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const { error } = await supabase
        .from('kyc_verifications')
        .update({ status: 'approved' })
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error auto-approving KYC:", error);
        return;
      }
      
      setKycStatus('approved');
      toast({
        title: "KYC approuvée",
        description: "Votre vérification KYC a été approuvée! Vous pouvez maintenant utiliser votre code QR de locataire.",
      });
      
    } catch (error) {
      console.error("Error in auto-approve KYC:", error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Vérification KYC</h1>
        </div>

        {kycStatus === 'approved' ? (
          <div className="space-y-8">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <CardTitle>Vérification KYC approuvée</CardTitle>
                </div>
                <CardDescription>
                  Votre identité a été vérifiée avec succès. Vous pouvez maintenant utiliser le code QR ci-dessous pour être ajouté à une propriété.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <TenantQrCode 
              userId={user?.id || ''} 
              firstName={profile?.first_name || ''} 
              lastName={profile?.last_name || ''} 
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Comment utiliser votre code QR de locataire</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-3">
                  <li>Téléchargez ou enregistrez votre code QR</li>
                  <li>Présentez ce code QR à votre propriétaire ou gestionnaire immobilier</li>
                  <li>Ils scanneront ce code pour vous ajouter à leur propriété</li>
                  <li>Une fois ajouté, vous aurez accès aux informations de la propriété et aux fonctionnalités de locataire</li>
                </ol>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  Retour au profil
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : kycStatus === 'pending' ? (
          <Card>
            <CardHeader>
              <CardTitle>Demande en cours de traitement</CardTitle>
              <CardDescription>
                Votre demande de vérification KYC est en cours d'examen. Nous vous notifierons dès qu'elle sera traitée.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Traitement en cours...</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                Retour au profil
              </Button>
            </CardFooter>
          </Card>
        ) : (
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
        )}
      </div>
    </Layout>
  );
};

export default KycVerification;
