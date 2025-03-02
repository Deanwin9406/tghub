
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Wrench } from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: string;
  created_at: string;
  property: {
    title: string;
  };
}

interface MaintenanceTabProps {
  maintenanceRequests: MaintenanceRequest[];
}

const MaintenanceTab = ({ maintenanceRequests }: MaintenanceTabProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Demandes de maintenance</CardTitle>
          <Button size="sm" onClick={() => navigate('/maintenance')}>
            Voir tout
          </Button>
        </div>
        <CardDescription>Dernières demandes de maintenance</CardDescription>
      </CardHeader>
      <CardContent>
        {maintenanceRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
            <Wrench className="h-8 w-8 mb-2" />
            <p>Aucune demande de maintenance.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {maintenanceRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                <div>
                  <p className="font-medium">{request.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.property.title}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{request.status}</Badge>
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

export default MaintenanceTab;
