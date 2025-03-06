
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  CalendarPlus,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColorClass, translateStatus, translateUrgency, translateCategory } from '@/utils/formatUtils';

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

interface ProposalFormData {
  price: number;
  estimated_days: number;
  message: string;
}

interface ScheduleAppointmentData {
  proposalId: string;
  vendorId: string;
  date: string;
  time: string;
  location: string;
  notes: string;
}

const ServiceRequests = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [proposalFormData, setProposalFormData] = useState<ProposalFormData>({
    price: 0,
    estimated_days: 1,
    message: ''
  });
  const [appointmentData, setAppointmentData] = useState<ScheduleAppointmentData>({
    proposalId: '',
    vendorId: '',
    date: '',
    time: '',
    location: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
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
        title: 'Erreur',
        description: 'Échec du chargement des demandes de service',
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
        title: 'Succès',
        description: `Proposition ${status === 'accepted' ? 'acceptée' : 'rejetée'} avec succès`,
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
        title: 'Erreur',
        description: 'Échec de la mise à jour du statut de la proposition',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitProposal = async () => {
    if (!selectedRequest) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('service_proposals')
        .insert({
          request_id: selectedRequest.id,
          vendor_id: user!.id,
          price: proposalFormData.price,
          estimated_days: proposalFormData.estimated_days,
          message: proposalFormData.message,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Proposition soumise avec succès',
      });

      // Reset form and close dialog
      setProposalFormData({
        price: 0,
        estimated_days: 1,
        message: ''
      });
      setShowProposalDialog(false);
      
      // Refresh data
      fetchServiceRequests();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la soumission de la proposition',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!appointmentData.proposalId || !appointmentData.date || !appointmentData.time) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    try {
      // Combine date and time
      const appointment_date = new Date(`${appointmentData.date}T${appointmentData.time}`);
      
      const { error } = await supabase
        .from('service_appointments')
        .insert({
          proposal_id: appointmentData.proposalId,
          vendor_id: appointmentData.vendorId,
          client_id: user!.id,
          appointment_date: appointment_date.toISOString(),
          location: appointmentData.location,
          notes: appointmentData.notes,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Rendez-vous programmé avec succès',
      });

      // Reset form and close dialog
      setAppointmentData({
        proposalId: '',
        vendorId: '',
        date: '',
        time: '',
        location: '',
        notes: ''
      });
      setShowAppointmentDialog(false);
      
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la programmation du rendez-vous',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderProposals = (request: ServiceRequest) => {
    if (!request.proposals || request.proposals.length === 0) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Aucune proposition pour le moment</p>
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
              <Badge className={getStatusColorClass(proposal.status)}>
                {translateStatus(proposal.status)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Prix:</span>{' '}
                {formatCurrency(proposal.price)}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Délai estimé:</span>{' '}
                {proposal.estimated_days} jour{proposal.estimated_days !== 1 ? 's' : ''}
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
                  Rejeter
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleProposalAction(proposal.id, 'accepted')}
                >
                  Accepter
                </Button>
              </div>
            )}
            
            {!isVendor && proposal.status === 'accepted' && (
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAppointmentData({
                      ...appointmentData,
                      proposalId: proposal.id,
                      vendorId: proposal.vendor_id
                    });
                    setShowAppointmentDialog(true);
                  }}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Programmer un rendez-vous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/messages?vendor=${proposal.vendor_id}`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    return <Badge className={getStatusColorClass(status)}>{translateStatus(status)}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyColors: Record<string, string> = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge variant="outline" className={urgencyColors[urgency] || 'bg-gray-100'}>
        {translateUrgency(urgency)}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{isVendor ? 'Demandes de service' : 'Mes demandes de service'}</h1>
          {!isVendor && (
            <Button onClick={() => navigate('/contact-vendor')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouvelle demande de service
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="open">Ouverts</TabsTrigger>
            <TabsTrigger value="in_progress">En cours</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
            {isVendor && <TabsTrigger value="mine">Mes propositions</TabsTrigger>}
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

      {/* Submit Proposal Dialog */}
      <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Soumettre une proposition</DialogTitle>
            <DialogDescription>
              Proposez vos services pour cette demande: {selectedRequest?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Prix proposé (XOF)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                value={proposalFormData.price}
                onChange={(e) => setProposalFormData({
                  ...proposalFormData,
                  price: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimated_days">Délai estimé (jours)</Label>
              <Input
                id="estimated_days"
                type="number"
                min="1"
                value={proposalFormData.estimated_days}
                onChange={(e) => setProposalFormData({
                  ...proposalFormData,
                  estimated_days: parseInt(e.target.value) || 1
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={4}
                placeholder="Décrivez votre approche et pourquoi vous êtes la personne idéale pour ce travail..."
                value={proposalFormData.message}
                onChange={(e) => setProposalFormData({
                  ...proposalFormData,
                  message: e.target.value
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProposalDialog(false)}>Annuler</Button>
            <Button 
              onClick={handleSubmitProposal}
              disabled={!proposalFormData.price || !proposalFormData.message || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Soumission...
                </>
              ) : 'Soumettre la proposition'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Programmer un rendez-vous</DialogTitle>
            <DialogDescription>
              Planifiez une rencontre avec le fournisseur de services
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData({
                    ...appointmentData,
                    date: e.target.value
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  value={appointmentData.time}
                  onChange={(e) => setAppointmentData({
                    ...appointmentData,
                    time: e.target.value
                  })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                placeholder="Adresse ou lieu de rencontre"
                value={appointmentData.location}
                onChange={(e) => setAppointmentData({
                  ...appointmentData,
                  location: e.target.value
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Notes supplémentaires ou instructions..."
                value={appointmentData.notes}
                onChange={(e) => setAppointmentData({
                  ...appointmentData,
                  notes: e.target.value
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>Annuler</Button>
            <Button 
              onClick={handleScheduleAppointment}
              disabled={!appointmentData.date || !appointmentData.time || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Programmation...
                </>
              ) : 'Programmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
            <p className="text-xl font-medium mb-2">Aucune demande de service trouvée</p>
            <p className="text-muted-foreground mb-6">
              {isVendor 
                ? 'Il n\'y a pas de demandes de service correspondant à vos critères pour le moment.'
                : 'Vous n\'avez pas encore créé de demandes de service.'
              }
            </p>
            {!isVendor && (
              <Button onClick={() => navigate('/contact-vendor')}>
                Créer une demande de service
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
                    {formatDate(request.created_at)} • {translateCategory(request.category)}
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
                      {formatCurrency(request.budget)}
                    </p>
                  </div>
                )}
                
                {request.property && (
                  <div>
                    <p className="text-sm font-medium">Propriété</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.property.title || request.property.address}
                    </p>
                  </div>
                )}
                
                {!isVendor && request.requester && (
                  <div>
                    <p className="text-sm font-medium">Demandé par</p>
                    <p className="text-sm text-muted-foreground">
                      {request.requester.first_name} {request.requester.last_name}
                    </p>
                  </div>
                )}

                {request.updated_at && request.updated_at !== request.created_at && (
                  <div>
                    <p className="text-sm font-medium">Dernière mise à jour</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(request.updated_at)}
                    </p>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Propositions ({request.proposal_count || 0})</h4>
                  {isVendor && request.status === 'open' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowProposalDialog(true);
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Soumettre une proposition
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
