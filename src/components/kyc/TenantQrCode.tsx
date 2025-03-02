
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TenantQrCodeProps {
  userId: string;
  firstName: string;
  lastName: string;
}

const TenantQrCode: React.FC<TenantQrCodeProps> = ({ userId, firstName, lastName }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateQrCode();
  }, [userId]);

  const generateQrCode = async () => {
    if (!userId) return;
    
    setIsGenerating(true);
    try {
      // Create a tenant data object with essential information
      const tenantData = {
        userId,
        timestamp: new Date().toISOString(),
        type: 'tenant-verification'
      };
      
      // Convert to JSON string and then to QR code
      const qrData = JSON.stringify(tenantData);
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      setQrDataUrl(dataUrl);
      
      // Store the QR code in Supabase Storage
      const fileName = `tenant-qr-${userId}.png`;
      const fetchResponse = await fetch(dataUrl);
      const blob = await fetchResponse.blob();
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('tenant-qr-codes')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true
        });
        
      if (error) {
        console.error('Error storing QR code:', error);
        toast({
          title: "Erreur",
          description: "Impossible de stocker le code QR. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le code QR. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `tenant-verification-${firstName}-${lastName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Téléchargement réussi",
      description: "Votre code QR a été téléchargé avec succès.",
    });
  };

  const copyQrCode = async () => {
    if (!qrDataUrl) return;
    
    try {
      // For modern browsers
      if (navigator.clipboard && window.ClipboardItem) {
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        toast({
          title: "Copié",
          description: "Code QR copié dans le presse-papier."
        });
      } else {
        // Fallback for browsers that don't support ClipboardItem
        toast({
          title: "Non supporté",
          description: "Votre navigateur ne prend pas en charge cette fonctionnalité. Veuillez télécharger l'image.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Erreur",
        description: "Impossible de copier le code QR. Veuillez télécharger l'image.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Votre Code QR Locataire</CardTitle>
        <CardDescription>
          Présentez ce code QR à votre propriétaire ou gestionnaire immobilier pour être ajouté à une propriété.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {qrDataUrl ? (
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <img src={qrDataUrl} alt="Tenant QR Code" className="mx-auto" />
          </div>
        ) : (
          <div className="w-[300px] h-[300px] bg-muted/30 animate-pulse flex justify-center items-center">
            {isGenerating ? 'Génération en cours...' : 'Code QR non disponible'}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={downloadQrCode}
          disabled={!qrDataUrl || isGenerating}
        >
          <Download className="mr-2 h-4 w-4" />
          Télécharger
        </Button>
        <Button 
          variant="outline" 
          onClick={copyQrCode}
          disabled={!qrDataUrl || isGenerating}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copier
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TenantQrCode;
