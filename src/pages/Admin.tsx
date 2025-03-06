
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  UserCheck, 
  Settings, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';

const Admin = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingVerifications: 0,
    activeLeases: 0
  });

  useEffect(() => {
    if (user && roles.includes('admin')) {
      fetchDashboardData();
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard",
        variant: "destructive"
      });
    }
  }, [user, roles]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch system stats
      const [
        { count: totalUsers }, 
        { count: totalProperties },
        { count: pendingVerifications },
        { count: activeLeases }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('kyc_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('leases').select('*', { count: 'exact', head: true }).eq('status', 'active')
      ]);
      
      setSystemStats({
        totalUsers: totalUsers || 0,
        totalProperties: totalProperties || 0,
        pendingVerifications: pendingVerifications || 0,
        activeLeases: activeLeases || 0
      });

      // Fetch pending KYC verifications
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select(`
          id,
          user_id,
          status,
          created_at,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (kycError) throw kycError;
      setPendingKyc(kycData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKycApproval = async (id: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({ status: approved ? 'approved' : 'rejected' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `KYC verification ${approved ? 'approved' : 'rejected'}`,
        variant: "default"
      });

      // Refresh the data
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast({
        title: "Error",
        description: "Failed to update KYC status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{systemStats.totalUsers}</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Properties</CardDescription>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{systemStats.totalProperties}</CardTitle>
                <Building className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Verifications</CardDescription>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{systemStats.pendingVerifications}</CardTitle>
                <UserCheck className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Leases</CardDescription>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{systemStats.activeLeases}</CardTitle>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
        </div>
        
        <Tabs defaultValue="verifications" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="verifications">KYC Verifications</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Pending KYC Verifications</CardTitle>
                <CardDescription>
                  Approve or reject user identity verifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingKyc.length > 0 ? (
                  <div className="space-y-4">
                    {pendingKyc.map((kyc) => (
                      <div key={kyc.id} className="flex items-center justify-between bg-muted/50 p-4 rounded-md">
                        <div>
                          <p className="font-medium">
                            {kyc.profiles?.first_name} {kyc.profiles?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {kyc.profiles?.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {new Date(kyc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleKycApproval(kyc.id, false)}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleKycApproval(kyc.id, true)}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <UserCheck className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No pending KYC verifications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Property Management</CardTitle>
                <CardDescription>
                  Manage property listings and verifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Building className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Property management tools coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage users, roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">User management tools coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure application settings and parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">System settings coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
