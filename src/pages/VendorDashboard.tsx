import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Building, Users, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

const VendorDashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord - Prestataire</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Aperçu des Tâches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center"><CalendarDays className="mr-2 h-5 w-5" /> Tâches</CardTitle>
              <CardDescription>Aperçu rapide de vos tâches actuelles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Tâches en attente:</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">3</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Tâches en cours:</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">5</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Tâches terminées:</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">12</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Propriétés Gérées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center"><Building className="mr-2 h-5 w-5" /> Propriétés</CardTitle>
              <CardDescription>Nombre de propriétés sous votre gestion.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">27</div>
              <p className="text-sm text-muted-foreground mt-2">
                Vous gérez actuellement 27 propriétés.
              </p>
            </CardContent>
          </Card>

          {/* Clients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center"><Users className="mr-2 h-5 w-5" /> Clients</CardTitle>
              <CardDescription>Nombre de clients avec lesquels vous travaillez.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">15</div>
              <p className="text-sm text-muted-foreground mt-2">
                Vous avez actuellement 15 clients actifs.
              </p>
            </CardContent>
          </Card>

          {/* Revenus */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center"><DollarSign className="mr-2 h-5 w-5" /> Revenus</CardTitle>
              <CardDescription>Vos revenus du mois courant.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-500">3,500 €</div>
              <p className="text-sm text-muted-foreground mt-2">
                Revenus générés ce mois-ci.
              </p>
            </CardContent>
          </Card>

          {/* Dernières Activités */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Dernières Activités</CardTitle>
              <CardDescription>Suivez vos dernières activités et mises à jour.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                  <span>Tâche #123 marquée comme terminée</span>
                </div>
                <span className="text-xs text-muted-foreground">Il y a 2 heures</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="text-yellow-500 mr-2 h-4 w-4" />
                  <span>Nouvelle tâche assignée #124</span>
                </div>
                <span className="text-xs text-muted-foreground">Il y a 5 heures</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="text-yellow-500 mr-2 h-4 w-4" />
                  <span>Demande d'approbation pour la tâche #125</span>
                </div>
                <span className="text-xs text-muted-foreground">Il y a 1 jour</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Rapides */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline">Voir les Tâches en Attente</Button>
            <Button variant="outline">Ajouter une Note à une Propriété</Button>
            <Button variant="outline">Contacter un Client</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
