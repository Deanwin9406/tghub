
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, Download, CheckCircle2, Clock, AlertCircle, Filter, 
  ArrowUpDown, Search, CalendarIcon, ExternalLink 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const mockPayments = [
  {
    id: 'INV-001',
    type: 'rent',
    amount: 950,
    status: 'paid',
    date: '2023-05-01',
    dueDate: '2023-05-05',
    paymentMethod: 'card',
    propertyName: 'Appartement Avenue Victor Hugo'
  },
  {
    id: 'INV-002',
    type: 'rent',
    amount: 950,
    status: 'paid',
    date: '2023-06-03',
    dueDate: '2023-06-05',
    paymentMethod: 'bank',
    propertyName: 'Appartement Avenue Victor Hugo'
  },
  {
    id: 'INV-003',
    type: 'rent',
    amount: 950,
    status: 'pending',
    date: null,
    dueDate: '2023-07-05',
    paymentMethod: null,
    propertyName: 'Appartement Avenue Victor Hugo'
  },
  {
    id: 'INV-004',
    type: 'deposit',
    amount: 1900,
    status: 'paid',
    date: '2023-01-15',
    dueDate: '2023-01-15',
    paymentMethod: 'bank',
    propertyName: 'Appartement Avenue Victor Hugo'
  },
  {
    id: 'INV-005',
    type: 'maintenance',
    amount: 120,
    status: 'paid',
    date: '2023-04-22',
    dueDate: '2023-04-25',
    paymentMethod: 'card',
    propertyName: 'Appartement Avenue Victor Hugo',
    description: 'Réparation plomberie'
  },
  {
    id: 'INV-006',
    type: 'rent',
    amount: 950,
    status: 'overdue',
    date: null,
    dueDate: '2023-04-05',
    paymentMethod: null,
    propertyName: 'Appartement Avenue Victor Hugo'
  }
];

