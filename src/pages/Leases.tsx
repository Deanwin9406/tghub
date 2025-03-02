
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the Lease interface
interface Lease {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  status: string;
  contract_url?: string;
  created_at: string;
}

const Leases = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const { data, error } = await supabase
          .from('leases')
          .select('*');

        if (error) {
          throw error;
        }

        // Fix the type issue with leases data
        // Cast the data to the required type
        setLeases(data as Lease[]);
      } catch (error: any) {
        console.error('Error fetching leases:', error.message);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de récupérer les baux'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, [toast]);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Mes Baux</h1>
        
        {loading ? (
          <p>Chargement...</p>
        ) : leases.length > 0 ? (
          <div className="grid gap-6">
            {leases.map(lease => (
              <div key={lease.id} className="border rounded-lg p-4">
                <p>Bail ID: {lease.id}</p>
                <p>Loyer mensuel: {lease.monthly_rent}</p>
                <p>Date de début: {new Date(lease.start_date).toLocaleDateString()}</p>
                <p>Date de fin: {new Date(lease.end_date).toLocaleDateString()}</p>
                <p>Statut: {lease.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun bail trouvé</p>
        )}
      </div>
    </Layout>
  );
};

export default Leases;
