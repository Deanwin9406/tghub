import { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building, Clock, DollarSign, Users, List, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AgentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties');

  const { data: agentProperties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['agent-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('agent_properties')
        .select(`
          *,
          property:properties(*)
        `)
        .eq('agent_id', user.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load properties',
          variant: 'destructive',
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const { data: viewings, isLoading: viewingsLoading } = useQuery({
    queryKey: ['agent-viewings', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('viewings')
        .select(`
          *,
          property:properties(title, address),
          client:profiles(first_name, last_name, email, phone)
        `)
        .eq('agent_id', user.id)
        .order('viewing_date', { ascending: true });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load viewings',
          variant: 'destructive',
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const { data: commissions, isLoading: commissionsLoading } = useQuery({
    queryKey: ['agent-commissions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('agent_commissions')
        .select(`
          *,
          property:properties(title, address)
        `)
        .eq('agent_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load commissions',
          variant: 'destructive',
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const totalCommissions = commissions?.reduce((acc, commission) => {
    return acc + Number(commission.amount);
  }, 0);

  const upcomingViewings = viewings?.filter(viewing => {
    const viewingDate = new Date(viewing.viewing_date);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return viewingDate >= today && viewingDate <= nextWeek;
  });

  const propertiesByStatus = agentProperties?.reduce((acc, { property }) => {
    if (property?.status) {
      acc[property.status] = (acc[property.status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'rented':
        return 'secondary';
      case 'sold':
        return 'destructive';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const renderViewingClientInfo = (client: any) => {
    if (!client || (client as any).error) {
      return <div>No client information</div>;
    }
    
    return (
      <>
        <div>{client.first_name || ''} {client.last_name || ''}</div>
        <div className="text-sm text-muted-foreground">{client.email || ''}</div>
      </>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <div className="mt-4 md:mt-0 space-x-2">
            <Button onClick={() => navigate('/agent/properties/add')}>
              <Building className="mr-2 h-4 w-4" /> Add Property
            </Button>
            <Button variant="outline" onClick={() => navigate('/agent/viewings/schedule')}>
              <Calendar className="mr-2 h-4 w-4" /> Schedule Viewing
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-bold">{agentProperties?.length || 0}</p>
                </div>
                <Building className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Viewings</p>
                  <p className="text-2xl font-bold">{upcomingViewings?.length || 0}</p>
                </div>
                <CalendarCheck className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                  <p className="text-2xl font-bold">${totalCommissions?.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Commissions</p>
                  <p className="text-2xl font-bold">
                    {commissions?.filter(c => c.status === 'pending').length || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-primary/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="properties">
              <Building className="mr-2 h-4 w-4" /> Properties
            </TabsTrigger>
            <TabsTrigger value="viewings">
              <Calendar className="mr-2 h-4 w-4" /> Viewings
            </TabsTrigger>
            <TabsTrigger value="commissions">
              <DollarSign className="mr-2 h-4 w-4" /> Commissions
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="mr-2 h-4 w-4" /> Clients
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Managed Properties</CardTitle>
                  <Button onClick={() => navigate('/agent/properties/add')}>Add Property</Button>
                </div>
                <CardDescription>Properties you are currently managing</CardDescription>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="flex justify-center p-8">Loading properties...</div>
                ) : agentProperties?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Building className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No properties assigned</h3>
                    <p className="text-muted-foreground mt-2 mb-6">You don't have any properties assigned to you yet.</p>
                    <Button onClick={() => navigate('/agent/properties/add')}>Add Property</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agentProperties?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.property?.title}</div>
                            <div className="text-sm text-muted-foreground">{item.property?.address}</div>
                          </TableCell>
                          <TableCell>{item.property?.property_type}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(item.property?.status)}>
                              {item.property?.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${Number(item.property?.price).toLocaleString()}</TableCell>
                          <TableCell>{item.commission_percentage}%</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate(`/property/${item.property?.id}`)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/agent/properties/edit/${item.property?.id}`)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viewings">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Scheduled Viewings</CardTitle>
                  <Button onClick={() => navigate('/agent/viewings/schedule')}>Schedule Viewing</Button>
                </div>
                <CardDescription>Upcoming property viewings with clients</CardDescription>
              </CardHeader>
              <CardContent>
                {viewingsLoading ? (
                  <div className="flex justify-center p-8">Loading viewings...</div>
                ) : viewings?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No viewings scheduled</h3>
                    <p className="text-muted-foreground mt-2 mb-6">You don't have any viewings scheduled.</p>
                    <Button onClick={() => navigate('/agent/viewings/schedule')}>Schedule a Viewing</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewings?.map((viewing) => (
                        <TableRow key={viewing.id}>
                          <TableCell>
                            <div className="font-medium">{viewing.property?.title}</div>
                            <div className="text-sm text-muted-foreground">{viewing.property?.address}</div>
                          </TableCell>
                          <TableCell>
                            {renderViewingClientInfo(viewing.client)}
                          </TableCell>
                          <TableCell>
                            {new Date(viewing.viewing_date).toLocaleDateString()}, {' '}
                            {new Date(viewing.viewing_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(viewing.status)}>
                              {viewing.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/agent/viewings/${viewing.id}`)}
                            >
                              Details
                            </Button>
                            <Button 
                              variant={viewing.status === 'scheduled' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => navigate(`/agent/viewings/${viewing.id}/complete`)}
                              disabled={viewing.status !== 'scheduled'}
                            >
                              {viewing.status === 'scheduled' ? 'Complete' : 'Completed'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
                <CardDescription>Track your earnings from property transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {commissionsLoading ? (
                  <div className="flex justify-center p-8">Loading commissions...</div>
                ) : commissions?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No commissions yet</h3>
                    <p className="text-muted-foreground mt-2">
                      You haven't earned any commissions yet. Commissions will appear here when you complete property transactions.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Transaction Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions?.map((commission) => (
                        <TableRow key={commission.id}>
                          <TableCell>
                            <div className="font-medium">{commission.property?.title}</div>
                            <div className="text-sm text-muted-foreground">{commission.property?.address}</div>
                          </TableCell>
                          <TableCell className="capitalize">{commission.transaction_type}</TableCell>
                          <TableCell>{new Date(commission.transaction_date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">${Number(commission.amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(commission.status)}>
                              {commission.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Client Management</CardTitle>
                  <Button onClick={() => navigate('/agent/clients/add')}>Add Client</Button>
                </div>
                <CardDescription>Manage your clients and track interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Client Management Coming Soon</h3>
                  <p className="text-muted-foreground mt-2 mb-6">
                    The client management feature is under development and will be available soon.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/messages')}>
                    Go to Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AgentDashboard;
