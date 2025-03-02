
import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TenantQrScannerProps {
  propertyId: string;
  onTenantFound: (userId: string) => void;
}

const TenantQrScanner: React.FC<TenantQrScannerProps> = ({ propertyId, onTenantFound }) => {
  const [scanning, setScanning] = useState(false);
  const [tenantData, setTenantData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleScan = async (result: any) => {
    if (!result || !result.text) return;
    
    try {
      // Parse the QR code data
      const scannedData = JSON.parse(result.text);
      
      // Verify it's a tenant verification QR code
      if (scannedData.type !== 'tenant-verification') {
        toast({
          title: "Code QR invalide",
          description: "Ce n'est pas un code QR de vérification de locataire valide.",
          variant: "destructive"
        });
        return;
      }
      
      setScanning(false);
      setTenantData(scannedData);
      
    } catch (error) {
      console.error('Error parsing QR code:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lire le code QR. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleError = (error: any) => {
    console.error('QR scanner error:', error);
    toast({
      title: "Erreur de numérisation",
      description: "Une erreur s'est produite lors de la numérisation. Veuillez vérifier les autorisations de la caméra.",
      variant: "destructive"
    });
  };

  const verifyAndAssignTenant = async () => {
    if (!tenantData || !tenantData.userId || !propertyId) return;
    
    setIsVerifying(true);
    try {
      // Check if the user exists and has completed KYC
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', tenantData.userId)
        .single();
        
      if (profileError || !profile) {
        toast({
          title: "Utilisateur non trouvé",
          description: "Impossible de trouver l'utilisateur associé à ce code QR.",
          variant: "destructive"
        });
        setIsVerifying(false);
        return;
      }
      
      // Check KYC status
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('status')
        .eq('user_id', tenantData.userId)
        .single();
        
      if (kycError || !kycData || kycData.status !== 'approved') {
        toast({
          title: "KYC non vérifié",
          description: "Cet utilisateur n'a pas complété la vérification KYC.",
          variant: "destructive"
        });
        setIsVerifying(false);
        return;
      }
      
      // Proceed with tenant assignment
      onTenantFound(tenantData.userId);
      
      toast({
        title: "Locataire vérifié",
        description: "Le locataire a été vérifié avec succès et peut maintenant être assigné à la propriété.",
      });
      
    } catch (error) {
      console.error('Error verifying tenant:', error);
      toast({
        title: "Erreur de vérification",
        description: "Une erreur s'est produite lors de la vérification du locataire.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetScanner = () => {
    setTenantData(null);
    setScanning(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scanner le Code QR du Locataire</CardTitle>
        <CardDescription>
          Scannez le code QR du locataire pour l'ajouter à cette propriété.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scanning ? (
          <div className="h-[300px] overflow-hidden rounded-lg">
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              onError={handleError}
              containerStyle={{ height: '100%' }}
              videoStyle={{ height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : tenantData ? (
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center gap-3 text-green-600">
              <UserCheck size={24} />
              <span className="font-medium">Code QR de locataire détecté</span>
            </div>
            <p className="text-sm text-muted-foreground">
              ID Utilisateur: {tenantData.userId}
            </p>
            <p className="text-sm text-muted-foreground">
              Timestamp: {new Date(tenantData.timestamp).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="h-[300px] bg-muted/30 rounded-lg flex flex-col items-center justify-center">
            <UserX size={48} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cliquez sur "Scanner" pour commencer</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        {!scanning && !tenantData ? (
          <Button onClick={() => setScanning(true)}>
            Scanner un code QR
          </Button>
        ) : scanning ? (
          <Button variant="outline" onClick={() => setScanning(false)}>
            Annuler le scan
          </Button>
        ) : tenantData ? (
          <>
            <Button variant="outline" onClick={resetScanner}>
              Scanner un autre code
            </Button>
            <Button 
              onClick={verifyAndAssignTenant}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier et assigner"
              )}
            </Button>
          </>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default TenantQrScanner;
