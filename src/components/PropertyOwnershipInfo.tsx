
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, User, Phone, Mail, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface PropertyOwnershipInfoProps {
  propertyId: string;
}

const PropertyOwnershipInfo = ({ propertyId }: PropertyOwnershipInfoProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['property-ownership', propertyId],
    queryFn: async () => {
      // Get property details including owner
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('owner_id, title')
        .eq('id', propertyId)
        .single();
        
      if (propertyError) throw propertyError;
      
      // Get owner profile
      const { data: ownerProfile, error: ownerError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', property.owner_id)
        .single();
        
      if (ownerError) throw ownerError;
      
      // Get property manager if assigned
      const { data: propertyManager, error: managerError } = await supabase
        .from('property_managers')
        .select('manager_id')
        .eq('property_id', propertyId)
        .maybeSingle();
        
      // Even if there's no manager, we don't consider it an error
      
      let managerProfile = null;
      if (propertyManager && propertyManager.manager_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, phone')
          .eq('id', propertyManager.manager_id)
          .single();
          
        if (!profileError) {
          managerProfile = profile;
        }
      }
      
      return {
        property,
        owner: ownerProfile,
        manager: managerProfile
      };
    }
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-1/2" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-3/4" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>
            Could not load property ownership information.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const { property, owner, manager } = data;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Property Contacts
        </CardTitle>
        <CardDescription>
          Contact information for this property
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Property Owner
            </h3>
            <Badge variant="outline">Landlord</Badge>
          </div>
          <div className="bg-muted/40 rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{owner.first_name} {owner.last_name}</span>
            </div>
            {owner.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{owner.email}</span>
              </div>
            )}
            {owner.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{owner.phone}</span>
              </div>
            )}
          </div>
        </div>
        
        {manager && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                Property Manager
              </h3>
              <Badge variant="outline">Manager</Badge>
            </div>
            <div className="bg-muted/40 rounded-md p-3 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{manager.first_name} {manager.last_name}</span>
              </div>
              {manager.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{manager.email}</span>
                </div>
              )}
              {manager.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{manager.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyOwnershipInfo;
