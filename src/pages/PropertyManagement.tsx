
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Home, CircleDollarSign, Wrench, Bell, MessageSquare, User, Users, Download } from 'lucide-react';

const PropertyManagement = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Gestion Immobilière</h1>
            <p className="text-muted-foreground">
              Gérez vos propriétés, paiements, et communications avec les locataires
            </p>
          </motion.div>
          
          <Tabs defaultValue="tenant" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3 mb-8">
              <TabsTrigger value="tenant">Espace Locataire</TabsTrigger>
              <TabsTrigger value="landlord">Espace Propriétaire</TabsTrigger>
              <TabsTrigger value="community">Communauté</TabsTrigger>
            </TabsList>
            
            {/* Tenant Dashboard */}
            <TabsContent value="tenant">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-lg font-medium">Paiements</CardTitle>
                      <CircleDollarSign className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Prochain paiement</p>
                        <p className="text-2xl font-bold">150,000 XOF</p>
                        <p className="text-sm text-muted-foreground">Échéance: 15 Juin 2025</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          À venir
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Payer Maintenant</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-lg font-medium">Maintenance</CardTitle>
                      <Wrench className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Vous avez 2 demandes en cours</p>
                        <ul className="space-y-1">
                          <li className="text-sm flex justify-between">
                            <span>Réparation robinet</span>
                            <Badge>En cours</Badge>
                          </li>
                          <li className="text-sm flex justify-between">
                            <span>Problème électrique</span>
                            <Badge variant="outline">En attente</Badge>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Nouvelle Demande</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-lg font-medium">Communications</CardTitle>
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Messages récents</p>
                        <div className="border rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Kouassi Jean (Propriétaire)</p>
                          <p className="text-sm">Visite prévue la semaine prochaine...</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Tous les Messages</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-medium mb-4">Documents</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Contrat de bail</p>
                        <p className="text-sm text-muted-foreground">Signé le 15/01/2025</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Télécharger</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Quittance - Mai 2025</p>
                        <p className="text-sm text-muted-foreground">Payé le 28/04/2025</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Télécharger</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Landlord Dashboard */}
            <TabsContent value="landlord">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold">4</CardTitle>
                    <CardDescription>Propriétés gérées</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Building className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold">12</CardTitle>
                    <CardDescription>Locataires actifs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold">1,250,000 XOF</CardTitle>
                    <CardDescription>Revenus mensuels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold">3</CardTitle>
                    <CardDescription>Demandes en attente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-medium">Mes Propriétés</h3>
                  <Button>Ajouter une propriété</Button>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid md:grid-cols-5 gap-4 p-4 items-center">
                      <div className="md:col-span-2 flex gap-4 items-center">
                        <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center">
                          <Home className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">Résidence Bel Air</h4>
                          <p className="text-sm text-muted-foreground">Lomé, Adidogomé</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Revenus</p>
                        <p className="font-medium">350,000 XOF/mois</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Occupation</p>
                        <p className="font-medium">4/5 unités</p>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">Gérer</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid md:grid-cols-5 gap-4 p-4 items-center">
                      <div className="md:col-span-2 flex gap-4 items-center">
                        <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center">
                          <Home className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">Villa Principale</h4>
                          <p className="text-sm text-muted-foreground">Lomé, Agbalépédogan</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Revenus</p>
                        <p className="font-medium">600,000 XOF/mois</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Occupation</p>
                        <p className="font-medium">1/1 unités</p>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">Gérer</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-medium mb-4">Paiements récents</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 font-medium text-sm">
                  <div>Locataire</div>
                  <div>Propriété</div>
                  <div>Montant</div>
                  <div>Date</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Kokou Ametokodo</span>
                    </div>
                    <div>Résidence Bel Air</div>
                    <div>150,000 XOF</div>
                    <div>10/05/2025</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Abla Akakpo</span>
                    </div>
                    <div>Résidence Bel Air</div>
                    <div>120,000 XOF</div>
                    <div>05/05/2025</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Yao Mensah</span>
                    </div>
                    <div>Villa Principale</div>
                    <div>600,000 XOF</div>
                    <div>01/05/2025</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Community Dashboard */}
            <TabsContent value="community">
              <div className="text-center py-16">
                <h3 className="text-2xl font-medium mb-2">Forum Communautaire</h3>
                <p className="text-muted-foreground mb-8">
                  Échangez avec les autres membres de la communauté immobilière
                </p>
                <p className="mb-6">Le forum communautaire sera disponible prochainement!</p>
                <Button>S'inscrire pour être notifié</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyManagement;
