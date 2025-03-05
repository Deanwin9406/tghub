
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Tenant {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  status: string | null;
  tenant_since: string | null;
  tenant_rating: number | null;
}

interface TenantProperty {
  property_id: string;
  property_title: string;
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  lease_status: string;
}

const Tenants = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantProperties, setTenantProperties] = useState<Record<string, TenantProperty[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTenants();
    }
  }, [user]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'tenant');

      // For landlords, only show tenants of their properties
      if (roles.includes('landlord')) {
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user!.id);

        if (propError) throw propError;

        if (properties && properties.length > 0) {
          const propertyIds = properties.map(p => p.id);
          
          const { data: leases, error: leaseError } = await supabase
            .from('leases')
            .select('tenant_id')
            .in('property_id', propertyIds);
            
          if (leaseError) throw leaseError;
          
          if (leases && leases.length > 0) {
            const tenantIds = [...new Set(leases.map(l => l.tenant_id))];
            query = query.in('id', tenantIds);
          } else {
            setTenants([]);
            setLoading(false);
            return;
          }
        } else {
          setTenants([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setTenants(data as Tenant[]);
      
      // Fetch property information for each tenant
      if (data && data.length > 0) {
        await fetchTenantProperties(data.map(t => t.id));
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de charger les informations des locataires",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantProperties = async (tenantIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          tenant_id,
          property_id,
          start_date,
          end_date,
          monthly_rent,
          status,
          properties:property_id (title)
        `)
        .in('tenant_id', tenantIds);

      if (error) throw error;

      const propertiesByTenant: Record<string, TenantProperty[]> = {};
      
      data.forEach(lease => {
        const tenantId = lease.tenant_id;
        if (!propertiesByTenant[tenantId]) {
          propertiesByTenant[tenantId] = [];
        }
        
        propertiesByTenant[tenantId].push({
          property_id: lease.property_id,
          property_title: lease.properties?.title || 'Propriété inconnue',
          lease_start_date: lease.start_date,
          lease_end_date: lease.end_date,
          monthly_rent: lease.monthly_rent,
          lease_status: lease.status
        });
      });
      
      setTenantProperties(propertiesByTenant);
    } catch (error) {
      console.error('Error fetching tenant properties:', error);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  const getStatusColor = (status: string | null): string => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Locataires</h1>
          <Button onClick={() => navigate('/add-tenant')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un locataire
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tenants.length === 0 ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Aucun locataire</CardTitle>
              <CardDescription>
                Vous n'avez pas encore de locataires. Ajoutez-en un pour commencer.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <Card key={tenant.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tenant.avatar_url || ''} alt={`${tenant.first_name} ${tenant.last_name}`} />
                      <AvatarFallback>{getInitials(tenant.first_name, tenant.last_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{tenant.first_name} {tenant.last_name}</CardTitle>
                      <CardDescription>{tenant.email}</CardDescription>
                    </div>
                    {tenant.status && (
                      <Badge 
                        variant="outline" 
                        className="ml-auto"
                      >
                        <span 
                          className={`rounded-full h-2 w-2 mr-1 ${getStatusColor(tenant.status)}`} 
                        />
                        {tenant.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    {tenant.phone && (
                      <p className="flex items-center">
                        <span className="font-medium mr-2">Téléphone:</span> {tenant.phone}
                      </p>
                    )}
                    {tenant.tenant_since && (
                      <p className="flex items-center">
                        <span className="font-medium mr-2">Locataire depuis:</span> 
                        {new Date(tenant.tenant_since).toLocaleDateString()}
                      </p>
                    )}
                    
                    {tenantProperties[tenant.id] && tenantProperties[tenant.id].length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Propriétés louées:</h4>
                        <ul className="space-y-2">
                          {tenantProperties[tenant.id].map((property, idx) => (
                            <li key={idx} className="text-xs p-2 bg-muted rounded-md">
                              <p className="font-medium">{property.property_title}</p>
                              <p>Loyer: {property.monthly_rent.toLocaleString()} XOF</p>
                              <div className="flex justify-between mt-1">
                                <span>
                                  {new Date(property.lease_start_date).toLocaleDateString()} - {new Date(property.lease_end_date).toLocaleDateString()}
                                </span>
                                <Badge variant="outline">{property.lease_status}</Badge>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/messages?tenant=${tenant.id}`)}
                      >
                        Contacter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tenants;
