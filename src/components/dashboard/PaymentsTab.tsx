
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CreditCard } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  payment_date: string | null;
  lease: {
    property: {
      title: string;
    };
  };
}

interface PaymentsTabProps {
  payments: Payment[];
}

const PaymentsTab = ({ payments }: PaymentsTabProps) => {
  const navigate = useNavigate();
  
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
        {payments.length === 0 ? (
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
                  <Button variant="ghost" size="icon">
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
