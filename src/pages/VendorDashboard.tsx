
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Calendar, 
  ListTodo, 
  UserCircle, 
  Settings, 
  Wrench, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import VendorServiceRequestsTab from '@/components/vendor/VendorServiceRequestsTab';
import VendorAppointmentsTab from '@/components/vendor/VendorAppointmentsTab';
import VendorMessagesTab from '@/components/vendor/VendorMessagesTab';
import VendorProfileForm from '@/components/vendor/VendorProfileForm';

interface ServiceRequestsSummary {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
}

interface AppointmentsSummary {
  total: number;
  upcoming: number;
  today: number;
  completed: number;
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestsSummary>({
    total: 0,
    open: 0,
    in_progress: 0,
    completed: 0
  });
  const [appointments, setAppointments] = useState<AppointmentsSummary>({
    total: 0,
    upcoming: 0,
    today: 0,
    completed: 0
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [vendorProfile, setVendorProfile] = useState<any>(null);

  useEffect(() => {
    if (user && roles.includes('vendor')) {
      fetchDashboardData();
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the vendor dashboard",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, roles]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchServiceRequestsSummary(),
        fetchAppointmentsSummary(),
        fetchRecentRequests(),
        fetchUpcomingAppointments(),
        fetchVendorProfile()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceRequestsSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .select(`
          request_id,
          status,
          service_requests!inner(status)
        `)
        .eq('vendor_id', user!.id);

      if (error) throw error;

      const total = data?.length || 0;
      const open = data?.filter(p => p.service_requests.status === 'open').length || 0;
      const in_progress = data?.filter(p => p.service_requests.status === 'in_progress').length || 0;
      const completed = data?.filter(p => p.service_requests.status === 'completed').length || 0;

      setServiceRequests({ total, open, in_progress, completed });
    } catch (error) {
      console.error('Error fetching service requests summary:', error);
    }
  };

  const fetchAppointmentsSummary = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('service_appointments')
        .select('*')
        .eq('vendor_id', user!.id);

      if (error) throw error;

      const total = data?.length || 0;
      const upcoming = data?.filter(a => 
        (a.status === 'scheduled' || a.status === 'rescheduled') && 
        new Date(a.appointment_date) >= today
      ).length || 0;
      
      const todayAppointments = data?.filter(a => 
        (a.status === 'scheduled' || a.status === 'rescheduled') && 
        new Date(a.appointment_date).toDateString() === today.toDateString()
      ).length || 0;
      
      const completed = data?.filter(a => a.status === 'completed').length || 0;

      setAppointments({ 
        total, 
        upcoming, 
        today: todayAppointments, 
        completed 
      });
    } catch (error) {
      console.error('Error fetching appointments summary:', error);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .select(`
          id,
          status,
          created_at,
          price,
          service_requests!inner(
            id,
            title,
            status,
            category,
            urgency,
            requester_id,
            profiles:requester_id(first_name, last_name)
          )
        `)
        .eq('vendor_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentRequests(data || []);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('service_appointments')
        .select(`
          id,
          appointment_date,
          status,
          location,
          client_id,
          profiles:client_id(first_name, last_name),
          service_request:proposal_id(service_requests(title, category))
        `)
        .eq('vendor_id', user!.id)
        .in('status', ['scheduled', 'rescheduled'])
        .gte('appointment_date', today.toISOString())
        .order('appointment_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      
      // Process the data to format service request info
      const processedAppointments = data?.map(appt => {
        const serviceRequest = appt.service_request?.service_requests?.[0] || null;
        return {
          ...appt,
          service_request: serviceRequest
        };
      }) || [];

      setUpcomingAppointments(processedAppointments);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    }
  };

  const fetchVendorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, which is okay
          setVendorProfile(null);
        } else {
          throw error;
        }
      } else {
        setVendorProfile(data);
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'accepted':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>
        
        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Service Requests</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Service Requests</CardDescription>
                    <CardTitle className="text-2xl">{serviceRequests.total}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      <div className="flex justify-between">
                        <span>Open:</span>
                        <span>{serviceRequests.open}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In Progress:</span>
                        <span>{serviceRequests.in_progress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span>{serviceRequests.completed}</span>
                      </div>
                    </div>
                    <Progress 
                      className="h-2 mt-3" 
                      value={serviceRequests.total ? (serviceRequests.completed / serviceRequests.total) * 100 : 0} 
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Appointments</CardDescription>
                    <CardTitle className="text-2xl">{appointments.total}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      <div className="flex justify-between">
                        <span>Today:</span>
                        <span>{appointments.today}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Upcoming:</span>
                        <span>{appointments.upcoming}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span>{appointments.completed}</span>
                      </div>
                    </div>
                    <Progress 
                      className="h-2 mt-3" 
                      value={appointments.total ? (appointments.completed / appointments.total) * 100 : 0} 
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Profile Completion</CardDescription>
                    <CardTitle className="text-2xl">
                      {vendorProfile ? '100%' : '0%'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground mt-1">
                      {vendorProfile ? (
                        <p>Your vendor profile is complete</p>
                      ) : (
                        <p>You need to complete your vendor profile</p>
                      )}
                    </div>
                    <Progress 
                      className="h-2 mt-3" 
                      value={vendorProfile ? 100 : 0} 
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Quick Actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => navigate('/service-requests')}
                      >
                        <div className="flex items-center">
                          <ListTodo className="h-4 w-4 mr-2" />
                          <span>View Requests</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => navigate('/appointments')}
                      >
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Manage Appointments</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Service Requests</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('requests')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : recentRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <ListTodo className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
                      <p className="text-muted-foreground">No recent service requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{request.service_requests.title}</h3>
                              <p className="text-sm text-muted-foreground">{request.service_requests.category}</p>
                            </div>
                            <div>{getStatusBadge(request.status)}</div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              From: {request.service_requests.profiles.first_name} {request.service_requests.profiles.last_name}
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('appointments')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
                      <p className="text-muted-foreground">No upcoming appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => {
                        const appointmentDate = new Date(appointment.appointment_date);
                        const isToday = new Date().toDateString() === appointmentDate.toDateString();
                        
                        return (
                          <div key={appointment.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">
                                  {appointment.service_request?.title || "Service Appointment"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.service_request?.category || "General Service"}
                                </p>
                              </div>
                              {isToday && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="mb-2 flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>
                                {appointmentDate.toLocaleDateString()} at {
                                  appointmentDate.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                }
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Client: {appointment.profiles.first_name} {appointment.profiles.last_name}
                              </span>
                              {appointment.location && (
                                <span className="text-muted-foreground truncate max-w-[150px]">
                                  {appointment.location}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="requests">
            <VendorServiceRequestsTab />
          </TabsContent>
          
          <TabsContent value="appointments">
            <VendorAppointmentsTab />
          </TabsContent>
          
          <TabsContent value="messages">
            <VendorMessagesTab />
          </TabsContent>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Profile</CardTitle>
                <CardDescription>
                  Manage your profile information and service details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VendorProfileForm existingProfile={vendorProfile} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
