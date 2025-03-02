
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyTenantManagerProps {
  propertyId: string;
}

const PropertyTenantManager: React.FC<PropertyTenantManagerProps> = ({ propertyId }) => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        if (error) throw error;
        setUserRoles(data.map(role => role.role));
      } catch (error) {
        console.error('Error fetching user roles:', error);
      }
    };
    
    fetchUserRoles();
  }, [user]);
  
  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        // Get all leases for this property
        const { data: leases, error: leaseError } = await supabase
          .from('leases')
          .select('tenant_id, status')
          .eq('property_id', propertyId)
          .eq('status', 'active');
        
        if (leaseError) throw leaseError;
        
        if (leases && leases.length > 0) {
          // Get profiles for all tenants
          const tenantIds = leases.map(lease => lease.tenant_id);
          
          const { data: tenantProfiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, avatar_url')
            .in('id', tenantIds);
          
          if (profileError) throw profileError;
          setTenants(tenantProfiles || []);
        } else {
          setTenants([]);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (propertyId) {
      fetchTenants();
    }
  }, [propertyId]);
  
  const canManageTenants = () => {
    return userRoles.some(role => ['admin', 'owner', 'property_manager'].includes(role));
  };
  
  if (!canManageTenants()) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Gestion des Locataires
        </CardTitle>
        <CardDescription>
          Gérez les locataires pour cette propriété
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {tenants.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Locataires actuels</h3>
                {tenants.map(tenant => (
                  <div key={tenant.id} className="flex items-center space-x-3 p-3 rounded-md bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {tenant.avatar_url ? (
                        <img src={tenant.avatar_url} alt={`${tenant.first_name} ${tenant.last_name}`} className="h-10 w-10 rounded-full" />
                      ) : (
                        <Users className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tenant.first_name} {tenant.last_name}</p>
                      <p className="text-xs text-muted-foreground">{tenant.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun locataire pour cette propriété</p>
            )}
            
            <Link to={`/property/${propertyId}/add-tenant`}>
              <Button className="w-full mt-4">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un Locataire
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyTenantManager;
