
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency, translateCategory, translateUrgency, translateStatus, getStatusColorClass } from '@/utils/formatUtils';
import { Loader2 } from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  requester_id: string;
  property_id: string;
  category: string;
  budget: number;
  urgency: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester: {
    first_name: string;
    last_name: string;
    email: string;
  };
  property: {
    title: string;
    address: string;
  };
  proposal_count: number;
  proposals: any[];
}

interface Proposal {
  id: string;
  request_id: string;
  vendor_id: string;
  price: number;
  description: string;
  estimated_days: number;
  status: string;
  created_at: string;
}

const ServiceRequests = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isSubmitProposalOpen, setIsSubmitProposalOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({
    price: 0,
    description: '',
    estimated_days: 1
  });
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    property_id: '',
    category: 'plumbing',
    budget: 0,
    urgency: 'medium'
  });
  const [activeTab, setActiveTab] = useState('open');
  const [myProposals, setMyProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const isVendor = roles.includes('vendor');
  const isClient = !isVendor;

  useEffect(() => {
    fetchServiceRequests();
    if (isClient) {
      fetchProperties();
    }
    if (isVendor) {
      fetchMyProposals();
    }
  }, [user?.id, isVendor, isClient]);

  const fetchServiceRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          requester:requester_id(first_name, last_name, email),
          property:property_id(title, address),
          proposals:service_proposals(id, status),
          proposal_count:service_proposals(count)
        `);

      if (isClient) {
        // Filter by the requester_id if the user is a client
        query = query.eq('requester_id', user?.id);
      }

      // For vendors only show open requests unless they've made a proposal
      if (isVendor && activeTab === 'open') {
        query = query.eq('status', 'open');
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to include the proposal count
      const transformedData = data?.map(item => ({
        ...item,
        proposal_count: item.proposal_count?.[0]?.count || 0
      })) || [];

      setRequests(transformedData);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de service.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      // Get properties where the user is the owner or tenant
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, address')
        .eq('owner_id', user?.id);

      if (error) {
        throw error;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchMyProposals = async () => {
    setLoadingProposals(true);
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .select(`
          *,
          request:request_id(
            title, 
            description, 
            category, 
            urgency, 
            status, 
            created_at,
            requester:requester_id(first_name, last_name, email),
            property:property_id(title, address)
          )
        `)
        .eq('vendor_id', user?.id);

      if (error) {
        throw error;
      }

      setMyProposals(data || []);
    } catch (error) {
      console.error('Error fetching my proposals:', error);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      if (!newRequest.title || !newRequest.description) {
        toast({
          title: "Champs obligatoires",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('service_requests')
        .insert([{
          title: newRequest.title,
          description: newRequest.description,
          property_id: newRequest.property_id || null,
          category: newRequest.category,
          budget: newRequest.budget || null,
          urgency: newRequest.urgency,
          requester_id: user?.id,
          status: 'open'
        }])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Demande créée",
        description: "Votre demande de service a été créée avec succès.",
      });

      // Reset form and close dialog
      setNewRequest({
        title: '',
        description: '',
        property_id: '',
        category: 'plumbing',
        budget: 0,
        urgency: 'medium'
      });
      setIsCreateRequestOpen(false);
      fetchServiceRequests();
    } catch (error) {
      console.error('Error creating service request:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande de service.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitProposal = async () => {
    if (!selectedRequest) return;

    try {
      if (!newProposal.description || newProposal.price <= 0 || newProposal.estimated_days <= 0) {
        toast({
          title: "Champs obligatoires",
          description: "Veuillez remplir tous les champs obligatoires avec des valeurs valides.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('service_proposals')
        .insert([{
          request_id: selectedRequest.id,
          vendor_id: user?.id,
          price: newProposal.price,
          description: newProposal.description,
          estimated_days: newProposal.estimated_days,
          status: 'pending'
        }])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Proposition soumise",
        description: "Votre proposition a été soumise avec succès.",
      });

      // Reset form and close dialog
      setNewProposal({
        price: 0,
        description: '',
        estimated_days: 1
      });
      setIsSubmitProposalOpen(false);
      fetchServiceRequests();
      fetchMyProposals();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre proposition.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: "Statut mis à jour",
        description: `Le statut de la demande a été mis à jour.`,
      });

      fetchServiceRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProposalStatus = async (proposalId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_proposals')
        .update({ status: newStatus })
        .eq('id', proposalId);

      if (error) {
        throw error;
      }

      toast({
        title: "Statut mis à jour",
        description: `Le statut de la proposition a été mis à jour.`,
      });

      fetchMyProposals();
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Demandes de Service</h1>
          {isClient && (
            <Button onClick={() => setIsCreateRequestOpen(true)}>
              Nouvelle demande
            </Button>
          )}
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="open">Ouvertes</TabsTrigger>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            {isVendor && <TabsTrigger value="my-proposals">Mes Propositions</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="open" className="mt-4">
            {loading ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : requests.filter(r => r.status === 'open').length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">
                    Aucune demande de service ouverte actuellement.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Urgence</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Propositions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests
                    .filter(request => request.status === 'open')
                    .map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.property?.title ? `${request.property.title}, ${request.property.address}` : 'Pas de propriété spécifiée'}
                          </div>
                        </TableCell>
                        <TableCell>{translateCategory(request.category)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColorClass(request.urgency)}>
                            {translateUrgency(request.urgency)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.budget ? formatCurrency(request.budget) : 'Non spécifié'}
                        </TableCell>
                        <TableCell>{formatDate(request.created_at)}</TableCell>
                        <TableCell>{request.proposal_count}</TableCell>
                        <TableCell>
                          {isVendor ? (
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsSubmitProposalOpen(true);
                              }}
                            >
                              Soumettre une proposition
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdateRequestStatus(request.id, 'cancelled')}
                            >
                              Annuler la demande
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            {loading ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">
                    Aucune demande de service trouvée.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Urgence</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Propositions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.property?.title ? `${request.property.title}, ${request.property.address}` : 'Pas de propriété spécifiée'}
                        </div>
                      </TableCell>
                      <TableCell>{translateCategory(request.category)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColorClass(request.urgency)}>
                          {translateUrgency(request.urgency)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColorClass(request.status)}>
                          {translateStatus(request.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell>{request.proposal_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          {isVendor && (
            <TabsContent value="my-proposals" className="mt-4">
              {loadingProposals ? (
                <div className="flex justify-center my-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : myProposals.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">
                      Vous n'avez encore soumis aucune proposition.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Demande</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Jours estimés</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de soumission</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myProposals.map((proposal) => (
                      <TableRow key={proposal.id}>
                        <TableCell>
                          <div className="font-medium">{proposal.request?.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {proposal.request?.property?.title ? `${proposal.request.property.title}, ${proposal.request.property.address}` : 'Pas de propriété spécifiée'}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(proposal.price)}</TableCell>
                        <TableCell>{proposal.estimated_days} jours</TableCell>
                        <TableCell>
                          <Badge className={getStatusColorClass(proposal.status)}>
                            {translateStatus(proposal.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(proposal.created_at)}</TableCell>
                        <TableCell>
                          {proposal.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleUpdateProposalStatus(proposal.id, 'withdrawn')}
                            >
                              Retirer
                            </Button>
                          )}
                          {proposal.status === 'accepted' && (
                            <Button 
                              size="sm"
                              onClick={() => navigate('/appointments')}
                            >
                              Planifier un rendez-vous
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Submit Proposal Dialog */}
        <Dialog open={isSubmitProposalOpen} onOpenChange={setIsSubmitProposalOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Soumettre une proposition</DialogTitle>
              <DialogDescription>
                Proposez vos services pour cette demande.
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <>
                <div className="py-4">
                  <h3 className="font-medium text-lg">{selectedRequest.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRequest.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium">Catégorie</p>
                      <p className="text-sm">{translateCategory(selectedRequest.category)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Urgence</p>
                      <p className="text-sm">{translateUrgency(selectedRequest.urgency)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Budget client</p>
                      <p className="text-sm">{selectedRequest.budget ? formatCurrency(selectedRequest.budget) : 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date de la demande</p>
                      <p className="text-sm">{formatDate(selectedRequest.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 gap-4">
                    <label className="text-sm font-medium">Prix proposé</label>
                    <Input 
                      type="number"
                      value={newProposal.price}
                      onChange={(e) => setNewProposal({...newProposal, price: parseFloat(e.target.value)})}
                      placeholder="Prix"
                      min={1}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <label className="text-sm font-medium">Jours estimés</label>
                    <Input 
                      type="number"
                      value={newProposal.estimated_days}
                      onChange={(e) => setNewProposal({...newProposal, estimated_days: parseInt(e.target.value)})}
                      placeholder="Jours estimés"
                      min={1}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <label className="text-sm font-medium">Description de votre offre</label>
                    <Textarea 
                      value={newProposal.description}
                      onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                      placeholder="Décrivez votre proposition en détail..."
                      rows={5}
                    />
                  </div>
                </div>
              </>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsSubmitProposalOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleSubmitProposal}>
                Soumettre la proposition
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Service Request Dialog */}
        <Dialog open={isCreateRequestOpen} onOpenChange={setIsCreateRequestOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Nouvelle demande de service</DialogTitle>
              <DialogDescription>
                Détaillez votre besoin pour recevoir des propositions des prestataires.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Titre*</label>
                <Input 
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  placeholder="Ex: Réparation plomberie salle de bain"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Description*</label>
                <Textarea 
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  placeholder="Décrivez le problème ou le service dont vous avez besoin..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Propriété concernée</label>
                <Select 
                  value={newRequest.property_id}
                  onValueChange={(value) => setNewRequest({...newRequest, property_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une propriété (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucune propriété spécifique</SelectItem>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select 
                    value={newRequest.category}
                    onValueChange={(value) => setNewRequest({...newRequest, category: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">Plomberie</SelectItem>
                      <SelectItem value="electrical">Électricité</SelectItem>
                      <SelectItem value="heating">Chauffage</SelectItem>
                      <SelectItem value="aircon">Climatisation</SelectItem>
                      <SelectItem value="painting">Peinture</SelectItem>
                      <SelectItem value="cleaning">Nettoyage</SelectItem>
                      <SelectItem value="gardening">Jardinage</SelectItem>
                      <SelectItem value="moving">Déménagement</SelectItem>
                      <SelectItem value="security">Sécurité</SelectItem>
                      <SelectItem value="renovation">Rénovation</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Urgence</label>
                  <Select 
                    value={newRequest.urgency}
                    onValueChange={(value) => setNewRequest({...newRequest, urgency: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Budget estimé (optionnel)</label>
                <Input 
                  type="number"
                  value={newRequest.budget}
                  onChange={(e) => setNewRequest({...newRequest, budget: parseFloat(e.target.value)})}
                  placeholder="Votre budget pour ce service"
                  min={0}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateRequestOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateRequest}>
                Créer la demande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ServiceRequests;
