import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, CreditCard, FileText, Filter, AlertTriangle, DollarSign, Clock, Calendar, Download, Receipt, CheckCircle, Send, ArrowUp, Search, Landmark } from 'lucide-react';

const Payments = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('all');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock payments data
  const [payments, setPayments] = useState([
    {
      id: '1',
      property: 'Villa Olympique 24',
      tenant: 'John Doe',
      amount: 750,
      currency: 'USD',
      dueDate: '2023-07-01',
      paymentDate: '2023-06-30',
      status: 'paid',
      leaseAgreement: 'lease123.pdf',
    },
    {
      id: '2',
      property: 'Appartement Hédzranawoe',
      tenant: 'Jane Smith',
      amount: 600,
      currency: 'USD',
      dueDate: '2023-07-15',
      paymentDate: null,
      status: 'pending',
      leaseAgreement: 'lease456.pdf',
    },
    {
      id: '3',
      property: 'Villa Olympique 24',
      tenant: 'John Doe',
      amount: 750,
      currency: 'USD',
      dueDate: '2023-06-01',
      paymentDate: '2023-05-31',
      status: 'paid',
      leaseAgreement: 'lease123.pdf',
    },
    {
      id: '4',
      property: 'Appartement Hédzranawoe',
      tenant: 'Jane Smith',
      amount: 600,
      currency: 'USD',
      dueDate: '2023-06-15',
      paymentDate: '2023-06-14',
      status: 'paid',
      leaseAgreement: 'lease456.pdf',
    },
  ]);

  const filteredPayments = activeTab === 'all'
    ? payments
    : payments.filter(payment => payment.status === activeTab);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Paiements</h1>
          <div className="space-x-2 mt-4 md:mt-0">
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Filtrer les paiements</DialogTitle>
                  <DialogDescription>
                    Sélectionnez les critères de filtrage des paiements.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Statut
                    </Label>
                    <Input id="status" value="Payé" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Appliquer les filtres</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Ajouter un paiement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un paiement</DialogTitle>
                  <DialogDescription>
                    Enregistrez un nouveau paiement dans le système.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Montant
                    </Label>
                    <Input type="number" id="amount" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input type="date" id="date" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Enregistrer le paiement</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="px-4">
              Tous
            </TabsTrigger>
            <TabsTrigger value="pending" className="px-4">
              En attente
            </TabsTrigger>
            <TabsTrigger value="paid" className="px-4">
              Payés
            </TabsTrigger>
            <TabsTrigger value="overdue" className="px-4">
              En retard
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-2">
            {filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun paiement trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Il n'y a aucun paiement correspondant aux critères sélectionnés.
                  </p>
                  <Button onClick={() => setIsAddPaymentDialogOpen(true)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ajouter un paiement
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPayments.map((payment) => (
                  <Card key={payment.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{payment.property}</CardTitle>
                        <Badge variant={payment.status === 'paid' ? 'secondary' : payment.status === 'pending' ? 'default' : 'outline'}>
                          {payment.status}
                        </Badge>
                      </div>
                      <CardDescription>Locataire: {payment.tenant}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Montant:</span>
                          <p className="font-medium">{payment.amount} {payment.currency}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date d'échéance:</span>
                          <p className="font-medium">{formatDate(payment.dueDate)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date de paiement:</span>
                          <p className="font-medium">{payment.paymentDate ? formatDate(payment.paymentDate) : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contrat de location:</span>
                          <p className="font-medium">
                            <a href={`#${payment.leaseAgreement}`} className="hover:underline">
                              Voir le contrat
                            </a>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="pending" className="mt-2">
            {filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun paiement en attente</h3>
                  <p className="text-muted-foreground mb-4">
                    Il n'y a aucun paiement en attente correspondant aux critères sélectionnés.
                  </p>
                  <Button onClick={() => setIsAddPaymentDialogOpen(true)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ajouter un paiement
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPayments.map((payment) => (
                  <Card key={payment.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{payment.property}</CardTitle>
                        <Badge variant={payment.status === 'paid' ? 'secondary' : payment.status === 'pending' ? 'default' : 'outline'}>
                          {payment.status}
                        </Badge>
                      </div>
                      <CardDescription>Locataire: {payment.tenant}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Montant:</span>
                          <p className="font-medium">{payment.amount} {payment.currency}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date d'échéance:</span>
                          <p className="font-medium">{formatDate(payment.dueDate)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date de paiement:</span>
                          <p className="font-medium">{payment.paymentDate ? formatDate(payment.paymentDate) : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contrat de location:</span>
                          <p className="font-medium">
                            <a href={`#${payment.leaseAgreement}`} className="hover:underline">
                              Voir le contrat
                            </a>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="paid" className="mt-2">
            {filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun paiement payé</h3>
                  <p className="text-muted-foreground mb-4">
                    Il n'y a aucun paiement payé correspondant aux critères sélectionnés.
                  </p>
                  <Button onClick={() => setIsAddPaymentDialogOpen(true)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ajouter un paiement
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPayments.map((payment) => (
                  <Card key={payment.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{payment.property}</CardTitle>
                        <Badge variant={payment.status === 'paid' ? 'secondary' : payment.status === 'pending' ? 'default' : 'outline'}>
                          {payment.status}
                        </Badge>
                      </div>
                      <CardDescription>Locataire: {payment.tenant}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Montant:</span>
                          <p className="font-medium">{payment.amount} {payment.currency}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date d'échéance:</span>
                          <p className="font-medium">{formatDate(payment.dueDate)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date de paiement:</span>
                          <p className="font-medium">{payment.paymentDate ? formatDate(payment.paymentDate) : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contrat de location:</span>
                          <p className="font-medium">
                            <a href={`#${payment.leaseAgreement}`} className="hover:underline">
                              Voir le contrat
                            </a>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="overdue" className="mt-2">
            {filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun paiement en retard</h3>
                  <p className="text-muted-foreground mb-4">
                    Il n'y a aucun paiement en retard correspondant aux critères sélectionnés.
                  </p>
                  <Button onClick={() => setIsAddPaymentDialogOpen(true)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ajouter un paiement
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPayments.map((payment) => (
                  <Card key={payment.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{payment.property}</CardTitle>
                        <Badge variant={payment.status === 'paid' ? 'secondary' : payment.status === 'pending' ? 'default' : 'outline'}>
                          {payment.status}
                        </Badge>
                      </div>
                      <CardDescription>Locataire: {payment.tenant}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Montant:</span>
                          <p className="font-medium">{payment.amount} {payment.currency}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date d'échéance:</span>
                          <p className="font-medium">{formatDate(payment.dueDate)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date de paiement:</span>
                          <p className="font-medium">{payment.paymentDate ? formatDate(payment.paymentDate) : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contrat de location:</span>
                          <p className="font-medium">
                            <a href={`#${payment.leaseAgreement}`} className="hover:underline">
                              Voir le contrat
                            </a>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Payments;
