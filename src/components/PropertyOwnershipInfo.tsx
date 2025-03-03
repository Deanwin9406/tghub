
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export interface PropertyOwnershipInfoProps {
  propertyId: string;
}

export const PropertyOwnershipInfo: React.FC<PropertyOwnershipInfoProps> = ({ propertyId }) => {
  const [propertyData, setPropertyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('owner_id, management_status')
          .eq('id', propertyId)
          .single();

        if (error) {
          throw error;
        }

        setPropertyData(data);
      } catch (error: any) {
        console.error('Error fetching property data:', error.message);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer les informations de la propriété',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyId, toast]);

  const SendManagementRequestForm: React.FC<{ propertyId: string; ownerId: string; onSuccess: () => void }> = ({ propertyId, ownerId, onSuccess }) => {
    const [requestDetails, setRequestDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
  
      try {
        // Simulate sending a request to the property owner
        // In a real application, you would send a notification or create a task
        console.log(`Management request sent for property ${propertyId} to owner ${ownerId} with details: ${requestDetails}`);
  
        // Simulate a successful submission
        setTimeout(() => {
          setIsSubmitting(false);
          onSuccess();
        }, 1000);
  
      } catch (error: any) {
        console.error('Error sending management request:', error.message);
        toast({
          title: 'Erreur',
          description: 'Impossible d\'envoyer la demande de gestion',
          variant: 'destructive'
        });
        setIsSubmitting(false);
      }
    };
  
    return (
      <Card className="mt-4">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="requestDetails">Détails de la demande</Label>
              <Textarea
                id="requestDetails"
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                placeholder="Décrivez pourquoi vous avez besoin d'aide pour gérer cette propriété"
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer la demande'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Make sure we pass both propertyId and ownerId to the form
  return (
    <div className="mt-8 border rounded-lg p-6 bg-card">
      <h3 className="text-xl font-semibold mb-4">Gestion de propriété</h3>
      
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : propertyData ? (
        <>
          <div className="mb-4">
            <p>Statut de gestion: {propertyData.management_status || 'Non défini'}</p>
          </div>
          
          {!showRequestForm && (
            <Button onClick={() => setShowRequestForm(true)}>
              Demander de l'aide pour la gestion
            </Button>
          )}
        </>
      ) : (
        <p>Impossible de charger les informations de la propriété.</p>
      )}
      
      {showRequestForm && (
        <SendManagementRequestForm 
          propertyId={propertyId} 
          ownerId={propertyData?.owner_id || ''} 
          onSuccess={() => {
            setShowRequestForm(false);
            toast({
              title: "Demande envoyée",
              description: "Votre demande de gestion a été envoyée avec succès.",
              variant: "default",
            });
          }} 
        />
      )}
    </div>
  );
};
