
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Clock, DollarSign, Calendar, Building, User, Search } from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  property_id: string;
  requester_id: string;
  category: string;
  budget: number;
  urgency: string;
  status: string;
  created_at: string;
  requester?: {
    first_name: string;
    last_name: string;
  };
  property?: {
    title: string;
    address: string;
    city: string;
  };
  has_proposed: boolean;
}

const VendorServiceRequestsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [proposalData, setProposalData] = useState({
    price: 0,
    estimatedDays: 1,
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchServiceRequests();
    }
  }, [user]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch open service requests
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          requester:requester_id(
            first_name,
            last_name
          ),
          property:property_id(
            title,
            address,
            city
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // For each request, check if the current vendor has already proposed
      if (data) {
        const requestsWithProposalStatus = await Promise.all(
          data.map(async (request) => {
            const { count, error: proposalError } = await supabase
              .from('service_proposals')
              .select('*', { count: 'exact', head: true })
              .eq('request_id', request.id)
              .eq('vendor_id', user?.id);
            
            return {
              ...request,
              has_proposed: count ? count > 0 : false
            };
          })
        );
        
        setRequests(requestsWithProposalStatus);
      }
      
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

  const filteredRequests = requests.filter(request => 
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.property?.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitProposal = async () => {
    if (!selectedRequest || !user) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('service_proposals')
        .insert({
          request_id: selectedRequest.id,
          vendor_id: user.id,
          price: proposalData.price,
          estimated_days: proposalData.estimatedDays,
          message: proposalData.message,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: 'Proposal Submitted',
        description: 'Your proposal has been sent to the client.',
      });
      
      // Update the local state to show that this request has been responded to
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id ? { ...req, has_proposed: true } : req
        )
      );
      
      // Close the dialog and reset form
      setDialogOpen(false);
      setProposalData({
        price: 0,
        estimatedDays: 1,
        message: ''
      });
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your proposal',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openProposalDialog = (request: ServiceRequest) => {
    setSelectedRequest(request);
    // Pre-fill with the budget if available
    if (request.budget) {
      setProposalData(prev => ({ ...prev, price: request.budget }));
    }
    setDialogOpen(true);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests by title, category or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={fetchServiceRequests} variant="outline">Refresh</Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className={request.has_proposed ? "border-green-200" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <Badge variant={getUrgencyColor(request.urgency)}>
                      {request.urgency}
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>Posted {formatDistanceToNow(new Date(request.created_at))} ago</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm line-clamp-2">{request.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{request.property?.city || "Unknown location"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">
                        {request.requester 
                          ? `${request.requester.first_name} ${request.requester.last_name}`
                          : "Unknown client"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span>{request.budget ? `$${request.budget}` : "No budget set"}</span>
                    </div>
                    <div>
                      <Badge variant="outline">{request.category}</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  {request.has_proposed ? (
                    <Button variant="outline" className="w-full" disabled>
                      Proposal Submitted
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => openProposalDialog(request)}
                    >
                      Submit Proposal
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No service requests found</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              {searchQuery 
                ? "Try adjusting your search terms to find more requests." 
                : "There are no open service requests at the moment. Check back later!"}
            </p>
          </div>
        )}
      </div>
      
      {/* Submit Proposal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Proposal</DialogTitle>
            <DialogDescription>
              {selectedRequest?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Your Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={proposalData.price}
                  onChange={(e) => setProposalData(prev => ({ 
                    ...prev, 
                    price: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDays">Estimated Days</Label>
                <Input
                  id="estimatedDays"
                  type="number"
                  min="1"
                  value={proposalData.estimatedDays}
                  onChange={(e) => setProposalData(prev => ({ 
                    ...prev, 
                    estimatedDays: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your approach to this service request"
                rows={4}
                value={proposalData.message}
                onChange={(e) => setProposalData(prev => ({ 
                  ...prev, 
                  message: e.target.value 
                }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitProposal} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorServiceRequestsTab;
