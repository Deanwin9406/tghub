
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { MapPin, Mail, Phone, Calendar, Star, Check, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AgentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  
  // Mock agent data for demonstration
  const agent = {
    id: id,
    name: "David Amegbor",
    role: "Agent Immobilier Senior",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    email: "david.amegbor@togoprop.com",
    phone: "+228 90 12 34 56",
    location: "Lomé, Togo",
    bio: "Agent immobilier avec plus de 10 ans d'expérience dans la vente et la location de propriétés de luxe à Lomé et ses environs. Spécialisé dans les propriétés résidentielles et commerciales haut de gamme.",
    joined: "2018-05-12",
    listings: 48,
    sold: 124,
    rating: 4.8,
    verified: true,
    specialties: ["Propriétés de luxe", "Investissement locatif", "Bureaux commerciaux"],
    languages: ["Français", "Anglais", "Éwé"]
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-2xl"></div>
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded-xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm mb-8">
          <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/40"></div>
          <div className="p-8 -mt-16 relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl absolute -mt-16">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="ml-36">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{agent.name}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-muted-foreground">{agent.role}</p>
                    {agent.verified && (
                      <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
                        <Check size={12} className="mr-1" /> Vérifié
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Phone size={16} className="mr-2" />
                    Appeler
                  </Button>
                  <Button size="sm">
                    <Mail size={16} className="mr-2" />
                    Contacter
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  {agent.location}
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="mr-1" />
                  {agent.email}
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="mr-1" />
                  {agent.phone}
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Membre depuis {new Date(agent.joined).getFullYear()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="about">
              <TabsList className="w-full grid grid-cols-3 mb-8">
                <TabsTrigger value="about">À propos</TabsTrigger>
                <TabsTrigger value="properties">Propriétés</TabsTrigger>
                <TabsTrigger value="reviews">Avis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{agent.bio}</p>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Spécialités</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {agent.specialties.map((specialty, i) => (
                          <li key={i} className="flex items-center">
                            <Check size={16} className="text-primary mr-2" />
                            {specialty}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Langues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {agent.languages.map((language, i) => (
                          <li key={i} className="flex items-center">
                            <Check size={16} className="text-primary mr-2" />
                            {language}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="properties">
                <Card>
                  <CardHeader>
                    <CardTitle>Propriétés en vente</CardTitle>
                    <CardDescription>
                      Consultez les propriétés actuellement proposées par cet agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center py-8 text-muted-foreground">
                      Les propriétés seront chargées ici
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Avis clients</CardTitle>
                    <CardDescription>
                      Ce que les clients disent de cet agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center py-8 text-muted-foreground">
                      Les avis seront chargés ici
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star size={16} className="text-yellow-500 mr-2" />
                    <span>Note</span>
                  </div>
                  <span className="font-medium">{agent.rating}/5.0</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Building size={16} className="text-primary mr-2" />
                    <span>Propriétés en vente</span>
                  </div>
                  <span className="font-medium">{agent.listings}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2" />
                    <span>Propriétés vendues</span>
                  </div>
                  <span className="font-medium">{agent.sold}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentProfile;
