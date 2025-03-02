
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Building, CheckCircle, XCircle, Clock, BarChart, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const PropertyAssignments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('incoming');
  
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
          manager_id: request.requester_id,
        });
      
      toast({
        title: 'Request accepted',
        description: 'You have accepted the management request.',
      });
      
      refetchIncoming();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept request. Please try again.',
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
        title: 'Request rejected',
        description: 'You have rejected the management request.',
      });
      
      refetchIncoming();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject request. Please try again.',
      });
    }
  };
  
  const isLoading = loadingIncoming || loadingOutgoing || loadingManaged;
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Property Management Assignments</h1>
            <p className="text-muted-foreground">Manage your property assignments and requests</p>
          </div>
        </div>
        
        <Tabs defaultValue="incoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="incoming">
              Incoming Requests
              {incomingRequests?.filter(r => r.status === 'pending').length > 0 && (
                <Badge variant="default" className="ml-2">
                  {incomingRequests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing Requests</TabsTrigger>
            <TabsTrigger value="managed">Managed Properties</TabsTrigger>
          </TabsList>
          
          <TabsContent value="incoming" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Management Requests</CardTitle>
                <CardDescription>
                  Requests from agents and property managers who want to manage your properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : incomingRequests?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No incoming management requests
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
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {request.properties.address}, {request.properties.city}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <UserCog className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Request from: {request.requester_profile.first_name} {request.requester_profile.last_name}
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
                              Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                            </div>
                          </div>
                          
                          {request.status === 'pending' && (
                            <div className="flex gap-2 self-end">
                              <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          
                          {request.status === 'accepted' && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Accepted</span>
                            </div>
                          )}
                          
                          {request.status === 'rejected' && (
                            <div className="flex items-center gap-2 text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>Rejected</span>
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
                <CardTitle>Outgoing Management Requests</CardTitle>
                <CardDescription>
                  Requests you've sent to manage properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : outgoingRequests?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No outgoing management requests
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
                              <span>Sent to: {request.recipient_profile.first_name} {request.recipient_profile.last_name}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart className="h-4 w-4 text-muted-foreground" />
                              <span>Commission: {request.commission_percentage}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Sent {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                            </div>
                          </div>
                          
                          <div>
                            {request.status === 'pending' && (
                              <div className="flex items-center gap-2 text-yellow-600">
                                <Clock className="h-4 w-4" />
                                <span>Pending</span>
                              </div>
                            )}
                            
                            {request.status === 'accepted' && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>Accepted</span>
                              </div>
                            )}
                            
                            {request.status === 'rejected' && (
                              <div className="flex items-center gap-2 text-red-600">
                                <XCircle className="h-4 w-4" />
                                <span>Rejected</span>
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
                <CardTitle>Managed Properties</CardTitle>
                <CardDescription>
                  Properties you are currently managing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : managedProperties?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    You are not managing any properties yet
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
                              View Property
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default PropertyAssignments;