// Payment methods mock
const paymentMethods = [
  {
    id: 'card1',
    type: 'card',
    label: 'Visa •••• 4242',
    expires: '05/2026',
    isDefault: true
  },
  {
    id: 'bank1',
    type: 'bank',
    label: 'Compte Bancaire •••• 6789',
    bank: 'BNP Paribas',
    isDefault: false
  }
];

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [date, setDate] = useState<Date | undefined>(undefined);

  const statusConfig = {
    paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    overdue: { color: 'bg-red-100 text-red-700', icon: AlertCircle }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const filteredPayments = mockPayments.filter(payment => {
    // Search filter
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.description && payment.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    // Type filter
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    
    // Payment method filter
    const matchesPaymentMethod = 
      paymentMethodFilter === 'all' || 
      payment.paymentMethod === paymentMethodFilter;
    
    // Date filter
    const matchesDate = 
      !date || 
      (payment.date && format(new Date(payment.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) ||
      (payment.dueDate && format(new Date(payment.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    
    return matchesSearch && matchesStatus && matchesType && matchesPaymentMethod && matchesDate;
  });

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Paiements</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance actuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0,00 €</div>
              <p className="text-xs text-muted-foreground">
                Tout est à jour
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Prochain paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">950,00 €</div>
              <p className="text-xs text-muted-foreground">
                Dû le 5 juillet 2023
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Payer maintenant
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dépôt de garantie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1 900,00 €</div>
              <p className="text-xs text-muted-foreground">
                Payé le 15 janvier 2023
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total payé (année)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4 870,00 €</div>
              <p className="text-xs text-muted-foreground">
                6 paiements en 2023
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Télécharger les reçus
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Tabs defaultValue="history" className="mb-6">
          <TabsList>
            <TabsTrigger value="history">Historique des paiements</TabsTrigger>
            <TabsTrigger value="methods">Méthodes de paiement</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des paiements</CardTitle>
                <CardDescription>
                  Consultez l'historique de tous vos paiements et factures.
                </CardDescription>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="overdue">En retard</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="rent">Loyer</SelectItem>
                      <SelectItem value="deposit">Dépôt</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'dd/MM/yyyy') : <span>Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        locale={fr}
                        initialFocus
                      />
                      {date && (
                        <div className="p-3 border-t">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setDate(undefined)}
                            className="w-full"
                          >
                            Effacer
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-1 md:grid-cols-6 p-4 font-medium bg-muted/50">
                    <div>Référence</div>
                    <div>Date</div>
                    <div>Type</div>
                    <div>Montant</div>
                    <div>Statut</div>
                    <div></div>
                  </div>
                  
                  <Separator />
                  
                  {filteredPayments.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Aucun paiement trouvé.
                    </div>
                  ) : (
                    filteredPayments.map((payment) => (
                      <div key={payment.id}>
                        <div className="grid grid-cols-1 md:grid-cols-6 p-4 items-center">
                          <div className="font-medium">{payment.id}</div>
                          <div>
                            {payment.date 
                              ? format(new Date(payment.date), 'dd MMM yyyy', { locale: fr })
                              : <span className="text-muted-foreground">-</span>
                            }
                          </div>
                          <div>
                            {payment.type === 'rent' && 'Loyer'}
                            {payment.type === 'deposit' && 'Dépôt'}
                            {payment.type === 'maintenance' && 'Maintenance'}
                          </div>
                          <div className="font-medium">{formatAmount(payment.amount)}</div>
                          <div>
                            <Badge 
                              variant="outline" 
                              className={`${statusConfig[payment.status as keyof typeof statusConfig].color} flex w-fit items-center gap-1`}
                            >
                              {React.createElement(statusConfig[payment.status as keyof typeof statusConfig].icon, { className: "h-3 w-3" })}
                              {payment.status === 'paid' && 'Payé'}
                              {payment.status === 'pending' && 'En attente'}
                              {payment.status === 'overdue' && 'En retard'}
                            </Badge>
                          </div>
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm">
                              Détails
                            </Button>
                            {payment.status === 'paid' && (
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {(payment.status === 'pending' || payment.status === 'overdue') && (
                              <Button size="sm">
                                Payer
                              </Button>
                            )}
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <CardTitle>Méthodes de paiement</CardTitle>
                <CardDescription>
                  Gérez vos méthodes de paiement pour les transactions futures.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <Card key={method.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {method.type === 'card' ? (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                <CreditCard className="h-5 w-5 text-primary" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{method.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {method.type === 'card' 
                                  ? `Expire le ${method.expires}` 
                                  : method.bank
                                }
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {method.isDefault && (
                              <Badge variant="outline" className="mr-2">
                                Par défaut
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm">
                              Modifier
                            </Button>
                            {!method.isDefault && (
                              <Button variant="ghost" size="sm">
                                Définir par défaut
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button className="w-full">
                    Ajouter une méthode de paiement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de paiement</CardTitle>
                <CardDescription>
                  Configurez vos préférences pour les paiements automatiques.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Les paiements automatiques vous permettent de payer votre loyer à temps sans y penser.
                </p>
                
                <div className="space-y-6">
                  <div className="flex flex-col space-y-1.5">
                    <h3 className="font-medium">Paiements automatiques</h3>
                    <p className="text-sm text-muted-foreground">
                      Activez les paiements automatiques pour votre loyer mensuel
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <Button variant="outline">Activer les paiements automatiques</Button>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                        Désactivé
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col space-y-1.5">
                    <h3 className="font-medium">Notifications de paiement</h3>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications avant l'échéance de vos paiements
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <Select defaultValue="3">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 jour avant</SelectItem>
                            <SelectItem value="3">3 jours avant</SelectItem>
                            <SelectItem value="5">5 jours avant</SelectItem>
                            <SelectItem value="7">7 jours avant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Activé
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col space-y-1.5">
                    <h3 className="font-medium">Reçus de paiement</h3>
                    <p className="text-sm text-muted-foreground">
                      Recevez automatiquement des reçus après chaque paiement
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <Button variant="outline">Désactiver</Button>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Activé
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Payments;
