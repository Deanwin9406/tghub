
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatDate, getStatusColorClass, translateStatus } from '@/utils/formatUtils';
import { CalendarIcon, Loader2 } from 'lucide-react';

interface Viewing {
  id: string;
  property_id: string;
  agent_id: string;
  client_id: string;
  viewing_date: string;
  status: string;
  notes: string;
  feedback: any;
  property: {
    title: string;
    address: string;
  };
  client: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

const Viewings = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [selectedViewing, setSelectedViewing] = useState<Viewing | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [clientInterestLevel, setClientInterestLevel] = useState('medium');
  
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [newViewing, setNewViewing] = useState({
    property_id: '',
    client_id: '',
    viewing_date: new Date(),
    duration_minutes: 30,
    notes: '',
  });

  // Check if the user has the right permissions
  const isAgent = roles.includes('agent');
  const isAdmin = roles.includes('admin');
  const isManager = roles.includes('manager');
  const hasPermission = isAgent || isAdmin || isManager;

  useEffect(() => {
    if (!hasPermission) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas l'autorisation d'accéder à cette page.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
    
    fetchViewings();
    fetchProperties();
    fetchClients();
  }, [user?.id]);

  const fetchViewings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('viewings')
        .select(`
          *,
          property:property_id (title, address),
          client:client_id (first_name, last_name, email, phone)
        `)
        .eq('agent_id', user?.id);

      if (error) {
        throw error;
      }

      setViewings(data || []);
    } catch (error) {
      console.error('Error fetching viewings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les visites.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, address')
        .eq('status', 'available');

      if (error) {
        throw error;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .not('first_name', 'is', null);

      if (error) {
        throw error;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleAddViewing = async () => {
    try {
      const { data, error } = await supabase
        .from('viewings')
        .insert([
          {
            property_id: newViewing.property_id,
            agent_id: user?.id,
            client_id: newViewing.client_id,
            viewing_date: newViewing.viewing_date.toISOString(),
            duration_minutes: newViewing.duration_minutes,
            notes: newViewing.notes,
            status: 'scheduled'
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Visite programmée",
        description: "La visite a été ajoutée avec succès.",
      });
      
      setIsAddDialogOpen(false);
      fetchViewings();
    } catch (error) {
      console.error('Error adding viewing:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la visite.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (viewingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('viewings')
        .update({ status: newStatus })
        .eq('id', viewingId);

      if (error) {
        throw error;
      }

      toast({
        title: "Statut mis à jour",
        description: `La visite est maintenant ${translateStatus(newStatus)}.`,
      });
      
      fetchViewings();
    } catch (error) {
      console.error('Error updating viewing status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const handleOpenFeedbackDialog = (viewing: Viewing) => {
    setSelectedViewing(viewing);
    setFeedbackText(viewing.feedback?.text || '');
    setClientInterestLevel(viewing.feedback?.interest_level || 'medium');
    setIsFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedViewing) return;

    try {
      const feedbackData = {
        text: feedbackText,
        interest_level: clientInterestLevel,
        submitted_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('viewings')
        .update({ 
          feedback: feedbackData,
          status: 'completed'
        })
        .eq('id', selectedViewing.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Retour enregistré",
        description: "Le retour de la visite a été enregistré avec succès.",
      });
      
      setIsFeedbackDialogOpen(false);
      fetchViewings();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le retour.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Visites Propriétés</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            Planifier une visite
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : viewings.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">
                Aucune visite programmée. Planifiez une visite pour commencer.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propriété</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewings.map((viewing) => (
                <TableRow key={viewing.id}>
                  <TableCell>
                    <div className="font-medium">{viewing.property?.title}</div>
                    <div className="text-sm text-muted-foreground">{viewing.property?.address}</div>
                  </TableCell>
                  <TableCell>
                    <div>{viewing.client?.first_name} {viewing.client?.last_name}</div>
                    <div className="text-sm text-muted-foreground">{viewing.client?.email}</div>
                  </TableCell>
                  <TableCell>
                    {formatDate(viewing.viewing_date, true)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColorClass(viewing.status)}>
                      {translateStatus(viewing.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {viewing.status === 'scheduled' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(viewing.id, 'cancelled')}
                          >
                            Annuler
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenFeedbackDialog(viewing)}
                          >
                            Terminée
                          </Button>
                        </>
                      )}
                      {viewing.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenFeedbackDialog(viewing)}
                        >
                          Voir retour
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Add Viewing Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Planifier une nouvelle visite</DialogTitle>
              <DialogDescription>
                Remplissez les détails pour programmer une visite de propriété.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Propriété</label>
                <Select 
                  onValueChange={(value) => setNewViewing({...newViewing, property_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une propriété" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Propriétés disponibles</SelectLabel>
                      {properties.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title} - {property.address}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Client</label>
                <Select 
                  onValueChange={(value) => setNewViewing({...newViewing, client_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Clients</SelectLabel>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.first_name} {client.last_name} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Date et heure</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newViewing.viewing_date ? (
                        format(newViewing.viewing_date, "PPP 'à' HH:mm", { locale: fr })
                      ) : (
                        <span>Sélectionnez une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newViewing.viewing_date}
                      onSelect={(date) => date && setNewViewing({...newViewing, viewing_date: date})}
                      initialFocus
                      locale={fr}
                    />
                    <div className="p-3 border-t">
                      <label className="text-sm font-medium">Heure</label>
                      <Input
                        type="time"
                        className="mt-1"
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          const newDate = new Date(newViewing.viewing_date);
                          newDate.setHours(hours, minutes);
                          setNewViewing({...newViewing, viewing_date: newDate});
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Durée (minutes)</label>
                <Input 
                  type="number"
                  value={newViewing.duration_minutes}
                  onChange={(e) => setNewViewing({...newViewing, duration_minutes: parseInt(e.target.value)})}
                  min={15}
                  step={15}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Notes</label>
                <Textarea 
                  value={newViewing.notes}
                  onChange={(e) => setNewViewing({...newViewing, notes: e.target.value})}
                  placeholder="Informations supplémentaires sur la visite..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleAddViewing}>
                Planifier la visite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Retour de visite</DialogTitle>
              <DialogDescription>
                Enregistrez vos impressions et l'intérêt du client pour cette propriété.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Intérêt du client</label>
                <Select 
                  value={clientInterestLevel}
                  onValueChange={setClientInterestLevel}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                    <SelectItem value="very_high">Très élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium">Commentaires</label>
                <Textarea 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Notes et impressions du client..."
                  rows={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsFeedbackDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleSubmitFeedback}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Viewings;
