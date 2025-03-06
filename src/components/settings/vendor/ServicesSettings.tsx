
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tools, Calendar, Clock, MapPin, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import VendorProfileForm from '@/components/vendor/VendorProfileForm';

const ServicesSettings = () => {
  const { activeRole } = useAuth();

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tools className="mr-2 h-5 w-5" />
            Services professionnels
          </CardTitle>
          <CardDescription>Gérez vos services et informations professionnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <VendorProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détails sur les services</CardTitle>
          <CardDescription>Comment ces informations sont utilisées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Tools className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Services offerts</Label>
                <p className="text-sm text-muted-foreground">
                  Les services que vous proposez apparaîtront dans la recherche et sur votre profil public.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Années d'expérience</Label>
                <p className="text-sm text-muted-foreground">
                  Cela aide les clients à évaluer votre niveau d'expertise dans votre domaine.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Tag className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Taux horaire</Label>
                <p className="text-sm text-muted-foreground">
                  Un taux indicatif qui sera affiché sur votre profil. Vous pourrez personnaliser vos tarifs pour chaque service.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Zone de service</Label>
                <p className="text-sm text-muted-foreground">
                  Définit les zones géographiques où vous êtes disposé à fournir vos services.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Disponibilité</Label>
                <p className="text-sm text-muted-foreground">
                  Indique aux clients si vous acceptez actuellement de nouvelles missions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ServicesSettings;
