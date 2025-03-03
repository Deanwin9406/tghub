
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, User, Building, Check, X } from 'lucide-react';

interface Appointment {
  id: string;
  client_id: string;
  appointment_date: string;
  location: string;
  notes: string;
  status: string;
  proposal_id: string | null;
  client?: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  proposal?: {
    request_id: string;
    price: number;
    request?: {
      title: string;
      property_id: string;
      property?: {
        title: string;
        address: string;
        city: string;
      };
    };
  };
}

const VendorAppointmentsTab = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments for the current vendor
      const { data, error } = await supabase
        .from('service_appointments')
        .select(`
          *,
          client:client_id(
            first_name,
            last_name,
            phone,
            email
          ),
          proposal:proposal_id(
            request_id,
            price,
            request:request_id(
              title,
              property_id,
              property:property_id(
                title,
                address,
                city
              )
            )
          )
        `)
        .eq('vendor_id', user?.id)
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      
      setAppointments(data || []);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('service_appointments')
        .update({
          status: updateData.status,
          notes: updateData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppointment.id);
      
      if (error) throw error;
      
      toast({
        title: 'Appointment Updated',
        description: 'The appointment status has been updated successfully.',
      });
      
      // Update the appointments list
      fetchAppointments();
      
      // Close the dialog
      setUpdateDialogOpen(false);
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the appointment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openUpdateDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setUpdateData({
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setUpdateDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 border-blue-200">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 border-red-200">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge variant="outline" className="bg-amber-50 border-amber-200">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filterAppointments = (status: string) => {
    if (status === 'upcoming') {
      return appointments.filter(app => 
        ['scheduled', 'rescheduled'].includes(app.status) && 
        new Date(app.appointment_date) >= new Date()
      );
    } else if (status === 'past') {
      return appointments.filter(app => 
        app.status === 'completed' || new Date(app.appointment_date) < new Date()
      );
    } else if (status === 'cancelled') {
      return appointments.filter(app => app.status === 'cancelled');
    }
    return appointments;
  };

  return (
    <>
      <div className="space-y-4">
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 bg-muted">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAppointments} 
            className="mb-4"
          >
            Refresh
          </Button>
          
          {['upcoming', 'past', 'cancelled', 'all'].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filterAppointments(tabValue).length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filterAppointments(tabValue).map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {appointment.proposal?.request?.title || "Service Appointment"}
                          </CardTitle>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(parseISO(appointment.appointment_date), 'MMMM d, yyyy')}
                            </span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>
                              {format(parseISO(appointment.appointment_date), 'h:mm a')}
                            </span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 gap-1 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {appointment.client 
                                ? `${appointment.client.first_name} ${appointment.client.last_name}`
                                : "Unknown client"}
                            </span>
                          </div>
                          
                          {appointment.client?.phone && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Phone:</span>
                              <span>{appointment.client.phone}</span>
                            </div>
                          )}
                          
                          {appointment.client?.email && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Email:</span>
                              <span>{appointment.client.email}</span>
                            </div>
                          )}
                          
                          {appointment.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{appointment.location}</span>
                            </div>
                          )}
                          
                          {appointment.proposal?.request?.property && (
                            <div className="flex items-center gap-1 mt-1">
                              <Building className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {appointment.proposal.request.property.address}, 
                                {appointment.proposal.request.property.city}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-2 pt-2 border-t text-sm">
                            <span className="text-muted-foreground">Notes:</span>
                            <p>{appointment.notes}</p>
                          </div>
                        )}
                        
                        {appointment.proposal?.price && (
                          <div className="mt-2 pt-2 border-t text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Service Price:</span>
                              <span className="font-medium">${appointment.proposal.price}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0">
                        {['scheduled', 'rescheduled'].includes(appointment.status) && (
                          <Button 
                            className="w-full" 
                            onClick={() => openUpdateDialog(appointment)}
                          >
                            Update Status
                          </Button>
                        )}
                        
                        {['completed', 'cancelled'].includes(appointment.status) && (
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => openUpdateDialog(appointment)}
                          >
                            View Details
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No appointments found</h3>
                  <p className="text-muted-foreground max-w-md mt-2">
                    {tabValue === 'upcoming' 
                      ? "You don't have any upcoming appointments scheduled." 
                      : tabValue === 'past'
                      ? "You don't have any past appointments."
                      : tabValue === 'cancelled'
                      ? "You don't have any cancelled appointments."
                      : "You don't have any appointments yet."}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Update Appointment Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>
              {selectedAppointment && format(parseISO(selectedAppointment.appointment_date), 'MMMM d, yyyy - h:mm a')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={updateData.status} 
                onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this appointment"
                rows={4}
                value={updateData.notes}
                onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateAppointment} disabled={submitting}>
              {submitting ? "Updating..." : "Update Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorAppointmentsTab;
