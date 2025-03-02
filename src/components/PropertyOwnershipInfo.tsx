
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Phone, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import SendManagementRequestForm from './management/SendManagementRequestForm';

interface PropertyOwnershipInfoProps {
  propertyId: string;
}

const PropertyOwnershipInfo: React.FC<PropertyOwnershipInfoProps> = ({ propertyId }) => {
  const [ownerProfile, setOwnerProfile] = useState<any | null>(null);
  const [contactSheet, setContactSheet] = useState(false);
  const [requestSheet, setRequestSheet] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (propertyId) {
      fetchOwnerDetails();
    }
  }, [propertyId]);
  
  const fetchOwnerDetails = async () => {
    try {
      // First get the property to get owner ID
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', propertyId)
        .single();
      
      if (propertyError) throw propertyError;
      
      // Then get owner profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', property.owner_id)
        .single();
      
      if (profileError) throw profileError;
      
      setOwnerProfile(profile);
      
    } catch (error) {
      console.error('Error fetching owner details:', error);
    }
  };
  
  const handleContactRequest = () => {
    setContactSheet(true);
  };
  
  const handleManagementRequest = () => {
    setRequestSheet(true);
  };
  
  if (!ownerProfile) {
    return (
      <Card className="mb-6 animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarImage src={ownerProfile.avatar_url} alt={`${ownerProfile.first_name} ${ownerProfile.last_name}`} />
              <AvatarFallback>{getInitials(`${ownerProfile.first_name} ${ownerProfile.last_name}`)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{ownerProfile.first_name} {ownerProfile.last_name}</h3>
              <p className="text-sm text-muted-foreground">Propriétaire</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button className="w-full" onClick={handleContactRequest}>
              <Mail className="mr-2 h-4 w-4" />
              Contacter le propriétaire
            </Button>
            
            <Button variant="outline" className="w-full" onClick={handleManagementRequest}>
              <Calendar className="mr-2 h-4 w-4" />
              Demander à gérer cette propriété
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Contact sheet */}
      <Sheet open={contactSheet} onOpenChange={setContactSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Contacter le propriétaire</SheetTitle>
            <SheetDescription>
              Envoyez un message à {ownerProfile.first_name} {ownerProfile.last_name} concernant cette propriété.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            <div className="space-y-4">
              {ownerProfile.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{ownerProfile.phone}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{ownerProfile.email}</span>
              </div>
              
              <div className="border rounded-md p-4 mt-6">
                <h4 className="font-medium mb-2">Envoyer un message</h4>
                <textarea 
                  className="w-full border rounded-md p-2 h-32 mb-2"
                  placeholder="Bonjour, je suis intéressé par votre propriété..."
                ></textarea>
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
          
          <SheetFooter>
            <Button variant="outline" onClick={() => setContactSheet(false)}>Fermer</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Management request sheet */}
      <Sheet open={requestSheet} onOpenChange={setRequestSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Demande de gestion de propriété</SheetTitle>
            <SheetDescription>
              Envoyez une demande pour gérer cette propriété
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            <SendManagementRequestForm 
              propertyId={propertyId} 
              onSuccess={() => {
                setRequestSheet(false);
                toast({
                  title: "Demande envoyée",
                  description: "Votre demande de gestion a été envoyée au propriétaire",
                });
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default PropertyOwnershipInfo;
