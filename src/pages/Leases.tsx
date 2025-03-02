import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, FileText, User, Building, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';

interface Property {
  title: string;
  address: string;
  city: string;
}

interface Tenant {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface Lease {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  monthly_rent: number;
  property: Property;
  tenant: Tenant | null;
}

// Function to safely get tenant name
const getTenantName = (lease: Lease): string => {
  if (!lease.tenant) return 'Tenant inconnu';
  return `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim() || 'Tenant inconnu';
};

const Leases = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const { user, roles } = useAuth();
  const { toast } = useToast();
  
  const isTenant = roles.includes('tenant');
  const isLandlord = roles.includes('landlord');

  const { data } = useQuery({
    queryKey: ['leases', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        let query = supabase
          .from('leases')
          .select(`
            id,
            start_date,
            end_date,
            monthly_rent,
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
          // Note: This assumes there's an owner_id in the properties table
          // that matches with properties linked to leases
          const { data: properties } = await supabase
            .from('properties')
            .select('id')
            .eq('owner_id', user.id);
          
          if (properties && properties.length > 0) {
            const propertyIds = properties.map(p => p.id);
            query = query.in('property_id', propertyIds);
          }
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

        // Safely transform and validate the data
        return Array.isArray(data) ? data.map(lease => ({
          id: lease.id,
          start_date: lease.start_date,
          end_date: lease.end_date,
          monthly_rent: lease.monthly_rent || 0,
          status: lease.status,
          property: lease.property || { title: 'Unknown', address: '', city: '' },
          tenant: lease.tenant || null
        })) : [];
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (data) {
      setLeases(data as Lease[]);
    }
  }, [data]);

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Date inconnue';
    }
  };

  const timeAgo = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
    } catch (error) {
      console.error("Error calculating time distance:", error);
      return 'Il y a longtemps';
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Contrats de location</h1>
            <p className="text-muted-foreground mt-1">
              Gérez tous vos contrats de location en un seul endroit
            </p>
          </div>
          
          {isLandlord && (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nouveau contrat
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des contrats</CardTitle>
          </CardHeader>
          <CardContent>
            {leases.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucun contrat de location trouvé.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propriété</TableHead>
                    <TableHead>Locataire</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Loyer mensuel</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leases.map((lease) => (
                    <TableRow key={lease.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground mr-1" />
                          {lease.property.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {lease.property.address}, {lease.property.city}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground mr-1" />
                          {getTenantName(lease)}
                        </div>
                        {lease.tenant?.email && (
                          <div className="text-xs text-muted-foreground">
                            {lease.tenant.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                          {formatDate(lease.start_date)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {timeAgo(lease.start_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                          {formatDate(lease.end_date)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {timeAgo(lease.end_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                          {lease.monthly_rent.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{lease.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Leases;
