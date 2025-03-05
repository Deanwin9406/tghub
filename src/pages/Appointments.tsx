
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Loader2, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: string;
  client_id: string;
  vendor_id: string;
  appointment_date: string;
  status: string;
  created_at: string;
  location: string | null;
  notes: string | null;
  client?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  vendor?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    business_name?: string | null;
  };
  proposal?: {
    request_id: string;
    price: number;
  };
  request?: {
    title: string;
    category: string;
  };
}

const Appointments = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request');
  const vendorId = searchParams.get('vendor');
  
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      
      if (requestId) {
        setSelectedRequestId(requestId);
      }
      
      if (vendorId) {
        setSelectedVendorId(vendorId);
      }
      
      // If we're a client, load vendors
      if (!roles.includes('vendor')) {
        fetchVendors();
      }
      
      // If we're a vendor, load service requests
      if (roles.includes('vendor')) {
        fetchRequests();
      }
    }
  }, [user, activeTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('service_appointments')
        .select(`
          *,
          client:client_id (
            first_name,
            last_name,
            avatar_url
          ),
          vendor:vendor_id (
            first_name,
            last_name,
            avatar_url,
            vendor_profiles (
              business_name
            )
          ),
          proposal:proposal_id (
            request_id,
            price
          ),
          request:proposal!inner(
            service_requests(
              title,
              category
            )
          )
        `)
        .eq('status', activeTab);

      if (roles.includes('vendor')) {
        query = query.eq('vendor_id', user!.id);
      } else {
        query = query.eq('client_id', user!.id);
      }

      const { data, error } = await query.order('appointment_date', { ascending: true });

      if (error) throw error;

      // Process the nested vendor_profiles data
      const formattedData = data.map(appointment => {
        if (appointment.vendor?.vendor_profiles?.length > 0) {
          return {
            ...appointment,
            vendor: {
              ...appointment.vendor,
              business_name: appointment.vendor.vendor_profiles[0]?.business_name
            }
          };
        }
        return appointment;
      });

      // Process the nested request data
      const appointmentsWithRequest = formattedData.map(appointment => {
        const requestData = appointment.request?.service_requests?.[0];
        return {
          ...appointment,
          request: requestData ? {
            title: requestData.title,
            category: requestData.category
          } : undefined
        };
      });

      setAppointments(appointmentsWithRequest as Appointment[]);
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

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select(`
          id,
          business_name,
          profiles (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('is_available', true);

      if (error) throw error;

      const formattedVendors = data.map(vendor => ({
        id: vendor.id,
        business_name: vendor.business_name,
        first_name: vendor.profiles?.first_name,
        last_name: vendor.profiles?.last_name,
        avatar_url: vendor.profiles?.avatar_url
      }));

      setVendors(formattedVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          id,
          title,
          category,
          status
        `)
        .eq('status', 'open');

      if (error) throw error;

      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleCreateAppointment = async () => {
    if (!date || !time) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez sélectionner une date et une heure',
        variant: 'destructive',
      });
      return;
    }

    if (roles.includes('vendor') && !selectedRequestId) {
      toast({
        title: 'Demande requise',
        description: 'Veuillez sélectionner une demande de service',
        variant: 'destructive',
      });
      return;
    }

    if (!roles.includes('vendor') && !selectedVendorId) {
      toast({
        title: 'Prestataire requis',
        description: 'Veuillez sélectionner un prestataire',
        variant: 'destructive',
      });
      return;
    }

    setCreatingAppointment(true);
    try {
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours, minutes);

      const appointmentData = {
        vendor_id: roles.includes('vendor') ? user!.id : selectedVendorId,
        client_id: roles.includes('vendor') ? selectedRequestId : user!.id,
        appointment_date: appointmentDate.toISOString(),
        location: location || null,
        notes: notes || null,
        status: 'scheduled',
      };

      const { data, error } = await supabase
        .from('service_appointments')
        .insert(appointmentData)
        .select();

      if (error) throw error;

      toast({
        title: 'Rendez-vous créé',
        description: 'Le rendez-vous a été créé avec succès',
      });

      // Reset form
      setDate(new Date());
      setTime('10:00');
      setLocation('');
      setNotes('');
      setSelectedVendorId(null);
      setSelectedRequestId(null);

      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le rendez-vous',
        variant: 'destructive',
      });
    } finally {
      setCreatingAppointment(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Rendez-vous annulé',
        description: 'Le rendez-vous a été annulé avec succès',
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'annuler le rendez-vous',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_appointments')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Rendez-vous terminé',
        description: 'Le rendez-vous a été marqué comme terminé',
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de terminer le rendez-vous',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Rendez-vous</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="scheduled" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="scheduled">Programmés</TabsTrigger>
                <TabsTrigger value="completed">Terminés</TabsTrigger>
                <TabsTrigger value="cancelled">Annulés</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : appointments.length === 0 ? (
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Aucun rendez-vous</CardTitle>
                      <CardDescription>
                        {activeTab === 'scheduled'
                          ? "Vous n'avez pas de rendez-vous programmés."
                          : activeTab === 'completed'
                          ? "Vous n'avez pas de rendez-vous terminés."
                          : "Vous n'avez pas de rendez-vous annulés."}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{appointment.request?.title || 'Rendez-vous'}</CardTitle>
                              <CardDescription>
                                {appointment.request?.category || 'Service'}
                              </CardDescription>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${getStatusColor(appointment.status)} text-white border-0`}
                            >
                              {appointment.status === 'scheduled' ? 'Programmé' : 
                               appointment.status === 'completed' ? 'Terminé' : 'Annulé'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center text-sm">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              <span>
                                {format(new Date(appointment.appointment_date), 'PPP', { locale: fr })}
                              </span>
                              <Clock className="ml-4 mr-2 h-4 w-4" />
                              <span>
                                {format(new Date(appointment.appointment_date), 'HH:mm')}
                              </span>
                            </div>
                            
                            {appointment.location && (
                              <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4" />
                                <span>{appointment.location}</span>
                              </div>
                            )}
                            
                            <div className="pt-2 border-t">
                              <h4 className="text-sm font-medium mb-2">
                                {roles.includes('vendor') ? 'Client' : 'Prestataire'}
                              </h4>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage 
                                    src={roles.includes('vendor') 
                                      ? appointment.client?.avatar_url || '' 
                                      : appointment.vendor?.avatar_url || ''} 
                                  />
                                  <AvatarFallback>
                                    {roles.includes('vendor')
                                      ? getInitials(appointment.client?.first_name, appointment.client?.last_name)
                                      : getInitials(appointment.vendor?.first_name, appointment.vendor?.last_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  {roles.includes('vendor') ? (
                                    <p className="text-sm font-medium">
                                      {appointment.client?.first_name} {appointment.client?.last_name}
                                    </p>
                                  ) : (
                                    <>
                                      <p className="text-sm font-medium">
                                        {appointment.vendor?.business_name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {appointment.vendor?.first_name} {appointment.vendor?.last_name}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {appointment.notes && (
                              <div className="pt-2 border-t">
                                <h4 className="text-sm font-medium mb-1">Notes</h4>
                                <p className="text-sm">{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        {activeTab === 'scheduled' && (
                          <CardFooter className="justify-between">
                            <Button 
                              variant="destructive" 
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              Annuler
                            </Button>
                            <Button 
                              variant="default"
                              onClick={() => handleCompleteAppointment(appointment.id)}
                            >
                              Marquer comme terminé
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Nouveau rendez-vous</CardTitle>
                <CardDescription>
                  Planifiez un nouveau rendez-vous
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP', { locale: fr }) : <span>Sélectionner une date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Heure</label>
                  <select 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                      <React.Fragment key={hour}>
                        <option value={`${hour}:00`}>{`${hour}:00`}</option>
                        <option value={`${hour}:30`}>{`${hour}:30`}</option>
                      </React.Fragment>
                    ))}
                  </select>
                </div>
                
                {!roles.includes('vendor') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prestataire</label>
                    <select 
                      value={selectedVendorId || ''}
                      onChange={(e) => setSelectedVendorId(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Sélectionner un prestataire</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.business_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {roles.includes('vendor') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Demande de service</label>
                    <select 
                      value={selectedRequestId || ''}
                      onChange={(e) => setSelectedRequestId(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Sélectionner une demande</option>
                      {requests.map(request => (
                        <option key={request.id} value={request.id}>
                          {request.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lieu (facultatif)</label>
                  <input 
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Adresse ou lieu de rendez-vous"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (facultatif)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Informations supplémentaires..."
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleCreateAppointment}
                  disabled={creatingAppointment}
                >
                  {creatingAppointment && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Créer le rendez-vous
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
