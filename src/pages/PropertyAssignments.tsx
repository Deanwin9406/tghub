
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle, Check, X, MessageSquare, Clock, Wrench } from 'lucide-react';

const PropertyAssignments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [requestsData, setRequestsData] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkUserRole() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        setUserRole(data.role as UserRole);
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    }
    
    checkUserRole();
  }, [user]);

  useEffect(() => {
    if (!user || !userRole) return;
    
    fetchRequests();
  }, [user, userRole, activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    
    try {
      let query;
      
      if (userRole === 'vendor') {
        // Vendors see requests assigned to them or pending approval for them
        query = supabase
          .from('maintenance_requests')
          .select(`
            *,
            property:properties(title, address, city),
            tenant:profiles!tenant_id(first_name, last_name)
          `)
          .or(`assigned_to.eq.${user?.id},and(needs_approval.eq.true,assigned_to.is.null)`)
          .order('created_at', { ascending: false });
      } else if (userRole === 'landlord' || userRole === 'manager') {
        // Landlords and managers see requests for properties they own or manage
        query = supabase
          .from('maintenance_requests')
          .select(`
            *,
            property:properties(title, address, city),
            tenant:profiles!tenant_id(first_name, last_name)
          `)
          .order('created_at', { ascending: false });
      } else {
        // Tenants see their own requests
        query = supabase
          .from('maintenance_requests')
          .select(`
            *,
            property:properties(title, address, city)
          `)
          .eq('tenant_id', user?.id)
          .order('created_at', { ascending: false });
      }
      
      // Apply status filter based on active tab
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setRequestsData(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ needs_approval: false, status: 'in_progress' })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: 'Demande approuvée',
        description: 'La demande a été approuvée avec succès',
      });
      
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver la demande',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: 'Demande rejetée',
        description: 'La demande a été rejetée',
      });
      
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter la demande',
        variant: 'destructive',
      });
    }
  };

  const handleAssignToVendor = async (requestId: string, vendorId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_to: vendorId,
          status: 'in_progress'
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: 'Prestataire assigné',
        description: 'Le prestataire a été assigné à cette demande',
      });
      
      fetchRequests();
    } catch (error) {
      console.error('Error assigning vendor:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'assigner le prestataire',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptAssignment = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: 'in_progress' })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: 'Mission acceptée',
        description: 'Vous avez accepté cette mission',
      });
      
      fetchRequests();
    } catch (error) {
      console.error('Error accepting assignment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'accepter la mission',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          status: 'completed',
          resolved_date: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: 'Travail terminé',
        description: 'La demande a été marquée comme terminée',
      });
      
      fetchRequests();
    } catch (error) {
      console.error('Error completing request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer comme terminé',
        variant: 'destructive',
      });
    }
  };

  const handleSendReply = async (requestId: string) => {
    if (!replyMessage.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real application, you would create a message in the messages table
      // For now, we'll just show a toast
      toast({
        title: 'Message envoyé',
        description: 'Votre message a été envoyé',
      });
      
      setReplyMessage('');
      // fetchRequests(); // Refresh data if needed
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">En cours</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">
          {userRole === 'vendor' ? 'Mes Missions de Réparation' : 'Demandes de Maintenance'}
        </h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="in_progress">En cours</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
            <TabsTrigger value="cancelled">Annulés</TabsTrigger>
            <TabsTrigger value="all">Tous</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : requestsData.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-xl font-medium mb-2">Aucune demande trouvée</p>
                  <p className="text-muted-foreground">
                    Aucune demande de maintenance n'a été trouvée pour cette catégorie.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requestsData.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.title}</CardTitle>
                          <CardDescription>{request.property?.title}</CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-4">
                      <p className="text-sm mb-4">{request.description}</p>
                      
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Adresse:</span>
                          <p>{request.property?.address}, {request.property?.city}</p>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Priorité:</span>
                          <p className="capitalize">{request.priority || 'Moyenne'}</p>
                        </div>
                        
                        {request.tenant && (
                          <div>
                            <span className="text-muted-foreground">Demandeur:</span>
                            <p>{request.tenant.first_name} {request.tenant.last_name}</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <p>{new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {request.needs_approval && userRole !== 'vendor' && (
                        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                          <p className="flex items-center text-yellow-800">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Cette demande nécessite votre approbation
                          </p>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex flex-col gap-2 pt-0">
                      {/* Action buttons based on role and request status */}
                      {userRole === 'landlord' || userRole === 'manager' ? (
                        <>
                          {request.needs_approval && (
                            <div className="flex gap-2 w-full">
                              <Button 
                                variant="outline" 
                                className="flex-1" 
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approuver
                              </Button>
                              <Button 
                                variant="outline"
                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50" 
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Rejeter
                              </Button>
                            </div>
                          )}
                          
                          {request.status === 'pending' && !request.needs_approval && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                  <Wrench className="h-4 w-4 mr-2" />
                                  Assigner à un prestataire
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assigner un prestataire</DialogTitle>
                                  <DialogDescription>
                                    Sélectionnez un prestataire pour cette tâche
                                  </DialogDescription>
                                </DialogHeader>
                                <Select onValueChange={(value) => handleAssignToVendor(request.id, value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un prestataire" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="vendor-id-1">Jean Dupont (Plombier)</SelectItem>
                                    <SelectItem value="vendor-id-2">Marie Martin (Électricienne)</SelectItem>
                                    <SelectItem value="vendor-id-3">Paul Bernard (Peintre)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {(request.status === 'in_progress' || request.status === 'completed') && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Communiquer
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Communiquer avec le prestataire</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="max-h-[300px] overflow-y-auto space-y-4 border rounded-md p-4">
                                    {/* Messages would go here */}
                                    <p className="text-sm text-muted-foreground text-center">Début de la conversation</p>
                                  </div>
                                  <Textarea 
                                    placeholder="Écrivez votre message..." 
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button 
                                    disabled={!replyMessage.trim() || isSubmitting} 
                                    onClick={() => handleSendReply(request.id)}
                                  >
                                    {isSubmitting ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                    )}
                                    Envoyer
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      ) : userRole === 'vendor' ? (
                        <>
                          {request.status === 'pending' && request.assigned_to === user?.id && (
                            <div className="flex gap-2 w-full">
                              <Button 
                                variant="outline" 
                                className="flex-1" 
                                onClick={() => handleAcceptAssignment(request.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Accepter
                              </Button>
                              <Button 
                                variant="outline"
                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50" 
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Refuser
                              </Button>
                            </div>
                          )}
                          
                          {request.status === 'in_progress' && request.assigned_to === user?.id && (
                            <div className="space-y-2 w-full">
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => handleCompleteRequest(request.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Marquer comme terminé
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="w-full">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Communiquer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Communiquer avec le client</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="max-h-[300px] overflow-y-auto space-y-4 border rounded-md p-4">
                                      {/* Messages would go here */}
                                      <p className="text-sm text-muted-foreground text-center">Début de la conversation</p>
                                    </div>
                                    <Textarea 
                                      placeholder="Écrivez votre message..." 
                                      value={replyMessage}
                                      onChange={(e) => setReplyMessage(e.target.value)}
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      disabled={!replyMessage.trim() || isSubmitting} 
                                      onClick={() => handleSendReply(request.id)}
                                    >
                                      {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                      )}
                                      Envoyer
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </>
                      ) : (
                        // Tenant view
                        <div>
                          {request.status === 'in_progress' && (
                            <p className="text-sm text-blue-600">
                              <Clock className="h-4 w-4 inline mr-1" />
                              En cours de traitement
                            </p>
                          )}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PropertyAssignments;
