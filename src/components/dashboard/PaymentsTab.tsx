
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentLease {
  property: {
    title: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  payment_date: string | null;
  lease: PaymentLease;
}

interface PaymentsTabProps {
  payments?: Payment[];
}

const PaymentsTab = ({ payments: initialPayments }: PaymentsTabProps) => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>(initialPayments || []);
  const [loading, setLoading] = useState(!initialPayments);
  
  useEffect(() => {
    if (!initialPayments && user) {
      fetchPayments();
    }
  }, [user, roles]);
  
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // We need to construct a query based on the user's role
      let query = supabase
        .from('payments')
        .select(`
          id,
          amount,
          status,
          due_date,
          payment_date,
          lease:lease_id (
            property:property_id (
              title
            )
          )
        `)
        .order('due_date', { ascending: false })
        .limit(5);
      
      // If the user is a tenant, we want to show payments for their leases
      if (roles.includes('tenant')) {
        // First find all leases where the user is the tenant
        const { data: leases, error: leaseError } = await supabase
          .from('leases')
          .select('id')
          .eq('tenant_id', user?.id);
        
        if (leaseError) throw leaseError;
        
        if (leases && leases.length > 0) {
          const leaseIds = leases.map(lease => lease.id);
          query = query.in('lease_id', leaseIds);
        } else {
          // If no leases found, return empty array
          setPayments([]);
          setLoading(false);
          return;
        }
      }
      // If the user is a landlord, we want to show payments for their properties
      else if (roles.includes('landlord')) {
        // First find all properties where the user is the owner
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user?.id);
        
        if (propError) throw propError;
        
        if (properties && properties.length > 0) {
          // Then find all leases for these properties
          const propertyIds = properties.map(prop => prop.id);
          const { data: leases, error: leaseError } = await supabase
            .from('leases')
            .select('id')
            .in('property_id', propertyIds);
          
          if (leaseError) throw leaseError;
          
          if (leases && leases.length > 0) {
            const leaseIds = leases.map(lease => lease.id);
            query = query.in('lease_id', leaseIds);
          } else {
            // If no leases found, return empty array
            setPayments([]);
            setLoading(false);
            return;
          }
        } else {
          // If no properties found, return empty array
          setPayments([]);
          setLoading(false);
          return;
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match our component's expected format
      const formattedPayments = data.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        due_date: payment.due_date,
        payment_date: payment.payment_date,
        lease: {
          property: {
            title: payment.lease?.property?.title || 'Unknown Property'
          }
        }
      }));
      
      setPayments(formattedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paiements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Paiements récents</CardTitle>
          <Button size="sm" onClick={() => navigate('/payments')}>
            Voir tout
          </Button>
        </div>
        <CardDescription>Derniers paiements effectués</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Chargement des paiements...</p>
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
            <CreditCard className="h-8 w-8 mb-2" />
            <p>Aucun paiement récent.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                <div>
                  <p className="font-medium">Paiement: ${payment.amount}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.lease.property.title}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{payment.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => navigate('/payments')}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsTab;
