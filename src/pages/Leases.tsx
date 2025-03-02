import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, FileText, AlertTriangle, Download, Home, CreditCard, User } from 'lucide-react';

const Leases = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: leases, isLoading, error } = useQuery({
    queryKey: ['leases', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          property:properties(title, address),
          tenant:profiles(first_name, last_name)
        `)
        .or(`tenant_id.eq.${user.id},property.owner_id.eq.${user.id}`)
        .order('start_date', { ascending: false });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load leases',
          variant: 'destructive',
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const filteredLeases = leases?.filter(lease => {
    const propertyTitle = lease.property?.title || '';
    const propertyAddress = lease.property?.address || '';
    const tenantName = `${lease.tenant?.first_name || ''} ${lease.tenant?.last_name || ''}`;

    return (
      propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenantName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderTenantInfo = (tenant: any) => {
    const isTenantError = tenant && typeof tenant === 'object' && 'error' in tenant;
    
    if (!tenant || isTenantError) {
      return <div className="flex items-center">
        <User className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>No tenant information</span>
      </div>;
    }

    let firstName = 'Unknown';
    let lastName = '';
    
    if (tenant && typeof tenant === 'object') {
      if ('first_name' in tenant && tenant.first_name !== null) {
        firstName = tenant.first_name;
      }
      if ('last_name' in tenant && tenant.last_name !== null) {
        lastName = tenant.last_name;
      }
    }

    return (
      <div className="flex items-center">
        <User className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{firstName} {lastName}</span>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">Leases</h1>
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search leases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80"
            />
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Leases</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="flex justify-center p-6">
                <p>Loading leases...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center p-6">
                <AlertTriangle className="h-6 w-6 mr-2 text-destructive" />
                <p className="text-destructive">Error: {error.message}</p>
              </div>
            ) : filteredLeases?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Leases Found</h3>
                  <p className="text-sm text-muted-foreground">
                    No leases match your search criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeases?.map(lease => (
                  <Card key={lease.id}>
                    <CardHeader>
                      <CardTitle>{lease.property?.title}</CardTitle>
                      <CardDescription>{lease.property?.address}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>Property: {lease.property?.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderTenantInfo(lease.tenant)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(lease.start_date).toLocaleDateString()} -{' '}
                          {new Date(lease.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>Monthly Rent: ${lease.monthly_rent}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>Deposit: ${lease.deposit_amount}</span>
                      </div>
                      <div>
                        Status: <Badge>{lease.status}</Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Contract
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            <p>Content for active leases goes here.</p>
          </TabsContent>

          <TabsContent value="expired">
            <p>Content for expired leases goes here.</p>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Leases;
