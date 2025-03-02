
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Building, CheckCircle, XCircle, Clock, BarChart, UserCog, Wrench, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const PropertyAssignments = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('incoming');
  
  const isLandlord = roles.includes('landlord');
  const isManager = roles.includes('manager');
  const isVendor = roles.includes('vendor');
  const isTenant = roles.includes('tenant');
  
  const { data: incomingRequests, isLoading: loadingIncoming, refetch: refetchIncoming } = useQuery({
    queryKey: ['management-requests-incoming', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('management_requests')
        .select(`
          id,
          property_id,
          requester_id,
          recipient_id,
          status,
          commission_percentage,
          message,
          created_at,
          properties(id, title, address, city, main_image_url)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch requester profiles separately
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', request.requester_id)
            .single();
            
          if (profileError) {
            console.error('Error fetching requester profile:', profileError);
            return {
              ...request,
              requester_profile: { first_name: 'Unknown', last_name: 'User' }
            };
          }
          
          return {
            ...request,
            requester_profile: profileData
          };
        })
      );
      
      return requestsWithProfiles || [];
    },
    enabled: !!user
  });
  
  const { data: outgoingRequests, isLoading: loadingOutgoing, refetch: refetchOutgoing } = useQuery({
    queryKey: ['management-requests-outgoing', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('management_requests')
        .select(`
          id,
          property_id,
          requester_id,
          recipient_id,
          status,
          commission_percentage,
          message,
          created_at,
          properties(id, title, address, city, main_image_url)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch recipient profiles separately
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', request.recipient_id)
            .single();
            
          if (profileError) {
            console.error('Error fetching recipient profile:', profileError);
            return {
              ...request,
              recipient_profile: { first_name: 'Unknown', last_name: 'User' }
            };
          }
          
          return {
            ...request,
            recipient_profile: profileData
          };
        })
      );
      
      return requestsWithProfiles || [];
    },
    enabled: !!user
  });
  
  const { data: managedProperties, isLoading: loadingManaged } = useQuery({
    queryKey: ['managed-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('property_managers')
        .select(`
          id,
          property_id,
          manager_id,
          assigned_at,
          properties(id, title, address, city, main_image_url, owner_id)
        `)
        .eq('manager_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isManager
  });
  
  // New query for maintenance requests
  const { data: maintenanceRequests, isLoading: loadingMaintenance, refetch: refetchMaintenance } = useQuery({
    queryKey: ['maintenance-requests', user?.id, roles],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('maintenance_requests')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          created_at,
          property_id,
          tenant_id,
          assigned_to,
          needs_approval,
          properties(id, title, address, city, main_image_url, owner_id),
          profiles!maintenance_requests_tenant_id_fkey(first_name, last_name)
        `);
      
      if (isTenant) {
        query = query.eq('tenant_id', user.id);
      } else if (isVendor) {
        query = query.eq('assigned_to', user.id);
      } else if (isLandlord) {
        // For landlords, get requests for properties they own
        const { data: ownedProperties, error: propError } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user.id);
        
        if (propError) throw propError;
        
        if (ownedProperties && ownedProperties.length > 0) {
          const propertyIds = ownedProperties.map(p => p.id);
          query = query.in('property_id', propertyIds);
        } else {
          return [];
        }
      } else if (isManager) {
        // For managers, get requests for properties they manage
        const { data: managedProps, error: manageError } = await supabase
          .from('property_managers')
          .select('property_id')
          .eq('manager_id', user.id);
        
        if (manageError) throw manageError;
        
        if (managedProps && managedProps.length > 0) {
          const propertyIds = managedProps.map(p => p.property_id);
          query = query.in('property_id', propertyIds);
        } else {
          return [];
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch vendor profiles if assigned
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          if (request.assigned_to) {
            const { data: vendorData, error: vendorError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', request.assigned_to)
              .single();
              
            if (!vendorError && vendorData) {
              return {
                ...request,
                assigned_to_profile: vendorData
              };
            }
          }
          
          return request;
        })
      );
      
      return requestsWithProfiles || [];
    },
    enabled: !!user
  });
  
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const request = incomingRequests?.find(r => r.id === requestId);
      if (!request) return;
      
      // Update request status
      await supabase
        .from('management_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);
      
      // Create property manager relationship
      await supabase
        .from('property_managers')
        .upsert({
          property_id: request.property_id,
          manager_id: user?.id,
        });
      
      toast({
        title: 'Demande acceptée',
        description: 'Vous avez accepté la demande de gestion.',
      });
      
      refetchIncoming();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec de l\'acceptation de la demande. Veuillez réessayer.',
      });
    }
  };
  
  const handleRejectRequest = async (requestId: string) => {
    try {
      await supabase
        .from('management_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      
      toast({
        title: 'Demande rejetée',
        description: 'Vous avez rejeté la demande de gestion.',
      });
      
      refetchIncoming();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec du rejet de la demande. Veuillez réessayer.',
      });
    }
  };

  // Handle maintenance request actions
  const handleApproveMaintenanceRequest = async (requestId: string) => {
    try {
      await supabase
        .from('maintenance_requests')
        .update({ 
          needs_approval: false,
          status: 'in_progress'
        })
        .eq('id', requestId);
      
      toast({
        title: 'Demande approuvée',
        description: 'La demande de maintenance a été approuvée.',
      });
      
      refetchMaintenance();
    } catch (error) {
      console.error('Error approving maintenance request:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec de l\'approbation de la demande. Veuillez réessayer.',
      });
    }
  };
  
  const handleRejectMaintenanceRequest = async (requestId: string) => {
    try {
      await supabase
        .from('maintenance_requests')
        .update({ 
          needs_approval: false,
          status: 'cancelled',
          assigned_to: null
        })
        .eq('id', requestId);
      
      toast({
        title: 'Demande rejetée',
        description: 'La demande de maintenance a été rejetée.',
      });
      
      refetchMaintenance();
    } catch (error) {
      console.error('Error rejecting maintenance request:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec du rejet de la demande. Veuillez réessayer.',
      });
    }
  };
  
  const handleAcceptMaintenanceJob = async (requestId: string) => {
    try {
      await supabase
        .from('maintenance_requests')
        .update({ 
          status: 'in_progress'
        })
        .eq('id', requestId);
      
      toast({
        title: 'Travail accepté',
        description: 'Vous avez accepté ce travail de maintenance.',
      });
      
      refetchMaintenance();
    } catch (error) {
      console.error('Error accepting maintenance job:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec de l\'acceptation du travail. Veuillez réessayer.',
      });
    }
  };
  
  const handleRejectMaintenanceJob = async (requestId: string) => {
    try {
      await supabase
        .from('maintenance_requests')
        .update({ 
          status: 'pending',
          assigned_to: null
        })
        .eq('id', requestId);
      
      toast({
        title: 'Travail rejeté',
        description: 'Vous avez rejeté ce travail de maintenance.',
      });
      
      refetchMaintenance();
    } catch (error) {
      console.error('Error rejecting maintenance job:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec du rejet du travail. Veuillez réessayer.',
      });
    }
  };
  
  const handleCompleteMaintenanceJob = async (requestId: string) => {
    try {
      await supabase
        .from('maintenance_requests')
        .update({ 
          status: 'completed',
          resolved_date: new Date().toISOString()
        })
        .eq('id', requestId);
      
      toast({
        title: 'Travail terminé',
        description: 'Vous avez marqué ce travail comme terminé.',
      });
      
      refetchMaintenance();
    } catch (error) {
      console.error('Error completing maintenance job:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec de la complétion du travail. Veuillez réessayer.',
      });
    }
  };
  
  const isLoading = loadingIncoming || loadingOutgoing || loadingManaged || loadingMaintenance;
  
  const renderMaintenanceTab = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!maintenanceRequests || maintenanceRequests.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Aucune demande de maintenance
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {maintenanceRequests.map((request) => (
          <div key={request.id} className="border rounded-lg p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{request.title}</h3>
                  <Badge variant={
                    request.status === 'pending' ? 'outline' :
                    request.status === 'in_progress' ? 'default' :
                    request.status === 'completed' ? 'secondary' :
                    'destructive'
                  }>
                    {request.status === 'in_progress' ? 'En cours' : 
                     request.status === 'completed' ? 'Terminé' :
                     request.status === 'cancelled' ? 'Annulé' : 'En attente'}
                  </Badge>
                  {request.needs_approval && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Approbation requise
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {request.properties.address}, {request.properties.city}
                </p>
                
                <div className="flex items-center gap-2 mb-2">
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Demandé par: {request.profiles.first_name} {request.profiles.last_name}
                  </span>
                </div>
                
                {request.assigned_to && request.assigned_to_profile && (
                  <div className="flex items-center gap-2 mb-2">
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Assigné à: {request.assigned_to_profile.first_name} {request.assigned_to_profile.last_name}
                    </span>
                  </div>
                )}
                
                <div className="mt-2">
                  <p className="text-sm">{request.description}</p>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  Demandé {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 self-end">
                {/* Landlord/Manager approval buttons for direct-to-vendor requests */}
                {(isLandlord || isManager) && request.needs_approval && (
                  <>
                    <Button size="sm" onClick={() => handleApproveMaintenanceRequest(request.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approuver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRejectMaintenanceRequest(request.id)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeter
                    </Button>
                  </>
                )}
                
                {/* Vendor action buttons */}
                {isVendor && request.assigned_to === user?.id && (
                  <>
                    {request.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleAcceptMaintenanceJob(request.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accepter
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectMaintenanceJob(request.id)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    
                    {request.status === 'in_progress' && (
                      <Button size="sm" onClick={() => handleCompleteMaintenanceJob(request.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Marquer comme terminé
                      </Button>
                    )}
                    
                    {request.status === 'in_progress' && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/messages?request=${request.id}`)}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Messages
                      </Button>
                    )}
                  </>
                )}
                
                {/* Tenant view message button - only if request is accepted and in progress */}
                {isTenant && request.status === 'in_progress' && !request.needs_approval && (
                  <Button size="sm" variant="outline" onClick={() => navigate(`/messages?request=${request.id}`)}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Messages
                  </Button>
                )}
                
                {/* View details button for all roles */}
                <Button size="sm" variant="outline" onClick={() => navigate(`/maintenance/${request.id}`)}>
                  Voir les détails
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Define tabs based on user role
  const getTabs = () => {
    if (isVendor) {
      return [
        {value: 'maintenance', label: 'Demandes de Maintenance'}
      ];
    }
    
    if (isTenant) {
      return [
        {value: 'maintenance', label: 'Mes Demandes de Maintenance'}
      ];
    }
    
    // For landlords and property managers
    return [
      {value: 'incoming', label: 'Demandes Entrantes'},
      {value: 'outgoing', label: 'Demandes Sortantes'},
      {value: 'managed', label: 'Propriétés Gérées'},
      {value: 'maintenance', label: 'Demandes de Maintenance'}
    ];
  };
  
  const currentTabs = getTabs();
  const defaultTab = currentTabs[0]?.value || 'incoming';
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Propriétés</h1>
            <p className="text-muted-foreground">Gérez vos assignations et demandes de propriétés</p>
          </div>
          
          {isTenant && (
            <Button
              onClick={() => navigate('/maintenance/new')}
              className="mt-4 md:mt-0"
            >
              <Wrench className="mr-2 h-4 w-4" />
              Nouvelle Demande de Maintenance
            </Button>
          )}
        </div>
        
        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid grid-cols-${currentTabs.length}`}>
            {currentTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                {tab.value === 'incoming' && incomingRequests?.filter(r => r.status === 'pending').length > 0 && (
                  <Badge variant="default" className="ml-2">
                    {incomingRequests.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
                {tab.value === 'maintenance' && maintenanceRequests?.filter(r => r.needs_approval).length > 0 && (isLandlord || isManager) && (
                  <Badge variant="default" className="ml-2">
                    {maintenanceRequests.filter(r => r.needs_approval).length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {(isLandlord || isManager) && (
            <>
              <TabsContent value="incoming" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Demandes de Gestion Entrantes</CardTitle>
                    <CardDescription>
                      Demandes des agents et des gestionnaires immobiliers qui souhaitent gérer vos propriétés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : incomingRequests?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucune demande de gestion entrante
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {incomingRequests?.map((request) => (
                          <div key={request.id} className="border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building className="h-4 w-4 text-primary" />
                                  <h3 className="font-semibold">{request.properties.title}</h3>
                                  <Badge variant={
                                    request.status === 'pending' ? 'outline' :
                                    request.status === 'accepted' ? 'default' : 'secondary'
                                  }>
                                    {request.status === 'pending' ? 'En attente' : 
                                     request.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {request.properties.address}, {request.properties.city}
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                  <UserCog className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    Demande de: {request.requester_profile.first_name} {request.requester_profile.last_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <BarChart className="h-4 w-4 text-muted-foreground" />
                                  <span>Commission: {request.commission_percentage}%</span>
                                </div>
                                {request.message && (
                                  <div className="mt-2">
                                    <p className="text-sm italic">"{request.message}"</p>
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-2">
                                  Demandé {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                </div>
                              </div>
                              
                              {request.status === 'pending' && (
                                <div className="flex gap-2 self-end">
                                  <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accepter
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Rejeter
                                  </Button>
                                </div>
                              )}
                              
                              {request.status === 'accepted' && (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Acceptée</span>
                                </div>
                              )}
                              
                              {request.status === 'rejected' && (
                                <div className="flex items-center gap-2 text-red-600">
                                  <XCircle className="h-4 w-4" />
                                  <span>Rejetée</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="outgoing" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Demandes de Gestion Sortantes</CardTitle>
                    <CardDescription>
                      Demandes que vous avez envoyées pour gérer des propriétés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : outgoingRequests?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucune demande de gestion sortante
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {outgoingRequests?.map((request) => (
                          <div 
                            key={request.id} 
                            className={`border rounded-lg p-4 ${
                              request.status === 'pending' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20' :
                              request.status === 'accepted' ? 'border-green-300 bg-green-50 dark:bg-green-950/20' :
                              'border-red-300 bg-red-50 dark:bg-red-950/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Building className="h-4 w-4 text-primary" />
                                  <h3 className="font-semibold">{request.properties.title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {request.properties.address}, {request.properties.city}
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                  <span>Envoyé à: {request.recipient_profile.first_name} {request.recipient_profile.last_name}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <BarChart className="h-4 w-4 text-muted-foreground" />
                                  <span>Commission: {request.commission_percentage}%</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                  Envoyé {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                </div>
                              </div>
                              
                              <div>
                                {request.status === 'pending' && (
                                  <div className="flex items-center gap-2 text-yellow-600">
                                    <Clock className="h-4 w-4" />
                                    <span>En attente</span>
                                  </div>
                                )}
                                
                                {request.status === 'accepted' && (
                                  <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Acceptée</span>
                                  </div>
                                )}
                                
                                {request.status === 'rejected' && (
                                  <div className="flex items-center gap-2 text-red-600">
                                    <XCircle className="h-4 w-4" />
                                    <span>Rejetée</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="managed" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Propriétés Gérées</CardTitle>
                    <CardDescription>
                      Propriétés que vous gérez actuellement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : managedProperties?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Vous ne gérez aucune propriété pour le moment
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {managedProperties?.map((item) => (
                          <div key={item.id} className="border rounded-lg overflow-hidden">
                            <div className="h-40 bg-muted">
                              {item.properties.main_image_url ? (
                                <img 
                                  src={item.properties.main_image_url} 
                                  alt={item.properties.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Building className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold">{item.properties.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {item.properties.address}, {item.properties.city}
                              </p>
                              <div className="mt-4">
                                <Button 
                                  size="sm" 
                                  onClick={() => navigate(`/property/${item.property_id}`)}
                                >
                                  Voir la Propriété
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
          
          <TabsContent value="maintenance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Demandes de Maintenance</CardTitle>
                <CardDescription>
                  {isTenant 
                    ? "Demandes de maintenance que vous avez soumises"
                    : isVendor 
                      ? "Demandes de maintenance qui vous sont assignées"
                      : "Demandes de maintenance pour vos propriétés"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderMaintenanceTab()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PropertyAssignments;
