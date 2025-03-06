
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
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
import { 
  format,
  isPast,
  isSameDay,
  isToday
} from 'date-fns';
import { 
  Loader2, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  notes: string | null;
  location: string | null;
  client_id: string;
  vendor_id: string;
  property_id: string | null;
  created_at: string;
  updated_at: string;
  proposal_id: string | null;
  client?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
  };
  vendor?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
  };
  property?: {
    title: string;
    address: string;
  };
  service_request?: {
    title: string;
    category: string;
  };
}

const Appointments = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('upcoming');
  const isVendor = roles.includes('vendor');

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (appointments.length > 0 && selectedDate) {
      filterAppointmentsByDate(selectedDate);
    }
  }, [appointments, selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('service_appointments')
        .select(`
          *,
          client:client_id(first_name, last_name, email, phone),
          vendor:vendor_id(first_name, last_name, email, phone),
          property:property_id(title, address),
          service_request:proposal_id(service_requests(title, category))
        `);

      // Filter based on user role
      if (isVendor) {
        query = query.eq('vendor_id', user!.id);
      } else {
        query = query.eq('client_id', user!.id);
      }

      // Apply status filter based on active tab
      if (activeTab === 'upcoming') {
        query = query.in('status', ['scheduled', 'rescheduled']);
      } else if (activeTab === 'completed') {
        query = query.eq('status', 'completed');
      } else if (activeTab === 'cancelled') {
        query = query.eq('status', 'cancelled');
      }

      // Order by appointment date
      query = query.order('appointment_date', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      // Process the data to format service request info
      const processedAppointments = data?.map(appt => {
        const serviceRequest = appt.service_request?.service_requests?.[0] || null;
        return {
          ...appt,
          service_request: serviceRequest
        };
      }) || [];

      setAppointments(processedAppointments);
      
      // Filter by currently selected date if any
      if (selectedDate) {
        filterAppointmentsByDate(selectedDate);
      } else {
        setFilteredAppointments(processedAppointments);
      }
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

  const filterAppointmentsByDate = (date: Date) => {
    const filtered = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      return isSameDay(appointmentDate, date);
    });
    setFilteredAppointments(filtered);
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('service_appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Appointment ${status === 'completed' ? 'marked as completed' : 'cancelled'}`,
      });

      // Refresh data
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appointment status',
        variant: 'destructive',
      });
    }
  };

  // Calendar date renderer to highlight dates with appointments
  const getDayWithAppointments = (date: Date) => {
    const hasAppointments = appointments.some(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      return isSameDay(appointmentDate, date);
    });

    const isInPast = isPast(date) && !isToday(date);

    return (
      <div className="relative">
        <div
          className={`w-full h-full rounded-full flex items-center justify-center ${
            hasAppointments && !isInPast
              ? 'bg-primary/10 font-medium text-primary'
              : ''
          } ${
            isInPast && !isToday(date) ? 'text-muted-foreground' : ''
          }`}
        >
          {date.getDate()}
        </div>
        {hasAppointments && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></div>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100">Scheduled</Badge>;
      case 'rescheduled':
        return <Badge variant="outline" className="bg-yellow-100">Rescheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Appointments</h1>
        
        <Tabs defaultValue="upcoming" onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderCalendarAndAppointments()}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderCalendarAndAppointments()}
            </div>
          </TabsContent>
          
          <TabsContent value="cancelled" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderCalendarAndAppointments()}
            </div>
          </TabsContent>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderCalendarAndAppointments()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );

  function renderCalendarAndAppointments() {
    return (
      <>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              selected={selectedDate}
              onSelect={setSelectedDate}
              mode="single"
              className="rounded-md border"
              components={{
                day: getDayWithAppointments,
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate ? (
                isToday(selectedDate) 
                  ? "Today's Appointments" 
                  : `Appointments for ${format(selectedDate, 'PPP')}`
              ) : (
                "All Appointments"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No appointments found</h3>
                <p className="text-muted-foreground mt-2">
                  {selectedDate 
                    ? `No appointments scheduled for ${format(selectedDate, 'PPP')}`
                    : "No appointments matched your criteria"
                  }
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                      isVendor={isVendor}
                      onStatusUpdate={updateAppointmentStatus}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </>
    );
  }
};

interface AppointmentCardProps {
  appointment: Appointment;
  isVendor: boolean;
  onStatusUpdate: (id: string, status: string) => Promise<void>;
}

const AppointmentCard = ({ appointment, isVendor, onStatusUpdate }: AppointmentCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const appointmentDate = new Date(appointment.appointment_date);
  const isPastAppointment = isPast(appointmentDate) && !isToday(appointmentDate);
  const isUpcoming = ['scheduled', 'rescheduled'].includes(appointment.status);
  
  const contactPerson = isVendor ? appointment.client : appointment.vendor;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">
              {appointment.service_request?.title || "Service Appointment"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {appointment.service_request?.category || "General Service"}
            </p>
          </div>
          <div>{getStatusBadge(appointment.status)}</div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              {format(appointmentDate, 'PPP')} at {format(appointmentDate, 'p')}
            </span>
          </div>
          
          {appointment.location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{appointment.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              {contactPerson?.first_name} {contactPerson?.last_name} • {contactPerson?.email}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsDetailsOpen(true)}
          >
            View Details
          </Button>
          
          {isUpcoming && !isPastAppointment && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              
              <Button
                size="sm"
                onClick={() => onStatusUpdate(appointment.id, 'completed')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {format(appointmentDate, 'PPP')} at {format(appointmentDate, 'p')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Service</h4>
              <p>{appointment.service_request?.title || "Service Appointment"}</p>
              <p className="text-sm text-muted-foreground">
                {appointment.service_request?.category || "General Service"}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-1">Status</h4>
              <div>{getStatusBadge(appointment.status)}</div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-1">
                {isVendor ? 'Client' : 'Service Provider'}
              </h4>
              <p>
                {contactPerson?.first_name} {contactPerson?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{contactPerson?.email}</p>
              {contactPerson?.phone && (
                <p className="text-sm text-muted-foreground">{contactPerson.phone}</p>
              )}
            </div>
            
            {appointment.location && (
              <div>
                <h4 className="font-medium text-sm mb-1">Location</h4>
                <p>{appointment.location}</p>
              </div>
            )}
            
            {appointment.notes && (
              <div>
                <h4 className="font-medium text-sm mb-1">Notes</h4>
                <p>{appointment.notes}</p>
              </div>
            )}
            
            {appointment.property && (
              <div>
                <h4 className="font-medium text-sm mb-1">Property</h4>
                <p>{appointment.property.title}</p>
                <p className="text-sm text-muted-foreground">{appointment.property.address}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {isUpcoming && !isPastAppointment ? (
              <div className="flex gap-2 w-full sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    onStatusUpdate(appointment.id, 'cancelled');
                    setIsDetailsOpen(false);
                  }}
                >
                  Cancel Appointment
                </Button>
                
                <Button
                  onClick={() => {
                    onStatusUpdate(appointment.id, 'completed');
                    setIsDetailsOpen(false);
                  }}
                >
                  Mark Completed
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
  
  function getStatusBadge(status: string) {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100">Scheduled</Badge>;
      case 'rescheduled':
        return <Badge variant="outline" className="bg-yellow-100">Rescheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }
};

export default Appointments;
