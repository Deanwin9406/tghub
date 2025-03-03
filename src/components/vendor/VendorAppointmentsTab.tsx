
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, MapPin, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Appointment {
  id: string;
  vendor_id: string;
  client_id: string;
  proposal_id: string | null;
  appointment_date: string;
  location: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  client?: {
    first_name: string;
    last_name: string;
    phone: string | null;
  };
}

const VendorAppointmentsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Get all appointments for this vendor
      const { data, error } = await supabase
        .from('service_appointments')
        .select(`
          *,
          client:client_id(
            first_name,
            last_name,
            phone
          )
        `)
        .eq('vendor_id', user!.id)
        .order('appointment_date', { ascending: false });
        
      if (error) throw error;
      
      setAppointments(data as unknown as Appointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les rendez-vous',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (status: string) => {
    if (!user || !selectedAppointment) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('service_appointments')
        .update({
          status,
          notes: statusUpdateNotes || selectedAppointment.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppointment.id);
        
      if (error) throw error;
      
      toast({
        title: 'Statut mis à jour',
        description: `Le rendez-vous a été marqué comme ${status}`,
      });
      
      setStatusUpdateNotes('');
      setSelectedAppointment(null);
      
      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Badge variant="outline">Prévu</Badge>;
      case 'completed':
        return <Badge variant="default">Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">En cours</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
        <h2 className="text-2xl font-bold">Mes rendez-vous</h2>
        <Button onClick={fetchAppointments} variant="outline" size="sm">
          Actualiser
        </Button>
      </div>
      
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">Vous n'avez aucun rendez-vous pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {appointment.client?.first_name} {appointment.client?.last_name}
                      </CardTitle>
                      <CardDescription>
                        {appointment.client?.phone || 'Aucun téléphone'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>
                        {new Date(appointment.appointment_date).toLocaleDateString()} à{' '}
                        {new Date(appointment.appointment_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {appointment.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{appointment.location}</span>
                      </div>
                    )}
                    
                    {appointment.notes && (
                      <div className="mt-2 pt-2 border-t text-muted-foreground">
                        <p>{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  {appointment.status === 'scheduled' && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="default" 
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Terminer
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Marquer comme terminé</DialogTitle>
                            <DialogDescription>
                              Confirmez que vous avez terminé ce rendez-vous
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="notes">Notes (optionnel)</Label>
                              <Textarea
                                id="notes"
                                value={statusUpdateNotes}
                                onChange={(e) => setStatusUpdateNotes(e.target.value)}
                                placeholder="Ajoutez des notes sur ce qui a été réalisé..."
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedAppointment(null)}
                            >
                              Annuler
                            </Button>
                            <Button 
                              onClick={() => updateAppointmentStatus('completed')}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Confirmer
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Annuler
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Annuler le rendez-vous</DialogTitle>
                            <DialogDescription>
                              Êtes-vous sûr de vouloir annuler ce rendez-vous ?
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="cancellation-notes">Raison de l'annulation</Label>
                              <Textarea
                                id="cancellation-notes"
                                value={statusUpdateNotes}
                                onChange={(e) => setStatusUpdateNotes(e.target.value)}
                                placeholder="Veuillez fournir une raison pour l'annulation..."
                                required
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedAppointment(null)}
                            >
                              Retour
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => updateAppointmentStatus('cancelled')}
                              disabled={isUpdating || !statusUpdateNotes.trim()}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <X className="h-4 w-4 mr-2" />
                              )}
                              Annuler le rendez-vous
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default VendorAppointmentsTab;
