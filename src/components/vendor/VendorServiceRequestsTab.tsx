
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  property_id: string | null;
  requester_id: string;
  category: string;
  budget: number | null;
  urgency: string;
  status: string;
  created_at: string;
  updated_at: string;
  has_proposed?: boolean;
}

const VendorServiceRequestsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [proposalForm, setProposalForm] = useState({
    price: '',
    estimatedDays: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchServiceRequests();
    }
  }, [user]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      
      // Get all open service requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (requestsError) throw requestsError;
      
      // Check which requests the vendor has already proposed to
      if (requestsData && requestsData.length > 0) {
        const { data: proposalsData, error: proposalsError } = await supabase
          .from('service_proposals')
          .select('request_id')
          .eq('vendor_id', user!.id);
          
        if (proposalsError) throw proposalsError;
        
        const proposedRequestIds = new Set(proposalsData?.map(p => p.request_id) || []);
        
        // Mark requests that the vendor has already proposed to
        const enhancedRequests = requestsData.map(request => ({
          ...request,
          has_proposed: proposedRequestIds.has(request.id)
        }));
        
        setRequests(enhancedRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes de service',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRequest) return;
    
    try {
      setIsSubmitting(true);
      
      const proposal = {
        request_id: selectedRequest.id,
        vendor_id: user.id,
        price: parseFloat(proposalForm.price),
        estimated_days: parseInt(proposalForm.estimatedDays),
        message: proposalForm.message,
        status: 'pending'
      };
      
      const { error } = await supabase
        .from('service_proposals')
        .insert(proposal);
        
      if (error) throw error;
      
      toast({
        title: 'Proposition envoyée',
        description: 'Votre proposition a été envoyée avec succès',
      });
      
      setSelectedRequest(null);
      setProposalForm({
        price: '',
        estimatedDays: '',
        message: '',
      });
      
      // Refresh the requests list
      fetchServiceRequests();
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre proposition. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUrgencyBadge = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'medium':
        return <Badge variant="secondary">Moyen</Badge>;
      case 'low':
        return <Badge>Faible</Badge>;
      default:
        return <Badge>{urgency}</Badge>;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProposalForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Demandes de service</h2>
        <Button onClick={fetchServiceRequests} variant="outline" size="sm">
          Actualiser
        </Button>
      </div>
      
      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">Aucune demande de service disponible pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{request.title}</CardTitle>
                  {renderUrgencyBadge(request.urgency)}
                </div>
                <CardDescription className="line-clamp-2">
                  {request.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catégorie:</span>
                    <span className="font-medium">{request.category}</span>
                  </div>
                  {request.budget && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">{request.budget.toLocaleString()} XOF</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {request.has_proposed ? (
                  <Button className="w-full" variant="secondary" disabled>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Proposition envoyée
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setSelectedRequest(request)}>
                        <Send className="h-4 w-4 mr-2" />
                        Proposer mes services
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Faire une proposition</DialogTitle>
                        <DialogDescription>
                          Remplissez ce formulaire pour proposer vos services pour cette demande.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmitProposal} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Prix proposé (XOF)</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            value={proposalForm.price}
                            onChange={handleChange}
                            min="0"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="estimatedDays">Nombre de jours estimé</Label>
                          <Input
                            id="estimatedDays"
                            name="estimatedDays"
                            type="number"
                            value={proposalForm.estimatedDays}
                            onChange={handleChange}
                            min="1"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="message">Message au client</Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={proposalForm.message}
                            onChange={handleChange}
                            placeholder="Expliquez comment vous allez répondre à ce besoin..."
                            className="min-h-[120px]"
                            required
                          />
                        </div>
                        
                        <DialogFooter>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Envoi en cours...
                              </>
                            ) : (
                              'Envoyer la proposition'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorServiceRequestsTab;
