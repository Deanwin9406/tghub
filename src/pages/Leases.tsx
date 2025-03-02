import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { FileText, Users, Calendar, DollarSign, CheckCircle2, Clock, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Lease {
  id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  status: string;
  property: {
    title: string;
    address: string;
    city: string;
  };
  tenant: {
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
}

// Function to safely get tenant name
const getTenantName = (lease: Lease): string => {
  if (!lease.tenant) return 'Tenant inconnu';
  return `${lease.tenant?.first_name || ''} ${lease.tenant?.last_name || ''}`.trim() || 'Tenant inconnu';
};

const Leases = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [leases, setLeases] = useState<Lease[]>([]);

  const isLandlord = roles.includes('landlord');
  const isTenant = roles.includes('tenant');

  const { data, error, isLoading } = useQuery({
    queryKey: ['user-leases', user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('leases')
        .select(`
          id,
          start_date,
          end_date,
          rent_amount,
          status,
          property:properties (
            title,
            address,
            city
          ),
          tenant:profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order('start_date', { ascending: false });

      if (isTenant) {
        query = query.eq('tenant_id', user.id);
      } else if (isLandlord) {
        query = query.eq('landlord_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching leases:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les baux. Veuillez réessayer.",
        });
        return [];
      }

      return (Array.isArray(data) ? data : []) as Lease[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (data) {
      setLeases(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-4">Baux</h1>
          <p>Chargement des baux...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-4">Baux</h1>
          <p>Erreur lors du chargement des baux.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Baux</h1>
            <p className="text-muted-foreground">
              Aperçu de vos contrats de location
            </p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button size="sm">
              <Users className="mr-2 h-4 w-4" />
              Gérer les locataires
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              <ClipboardList className="mr-2 h-4 w-4" />
              Tous les baux
            </TabsTrigger>
            <TabsTrigger value="active">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Actif
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              En attente
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Tous les baux</CardTitle>
                <CardDescription>
                  Aperçu de tous vos contrats de location
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2" />
                    <p>Aucun bail trouvé.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leases.map((lease) => (
                      <Card key={lease.id} className="bg-muted">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">
                            {lease.property.title}
                          </CardTitle>
                          <CardDescription>
                            {lease.property.address}, {lease.property.city}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            <Calendar className="mr-2 inline-block h-4 w-4" />
                            {format(new Date(lease.start_date), 'dd/MM/yyyy')} -{' '}
                            {format(new Date(lease.end_date), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-sm">
                            <DollarSign className="mr-2 inline-block h-4 w-4" />
                            {lease.rent_amount}
                          </p>
                          <p className="text-sm">
                            <Users className="mr-2 inline-block h-4 w-4" />
                            Locataire: {getTenantName(lease)}
                          </p>
                          <Badge variant="secondary">{lease.status}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Baux actifs</CardTitle>
                <CardDescription>
                  Aperçu de vos contrats de location actifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leases.filter(lease => lease.status === 'active').length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mb-2" />
                    <p>Aucun bail actif trouvé.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leases.filter(lease => lease.status === 'active').map((lease) => (
                      <Card key={lease.id} className="bg-muted">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">
                            {lease.property.title}
                          </CardTitle>
                          <CardDescription>
                            {lease.property.address}, {lease.property.city}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            <Calendar className="mr-2 inline-block h-4 w-4" />
                            {format(new Date(lease.start_date), 'dd/MM/yyyy')} -{' '}
                            {format(new Date(lease.end_date), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-sm">
                            <DollarSign className="mr-2 inline-block h-4 w-4" />
                            {lease.rent_amount}
                          </p>
                           <p className="text-sm">
                            <Users className="mr-2 inline-block h-4 w-4" />
                            Locataire: {getTenantName(lease)}
                          </p>
                          <Badge variant="secondary">{lease.status}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Baux en attente</CardTitle>
                <CardDescription>
                  Aperçu de vos contrats de location en attente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leases.filter(lease => lease.status === 'pending').length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mb-2" />
                    <p>Aucun bail en attente trouvé.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leases.filter(lease => lease.status === 'pending').map((lease) => (
                      <Card key={lease.id} className="bg-muted">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">
                            {lease.property.title}
                          </CardTitle>
                          <CardDescription>
                            {lease.property.address}, {lease.property.city}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            <Calendar className="mr-2 inline-block h-4 w-4" />
                            {format(new Date(lease.start_date), 'dd/MM/yyyy')} -{' '}
                            {format(new Date(lease.end_date), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-sm">
                            <DollarSign className="mr-2 inline-block h-4 w-4" />
                            {lease.rent_amount}
                          </p>
                           <p className="text-sm">
                            <Users className="mr-2 inline-block h-4 w-4" />
                            Locataire: {getTenantName(lease)}
                          </p>
                          <Badge variant="secondary">{lease.status}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Leases;
