
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  size_sqm: number;
  status: string;
  main_image_url: string;
  property_type: string;
}

interface PropertiesTabProps {
  properties: Property[];
}

const PropertiesTab = ({ properties = [] }: PropertiesTabProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Vos propriétés</CardTitle>
          <Button size="sm" onClick={() => navigate('/property-management')}>
            Voir tout
          </Button>
        </div>
        <CardDescription>Dernières propriétés ajoutées</CardDescription>
      </CardHeader>
      <CardContent>
        {!properties || properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
            <Building className="h-8 w-8 mb-2" />
            <p>Aucune propriété ajoutée.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <Card key={property.id} className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{property.title}</CardTitle>
                  <CardDescription>{property.address}, {property.city}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Prix: ${property.price}</p>
                  <p className="text-sm">Type: {property.property_type}</p>
                  <Badge variant="secondary">{property.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertiesTab;
