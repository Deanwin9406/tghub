
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, User, Phone, Mail, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SendManagementRequestForm from '@/components/management/SendManagementRequestForm';

interface PropertyOwnershipInfoProps {
  propertyId: string;
}

const PropertyOwnershipInfo = ({ propertyId }: PropertyOwnershipInfoProps) => {
  const { user, roles } = useAuth();
  const isManager = roles.includes('manager');
  const isAgent = roles.includes('agent');

  const { data, isLoading, error, refetch } = useQuery({
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
      
      // Get management requests for this property 
      const { data: requestData, error: requestError } = await supabase
        .from('management_requests')
        .select('id, requester_id, recipient_id, status, commission_percentage, created_at')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      // Get property manager if assigned
      const { data: propertyManager, error: managerError } = await supabase
        .from('property_managers')
        .select('manager_id')
        .eq('property_id', propertyId)
        .maybeSingle();
          
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
      
      const activeRequest = requestData && requestData.length > 0 ? requestData[0] : null;
      
      // Get user information for requester if there's an active request
      let requesterProfile = null;
      if (activeRequest) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, phone')
          .eq('id', activeRequest.requester_id)
          .single();
          
        if (!profileError) {
          requesterProfile = profile;
        }
      }
      
      return {
        property,
        owner: ownerProfile,
        manager: managerProfile,
        activeRequest,
        requesterProfile
      };
    }
  });
  
  const handleAcceptRequest = async () => {
    if (!data?.activeRequest) return;
    
    try {
      // Update request status
      await supabase
        .from('management_requests')
        .update({ status: 'accepted' })
        .eq('id', data.activeRequest.id);
      
      // Create property manager relationship
      await supabase
        .from('property_managers')
        .upsert({
          property_id: propertyId,
          manager_id: data.activeRequest.requester_id,
        });
      
      refetch();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };
  
  const handleRejectRequest = async () => {
    if (!data?.activeRequest) return;
    
    try {
      await supabase
        .from('management_requests')
        .update({ status: 'rejected' })
        .eq('id', data.activeRequest.id);
      
      refetch();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };
  
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
  
  const { property, owner, manager, activeRequest, requesterProfile } = data;
  const canSendRequest = (isManager || isAgent) && !manager && !activeRequest;
  const isPendingRequest = activeRequest && activeRequest.status === 'pending';
  const isOwnRequest = activeRequest && activeRequest.requester_id === user?.id;
  const isRecipient = activeRequest && activeRequest.recipient_id === user?.id;
  
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

        {isPendingRequest && requesterProfile && (
          <div className="space-y-2 border rounded-md p-4 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pending Management Request
              </h3>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                {isOwnRequest ? 'You Requested' : 'Action Required'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{requesterProfile.first_name} {requesterProfile.last_name} wants to manage this property</span>
              </div>
              {activeRequest.commission_percentage && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Commission: {activeRequest.commission_percentage}%</span>
                </div>
              )}
              
              {isRecipient && (
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={handleAcceptRequest}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRejectRequest}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
              
              {isOwnRequest && (
                <div className="flex gap-2 mt-4">
                  <Badge>Awaiting response</Badge>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeRequest && activeRequest.status === 'accepted' && (
          <div className="rounded-md p-3 bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Management request has been accepted</span>
            </div>
          </div>
        )}
        
        {activeRequest && activeRequest.status === 'rejected' && (
          <div className="rounded-md p-3 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Management request has been rejected</span>
            </div>
          </div>
        )}
        
        {canSendRequest && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2">
                Request to Manage Property
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Request to Manage Property</SheetTitle>
                <SheetDescription>
                  Send a request to the property owner to manage this property.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <SendManagementRequestForm 
                  propertyId={propertyId} 
                  ownerId={property.owner_id} 
                  onSuccess={() => refetch()}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyOwnershipInfo;
