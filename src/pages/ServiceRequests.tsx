
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, PlusCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number | null;
  urgency: string;
  status: string;
  created_at: string;
  requester: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
  property?: {
    id: string;
    title: string;
    address: string;
  } | null;
}

interface ServiceProposal {
  id: string;
  price: number;
  estimated_days: number;
  message: string;
  status: string;
  created_at: string;
}

const ServiceRequests = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState('open');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [myProposals, setMyProposals] = useState<Record<string, ServiceProposal>>({});
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalDays, setProposalDays] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);

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
          requester:requester_id (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          property:property_id (
            id,
            title,
            address
          )
        `)
        .eq('status', activeTab);

      // If vendor is targeting specific requests
      if (roles.includes('vendor')) {
        // Get vendor profile to check services offered
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendor_profiles')
          .select('services_offered')
          .eq('id', user!.id)
          .single();

        if (vendorError && vendorError.code !== 'PGRST116') {
          throw vendorError;
        }

        if (vendorData?.services_offered && vendorData.services_offered.length > 0) {
          // Filter by service categories the vendor offers
          query = query.in('category', vendorData.services_offered);
        }

        // Also get requests specifically targeting this vendor
        query = query.or(`target_vendor_id.eq.${user!.id},target_vendor_id.is.null`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setServiceRequests(data as ServiceRequest[]);
      
      // If vendor, fetch their proposals for these requests
      if (roles.includes('vendor') && data && data.length > 0) {
        await fetchVendorProposals(data.map(r => r.id));
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

  const fetchVendorProposals = async (requestIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .select('*')
        .eq('vendor_id', user!.id)
        .in('request_id', requestIds);

      if (error) throw error;

      // Create a map of request_id to proposal
      const proposalMap: Record<string, ServiceProposal> = {};
      data.forEach(proposal => {
        proposalMap[proposal.request_id] = proposal;
      });

      setMyProposals(proposalMap);
    } catch (error) {
      console.error('Error fetching vendor proposals:', error);
    }
  };

  const handleSelectRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
    
    // Pre-fill proposal if one exists
    if (myProposals[request.id]) {
      const proposal = myProposals[request.id];
      setProposalPrice(proposal.price.toString());
      setProposalDays(proposal.estimated_days.toString());
      setProposalMessage(proposal.message);
    } else {
      // Reset form
      setProposalPrice('');
      setProposalDays('');
      setProposalMessage('');
    }
  };

  const handleSubmitProposal = async () => {
    if (!selectedRequest) return;
    
    setProposalLoading(true);
    try {
      const price = parseFloat(proposalPrice);
      const days = parseInt(proposalDays);
      
      if (isNaN(price) || isNaN(days)) {
        toast({
          title: 'Erreur de validation',
          description: 'Veuillez entrer des valeurs numériques valides pour le prix et la durée.',
          variant: 'destructive',
        });
        return;
      }

      // Check if we're updating an existing proposal
      if (myProposals[selectedRequest.id]) {
        const { error } = await supabase
          .from('service_proposals')
          .update({
            price,
            estimated_days: days,
            message: proposalMessage,
            updated_at: new Date().toISOString()
          })
          .eq('id', myProposals[selectedRequest.id].id);

        if (error) throw error;

        toast({
          title: 'Proposition mise à jour',
          description: 'Votre proposition a été mise à jour avec succès.',
        });
      } else {
        // Create new proposal
        const { error } = await supabase
          .from('service_proposals')
          .insert({
            request_id: selectedRequest.id,
            vendor_id: user!.id,
            price,
            estimated_days: days,
            message: proposalMessage,
            status: 'pending'
          });

        if (error) throw error;

        toast({
          title: 'Proposition envoyée',
          description: 'Votre proposition a été envoyée avec succès.',
        });
      }
      
      // Refresh data
      fetchServiceRequests();
      setDetailsOpen(false);
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de soumettre la proposition',
        variant: 'destructive',
      });
    } finally {
      setProposalLoading(false);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Demandes de service</h1>
          {!roles.includes('vendor') && (
            <Button onClick={() => navigate('/new-service-request')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle demande
            </Button>
          )}
        </div>

        <Tabs defaultValue="open" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="open">Ouvertes</TabsTrigger>
            <TabsTrigger value="in_progress">En cours</TabsTrigger>
            <TabsTrigger value="completed">Complétées</TabsTrigger>
            <TabsTrigger value="cancelled">Annulées</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : serviceRequests.length === 0 ? (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Aucune demande de service</CardTitle>
                  <CardDescription>
                    {activeTab === 'open' 
                      ? "Il n'y a actuellement aucune demande de service ouverte."
                      : `Il n'y a pas de demande de service avec le statut "${activeTab}".`}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceRequests.map((request) => (
                  <Card 
                    key={request.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" 
                    onClick={() => handleSelectRequest(request)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`${getUrgencyColor(request.urgency)} text-white border-0`}
                        >
                          {request.urgency}
                        </Badge>
                      </div>
                      <CardDescription>{request.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm mb-4">{request.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={request.requester?.avatar_url || ''} />
                            <AvatarFallback>
                              {getInitials(request.requester?.first_name, request.requester?.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-xs">
                            <p className="font-medium">
                              {request.requester?.first_name} {request.requester?.last_name}
                            </p>
                            <p className="text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {roles.includes('vendor') && myProposals[request.id] && (
                          <Badge variant="secondary">Proposition envoyée</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedRequest?.title}</SheetTitle>
            <SheetDescription>
              Demande de service - {selectedRequest?.category}
            </SheetDescription>
          </SheetHeader>
          {selectedRequest && (
            <ScrollArea className="h-[calc(100vh-150px)] pr-4">
              <div className="py-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm">{selectedRequest.description}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Catégorie:</span>
                    <span className="text-sm">{selectedRequest.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Urgence:</span>
                    <Badge variant="outline" className={`${getUrgencyColor(selectedRequest.urgency)} text-white border-0`}>
                      {selectedRequest.urgency}
                    </Badge>
                  </div>
                  {selectedRequest.budget && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Budget:</span>
                      <span className="text-sm">{selectedRequest.budget.toLocaleString()} XOF</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Date de création:</span>
                    <span className="text-sm">{new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {selectedRequest.property && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Propriété concernée</h3>
                    <Card>
                      <CardContent className="p-4">
                        <p className="font-medium">{selectedRequest.property.title}</p>
                        <p className="text-sm text-muted-foreground">{selectedRequest.property.address}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Demandeur</h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedRequest.requester?.avatar_url || ''} />
                      <AvatarFallback>
                        {getInitials(selectedRequest.requester?.first_name, selectedRequest.requester?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedRequest.requester?.first_name} {selectedRequest.requester?.last_name}</span>
                  </div>
                </div>
                
                {roles.includes('vendor') && activeTab === 'open' && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-base font-medium">
                      {myProposals[selectedRequest.id] ? 'Modifier votre proposition' : 'Créer une proposition'}
                    </h3>
                    
                    <div>
                      <label className="text-sm font-medium">Prix (XOF)</label>
                      <input
                        type="number"
                        value={proposalPrice}
                        onChange={(e) => setProposalPrice(e.target.value)}
                        className="w-full p-2 mt-1 border rounded-md"
                        placeholder="Montant en XOF"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Durée estimée (jours)</label>
                      <input
                        type="number"
                        value={proposalDays}
                        onChange={(e) => setProposalDays(e.target.value)}
                        className="w-full p-2 mt-1 border rounded-md"
                        placeholder="Nombre de jours"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <textarea
                        value={proposalMessage}
                        onChange={(e) => setProposalMessage(e.target.value)}
                        className="w-full p-2 mt-1 border rounded-md"
                        rows={4}
                        placeholder="Détaillez votre proposition..."
                      />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleSubmitProposal}
                        disabled={proposalLoading}
                      >
                        {proposalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {myProposals[selectedRequest.id] ? 'Mettre à jour' : 'Envoyer la proposition'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {!roles.includes('vendor') && (
                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/messages?request=${selectedRequest.id}`)}
                    >
                      Contacter
                    </Button>
                    
                    <Button
                      onClick={() => navigate(`/appointments?request=${selectedRequest.id}`)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Planifier
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

export default ServiceRequests;
