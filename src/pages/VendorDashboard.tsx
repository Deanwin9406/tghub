
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/dashboard/StatCard';
import { useToast } from '@/hooks/use-toast';
import { Clock, MessageCircle, Calendar, Briefcase, CheckCircle, DollarSign, Clock4 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import VendorServiceRequestsTab from '@/components/vendor/VendorServiceRequestsTab';
import VendorAppointmentsTab from '@/components/vendor/VendorAppointmentsTab';
import VendorMessagesTab from '@/components/vendor/VendorMessagesTab';
import VendorProfileForm from '@/components/vendor/VendorProfileForm';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    upcomingAppointments: 0,
    totalProposals: 0,
    proposalAcceptanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    if (user) {
      checkProfileStatus();
      fetchDashboardStats();
    }
  }, [user]);

  const checkProfileStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      
      // Check if profile has essential fields completed
      setProfileComplete(!!data && 
        !!data.business_name && 
        !!data.description && 
        data.services_offered.length > 0);
      
    } catch (error) {
      console.error('Error checking vendor profile:', error);
      setProfileComplete(false);
    }
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Get count of open service requests
      const { count: pendingRequestsCount, error: pendingError } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      
      if (pendingError) throw pendingError;
      
      // Get count of upcoming appointments
      const { count: appointmentsCount, error: appointmentsError } = await supabase
        .from('service_appointments')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user?.id)
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString());
      
      if (appointmentsError) throw appointmentsError;
      
      // Get total proposals and accepted proposals
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('service_proposals')
        .select('status')
        .eq('vendor_id', user?.id);
      
      if (proposalsError) throw proposalsError;
      
      const totalProposals = proposalsData?.length || 0;
      const acceptedProposals = proposalsData?.filter(p => p.status === 'accepted').length || 0;
      const acceptanceRate = totalProposals > 0 
        ? Math.round((acceptedProposals / totalProposals) * 100) 
        : 0;
      
      setStats({
        pendingRequests: pendingRequestsCount || 0,
        upcomingAppointments: appointmentsCount || 0,
        totalProposals: totalProposals,
        proposalAcceptanceRate: acceptanceRate
      });
      
    } catch (error) {
      console.error('Error fetching vendor dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
        
        {!profileComplete && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Complete Your Profile</CardTitle>
              <CardDescription>
                Complete your vendor profile to start receiving service requests and appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorProfileForm onComplete={() => setProfileComplete(true)} />
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Open Requests" 
            value={stats.pendingRequests.toString()} 
            description="Available service requests" 
            icon={Briefcase} 
          />
          <StatCard 
            title="Upcoming Appointments" 
            value={stats.upcomingAppointments.toString()} 
            description="Scheduled appointments" 
            icon={Calendar} 
          />
          <StatCard 
            title="Your Proposals" 
            value={stats.totalProposals.toString()} 
            description="Total proposals sent" 
            icon={CheckCircle} 
          />
          <StatCard 
            title="Acceptance Rate" 
            value={`${stats.proposalAcceptanceRate}%`} 
            description="Proposal success rate" 
            icon={DollarSign} 
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-4 h-auto">
            <TabsTrigger value="requests" className="py-2">
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Service Requests</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="py-2">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="py-2">
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="py-2">
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests" className="space-y-4">
            <VendorServiceRequestsTab />
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4">
            <VendorAppointmentsTab />
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-4">
            <VendorMessagesTab />
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Vendor Profile</CardTitle>
                <CardDescription>
                  Manage your vendor information, services, and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VendorProfileForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
