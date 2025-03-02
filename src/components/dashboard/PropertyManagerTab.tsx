
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building, Users, CreditCard, Wrench, CalendarCheck, Clock, 
  AlertTriangle, CheckCircle, FileText, MessageSquare 
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  unit: string;
  status: 'active' | 'overdue' | 'eviction' | 'pending';
  leaseEnd: string;
  rentAmount: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

interface PropertyManagerTabProps {
  properties: any[];
  maintenanceRequests: any[];
}

const PropertyManagerTab = ({ properties, maintenanceRequests }: PropertyManagerTabProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tenants');
  
  // Mock data for tenants
  const mockTenants: Tenant[] = [
    {
      id: '1',
      name: 'Kofi Mensah',
      unit: 'Villa Olympique 24 - Apt 3B',
      status: 'active',
      leaseEnd: '2024-06-30',
      rentAmount: 750,
      paymentStatus: 'paid'
    },
    {
      id: '2',
      name: 'Ama Darko',
      unit: 'Appartement Hédzranawoe - Unit 12',
      status: 'overdue',
      leaseEnd: '2024-07-15',
      rentAmount: 600,
      paymentStatus: 'overdue'
    },
    {
      id: '3',
      name: 'Kwame Nkrumah',
      unit: 'Villa Olympique 24 - Apt 5A',
      status: 'active',
      leaseEnd: '2025-01-15',
      rentAmount: 850,
      paymentStatus: 'pending'
    }
  ];

  const getTenantStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Actif</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">En retard</Badge>;
      case 'eviction':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Procédure d'expulsion</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">En attente</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">En retard</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const upcomingRenewals = mockTenants
    .filter(tenant => {
      const leaseEndDate = new Date(tenant.leaseEnd);
      const currentDate = new Date();
      const differenceInDays = Math.ceil((leaseEndDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
      return differenceInDays <= 90 && differenceInDays > 0;
    })
    .sort((a, b) => new Date(a.leaseEnd).getTime() - new Date(b.leaseEnd).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <Building className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tenants</p>
                <p className="text-2xl font-bold">{mockTenants.filter(t => t.status === 'active').length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{mockTenants.filter(t => t.paymentStatus !== 'paid').length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance Issues</p>
                <p className="text-2xl font-bold">{maintenanceRequests.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tenants" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="tenants">Locataires</TabsTrigger>
          <TabsTrigger value="renewals">Renouvellements</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gestion des Locataires</CardTitle>
                <Button size="sm" onClick={() => navigate('/tenants/add')}>
                  Ajouter un Locataire
                </Button>
              </div>
              <CardDescription>Gérez vos locataires et leurs informations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Fin du bail</TableHead>
                    <TableHead>Loyer</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.unit}</TableCell>
                      <TableCell>{getTenantStatusBadge(tenant.status)}</TableCell>
                      <TableCell>{new Date(tenant.leaseEnd).toLocaleDateString()}</TableCell>
                      <TableCell>{tenant.rentAmount} XOF</TableCell>
                      <TableCell>{getPaymentStatusBadge(tenant.paymentStatus)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/tenants/${tenant.id}`)}>
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/tenants')}>
                Voir tous les locataires
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="renewals">
          <Card>
            <CardHeader>
              <CardTitle>Renouvellements à venir</CardTitle>
              <CardDescription>Baux expirant dans les 90 prochains jours</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingRenewals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                  <CalendarCheck className="h-8 w-8 mb-2" />
                  <p>Aucun renouvellement imminent.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingRenewals.map((tenant) => {
                    const daysRemaining = Math.ceil(
                      (new Date(tenant.leaseEnd).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                    );
                    
                    return (
                      <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-sm text-muted-foreground">{tenant.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Fin du bail: {new Date(tenant.leaseEnd).toLocaleDateString()}</p>
                          <p className={`text-sm font-medium ${
                            daysRemaining <= 30 ? 'text-red-600' : 'text-amber-600'
                          }`}>
                            {daysRemaining} jours restants
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Initier le renouvellement
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Demandes de maintenance</CardTitle>
                <Button size="sm" onClick={() => navigate('/maintenance')}>
                  Voir toutes les demandes
                </Button>
              </div>
              <CardDescription>Gérez les demandes de réparations et maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                  <Wrench className="h-8 w-8 mb-2" />
                  <p>Aucune demande de maintenance.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <div className="flex items-center">
                          {request.priority === 'high' && <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />}
                          <p className="font-medium">{request.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.property.title}</p>
                      </div>
                      <Badge
                        variant={
                          request.status === 'completed' ? 'secondary' :
                          request.status === 'in_progress' ? 'default' :
                          'outline'
                        }
                      >
                        {request.status.replace('_', ' ')}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/maintenance/${request.id}`)}>
                        Détails
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Documents et contrats</CardTitle>
                <Button size="sm">
                  Ajouter un document
                </Button>
              </div>
              <CardDescription>Gérez les baux et autres documents importants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mb-2" />
                <p>La gestion des documents sera disponible prochainement.</p>
                <Button variant="ghost" className="mt-4">Explorer la fonctionnalité</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyManagerTab;
