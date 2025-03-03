
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BriefcaseBusiness, ClipboardCheck, MessageSquare, Calendar } from 'lucide-react';
import VendorProfileForm from '@/components/vendor/VendorProfileForm';
import VendorServiceRequestsTab from '@/components/vendor/VendorServiceRequestsTab';
import VendorMessagesTab from '@/components/vendor/VendorMessagesTab';
import VendorAppointmentsTab from '@/components/vendor/VendorAppointmentsTab';
import { useNavigate } from 'react-router-dom';

interface VendorProfile {
  id: string;
  business_name: string;
  description: string | null;
  services_offered: string[];
}

const VendorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    openRequests: 0,
    activeAppointments: 0,
    pendingProposals: 0
  });

  useEffect(() => {
    if (user) {
      fetchVendorData();
    }
  }, [user]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendor profile
      const { data: profileData, error: profileError } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      if (profileData) {
        setVendorProfile({
          id: profileData.id,
          business_name: profileData.business_name,
          description: profileData.description,
          services_offered: profileData.services_offered
        });
      }
      
      // Get open service requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('status', 'open');
        
      if (requestsError) throw requestsError;
      
      // Get upcoming appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('service_appointments')
        .select('*')
        .eq('vendor_id', user!.id)
        .eq('status', 'scheduled');
        
      if (appointmentsError) throw appointmentsError;
      
      // Get pending proposals
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('service_proposals')
        .select('*')
        .eq('vendor_id', user!.id)
        .eq('status', 'pending');
        
      if (proposalsError) throw proposalsError;
      
      setStats({
        openRequests: requestsData?.length || 0,
        activeAppointments: appointmentsData?.length || 0,
        pendingProposals: proposalsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du tableau de bord',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord Prestataire</h1>
          <Button variant="outline" onClick={() => fetchVendorData()}>
            Actualiser
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !vendorProfile ? (
          <Card>
            <CardHeader>
              <CardTitle>Complétez votre profil</CardTitle>
              <CardDescription>
                Avant de commencer, vous devez configurer votre profil de prestataire.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorProfileForm />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Demandes de services
                  </CardTitle>
                  <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.openRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    Demandes ouvertes disponibles
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Propositions en attente
                  </CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingProposals}</div>
                  <p className="text-xs text-muted-foreground">
                    Propositions en attente de réponse
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Rendez-vous à venir
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeAppointments}</div>
                  <p className="text-xs text-muted-foreground">
                    Rendez-vous programmés
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="requests">Demandes</TabsTrigger>
                <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mon profil prestataire</CardTitle>
                    <CardDescription>
                      {vendorProfile.business_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <VendorProfileForm />
                  </CardContent>
                </Card>
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
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
};

export default VendorDashboard;
