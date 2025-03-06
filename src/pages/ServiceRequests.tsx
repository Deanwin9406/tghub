
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageSquare 
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  budget: number | null;
  created_at: string;
  updated_at: string;
  requester_id: string;
  property_id: string | null;
  requester?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  property?: {
    title: string;
    address: string;
  };
  proposals?: ServiceProposal[];
  proposal_count?: number;
}

interface ServiceProposal {
  id: string;
  price: number;
  estimated_days: number;
  message: string;
  status: string;
  vendor_id: string;
  request_id: string;
  created_at: string;
  vendor?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

const ServiceRequests = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const isVendor = roles.includes('vendor');

  useEffect(() => {
    if (user) {
      fetchServiceRequests();
    }
  }, [user, activeTab]);

  const fetchServiceRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          requester:requester_id(first_name, last_name, email),
          property:property_id(title, address),
          proposals:service_proposals(*)
        `);

      // Filter based on user role and active tab
      if (isVendor) {
        // For vendors, show open requests or ones they've responded to
        if (activeTab === 'mine') {
          // Get requests they've proposed on
          const { data: proposalIds } = await supabase
            .from('service_proposals')
            .select('request_id')
            .eq('vendor_id', user!.id);

          const requestIds = proposalIds?.map(p => p.request_id) || [];
          
          query = query.in('id', requestIds);
        } else if (activeTab !== 'all') {
          // Filter by status
          query = query.eq('status', activeTab);
        }
      } else {
        // For regular users, only show their requests
        query = query.eq('requester_id', user!.id);
        
        if (activeTab !== 'all') {
          // Filter by status
          query = query.eq('status', activeTab);
        }
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Add proposal count and process proposals for each request
      const processedRequests = data?.map(request => {
        const proposals = request.proposals || [];
        return {
          ...request,
          proposal_count: proposals.length,
          proposals: proposals.map((proposal: any) => ({
            ...proposal,
            // We'll fetch vendor details separately
          }))
        };
      }) || [];

      // Fetch vendor details for proposals if needed
      if (processedRequests.length > 0) {
        const requests_with_proposals = processedRequests.filter(r => r.proposal_count > 0);
        
        for (const request of requests_with_proposals) {
          const vendorIds = request.proposals.map((p: any) => p.vendor_id);
          
          const { data: vendors } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .in('id', vendorIds);
            
          if (vendors) {
            // Map vendor details to proposals
            request.proposals = request.proposals.map((proposal: any) => {
              const vendor = vendors.find(v => v.id === proposal.vendor_id);
              return {
                ...proposal,
                vendor
              };
            });
          }
        }
      }

      setRequests(processedRequests);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load service requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProposalAction = async (proposalId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('service_proposals')
        .update({ status })
        .eq('id', proposalId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Proposal ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`,
      });

      // If accepted, update request status
      if (status === 'accepted') {
        const proposal = requests
          .flatMap(r => r.proposals || [])
          .find(p => p.id === proposalId);
          
        if (proposal) {
          await supabase
            .from('service_requests')
            .update({ status: 'in_progress' })
            .eq('id', proposal.request_id);
        }
      }

      // Refresh data
      fetchServiceRequests();
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update proposal status',
        variant: 'destructive',
      });
    }
  };

  const renderProposals = (request: ServiceRequest) => {
    if (!request.proposals || request.proposals.length === 0) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">No proposals yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {request.proposals.map((proposal) => (
          <div key={proposal.id} className="border rounded-md p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">
                  {proposal.vendor?.first_name} {proposal.vendor?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{proposal.vendor?.email}</p>
              </div>
              <Badge>{proposal.status}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Price:</span>{' '}
                {proposal.price.toLocaleString()} XOF
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Estimated time:</span>{' '}
                {proposal.estimated_days} day{proposal.estimated_days !== 1 ? 's' : ''}
              </div>
            </div>
            
            <p className="text-sm mb-4">{proposal.message}</p>
            
            {!isVendor && proposal.status === 'pending' && (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProposalAction(proposal.id, 'rejected')}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleProposalAction(proposal.id, 'accepted')}
                >
                  Accept
                </Button>
              </div>
            )}
            
            {proposal.status === 'accepted' && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/messages?vendor=${proposal.vendor_id}`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-100">Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-100">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return <Badge variant="outline" className="bg-green-100">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100">High</Badge>;
      case 'critical':
        return <Badge variant="outline" className="bg-red-100">Critical</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{isVendor ? 'Service Requests' : 'My Service Requests'}</h1>
          {!isVendor && (
            <Button onClick={() => navigate('/contact-vendor')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Service Request
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            {isVendor && <TabsTrigger value="mine">My Proposals</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {renderRequestsList('all')}
          </TabsContent>
          
          <TabsContent value="open" className="mt-6">
            {renderRequestsList('open')}
          </TabsContent>
          
          <TabsContent value="in_progress" className="mt-6">
            {renderRequestsList('in_progress')}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            {renderRequestsList('completed')}
          </TabsContent>
          
          {isVendor && (
            <TabsContent value="mine" className="mt-6">
              {renderRequestsList('mine')}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );

  function renderRequestsList(filter: string) {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (requests.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-xl font-medium mb-2">No service requests found</p>
            <p className="text-muted-foreground mb-6">
              {isVendor 
                ? 'There are no service requests matching your criteria at the moment.'
                : 'You have not created any service requests yet.'
              }
            </p>
            {!isVendor && (
              <Button onClick={() => navigate('/contact-vendor')}>
                Create a Service Request
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{request.title}</CardTitle>
                  <CardDescription>
                    {new Date(request.created_at).toLocaleDateString()} • {request.category}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(request.status)}
                  {getUrgencyBadge(request.urgency)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{request.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {request.budget && (
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-sm text-muted-foreground">
                      {request.budget.toLocaleString()} XOF
                    </p>
                  </div>
                )}
                
                {request.property && (
                  <div>
                    <p className="text-sm font-medium">Property</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.property.title || request.property.address}
                    </p>
                  </div>
                )}
                
                {!isVendor && request.requester && (
                  <div>
                    <p className="text-sm font-medium">Requested by</p>
                    <p className="text-sm text-muted-foreground">
                      {request.requester.first_name} {request.requester.last_name}
                    </p>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Proposals ({request.proposal_count || 0})</h4>
                  {isVendor && request.status === 'open' && (
                    <Button size="sm" variant="outline">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Submit Proposal
                    </Button>
                  )}
                </div>
                
                {renderProposals(request)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default ServiceRequests;
