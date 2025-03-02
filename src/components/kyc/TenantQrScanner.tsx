
import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface TenantQrScannerProps {
  onTenantFound: (tenant: { userId: string; firstName: string; lastName: string; }) => void;
  propertyId?: string;
}

interface QRData {
  userId: string;
  timestamp: string;
  type: string;
}

const TenantQrScanner: React.FC<TenantQrScannerProps> = ({ onTenantFound, propertyId }) => {
  const [scanning, setScanning] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const { toast } = useToast();

  const handleScan = async (result: any) => {
    if (!result || processing) return;
    
    setProcessing(true);
    setScanning(false);
    
    try {
      // Parse QR code data
      const data = JSON.parse(result.text) as QRData;
      
      // Validate QR data
      if (!data.userId || data.type !== 'tenant-verification') {
        throw new Error('QR code invalide');
      }
      
      // Get tenant profile info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', data.userId)
        .single();
      
      if (profileError || !profile) {
        throw new Error('Impossible de trouver les informations du locataire');
      }
      
      // Check KYC verification status
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('status')
        .eq('user_id', data.userId)
        .single();
      
      if (kycError || !kycData) {
        throw new Error('Locataire sans vérification KYC');
      }
      
      if (kycData.status !== 'approved') {
        throw new Error('La vérification KYC du locataire n\'est pas approuvée');
      }
      
      // If propertyId is provided, associate tenant with property
      if (propertyId) {
        // Check if tenant is already associated with this property
        const { data: existingLease, error: leaseCheckError } = await supabase
          .from('leases')
          .select('id')
          .eq('tenant_id', data.userId)
          .eq('property_id', propertyId)
          .eq('status', 'active')
          .maybeSingle();
        
        if (existingLease) {
          throw new Error('Ce locataire est déjà associé à cette propriété');
        }
        
        // Create a new lease record (or relationship)
        const { error: leaseError } = await supabase
          .from('leases')
          .insert({
            tenant_id: data.userId,
            property_id: propertyId,
            start_date: new Date().toISOString().split('T')[0],
            status: 'active',
            // Set default values for required fields
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            monthly_rent: 0,
            deposit_amount: 0
          });
        
        if (leaseError) {
          console.error('Error creating lease:', leaseError);
          throw new Error('Impossible d\'associer le locataire à la propriété');
        }
      }
      
      // Notify success
      toast({
        title: "Locataire vérifié",
        description: `${profile.first_name} ${profile.last_name} a été identifié avec succès.`,
      });
      
      // Call the callback function with tenant info
      onTenantFound({
        userId: data.userId,
        firstName: profile.first_name,
        lastName: profile.last_name
      });
      
    } catch (error: any) {
      console.error('QR scan error:', error);
      toast({
        title: "Erreur de scanning",
        description: error.message || "Une erreur s'est produite lors du scanning du code QR",
        variant: "destructive"
      });
      setScanning(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleError = (error: any) => {
    console.error('QR scanner error:', error);
    toast({
      title: "Erreur de caméra",
      description: "Impossible d'accéder à la caméra. Veuillez vérifier les permissions.",
      variant: "destructive"
    });
  };

  const restartScan = () => {
    setScanning(true);
    setProcessing(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scanner un Code QR Locataire</CardTitle>
        <CardDescription>
          Scannez le code QR d'un locataire pour vérifier son identité et l'ajouter à une propriété.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scanning ? (
          <div className="relative rounded-lg overflow-hidden">
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              containerStyle={{ height: '300px' }}
              videoStyle={{ height: '300px', objectFit: 'cover' }}
              scanDelay={500}
            />
          </div>
        ) : (
          <div className="h-[300px] bg-muted/20 rounded-lg flex items-center justify-center">
            {processing ? (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Vérification en cours...</p>
              </div>
            ) : (
              <p>Scanner terminé</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {!scanning && (
          <Button onClick={restartScan} disabled={processing}>
            Scanner à nouveau
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TenantQrScanner;
