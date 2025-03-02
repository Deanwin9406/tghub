
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tab } from '@radix-ui/react-tabs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import PropertyCard from '@/components/PropertyCard';
import { motion } from 'framer-motion';
import { Star, Phone, Mail, MapPin, Home, Calendar, CheckCircle, MessageSquare, UserCheck } from 'lucide-react';

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  bio: string;
  address: string;
  city: string;
  country: string;
  verified: boolean;
  joined_date: string;
  rating: number;
  ratings_count: number;
  rating_breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  specialties: string[];
  languages: string[];
}

interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  size_sqm: number;
  main_image_url: string;
  status: string;
}

const fetchAgent = async (agentId: string): Promise<Agent> => {
  // In a real application, this would fetch from your Supabase database
  // For now, we return mock data
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', agentId)
    .single();

  if (error) throw error;

  return {
    ...data,
    bio: "Agent immobilier passionné avec plus de 5 ans d'expérience sur le marché immobilier togolais. Spécialiste des propriétés résidentielles et commerciales à Lomé et ses environs.",
    verified: true,
    joined_date: "2019-06-15",
    rating: 4.7,
    ratings_count: 42,
    rating_breakdown: {
      5: 28,
      4: 10,
      3: 3,
      2: 1,
      1: 0
    },
    specialties: ["Résidentiel", "Commercial", "Locations", "Investissement"],
    languages: ["Français", "Anglais", "Ewe"]
  };
};

const fetchAgentProperties = async (agentId: string): Promise<Property[]> => {
  // In a real application, fetch the agent's properties from Supabase
  // For now, return mock data
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `prop-${i}-${agentId}`,
    title: `Belle propriété ${i+1}`,
    price: 100000 + (i * 50000),
    address: `${i+1} Rue de l'Indépendance`,
    city: "Lomé",
    property_type: i % 2 === 0 ? "house" : "apartment",
    bedrooms: Math.floor(Math.random() * 5) + 1,
    bathrooms: Math.floor(Math.random() * 3) + 1,
    size_sqm: Math.floor(Math.random() * 200) + 50,
    main_image_url: `https://source.unsplash.com/random/800x600/?house&sig=${i}`,
    status: "available"
  }));
};

const fetchAgentReviews = async (agentId: string): Promise<Review[]> => {
  // In a real application, fetch reviews from Supabase
  // For now, return mock data
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `review-${i}-${agentId}`,
    user_id: `user-${i}`,
    user_name: `Client ${i+1}`,
    user_avatar: `https://source.unsplash.com/random/100x100/?portrait&sig=${i}`,
    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars mostly
    comment: "Très professionnel et attentif à nos besoins. Nous avons trouvé la maison parfaite grâce à son expertise.",
    created_at: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString() // Past few months
  }));
};

const AgentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("properties");

  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => fetchAgent(id!),
    enabled: !!id
  });

  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['agent-properties', id],
    queryFn: () => fetchAgentProperties(id!),
    enabled: !!id
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['agent-reviews', id],
    queryFn: () => fetchAgentReviews(id!),
    enabled: !!id && activeTab === "reviews"
  });
  
  // Animations
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (isLoadingAgent) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <Skeleton className="h-72 w-full rounded-lg" />
            </div>
            <div className="w-full md:w-2/3 space-y-6">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!agent) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Agent non trouvé</h1>
          <p className="text-muted-foreground mb-8">L'agent que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link to="/agents">
            <Button>Retour à la liste des agents</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const totalRatings = Object.values(agent.rating_breakdown).reduce((a, b) => a + b, 0);
  
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Agent sidebar */}
          <motion.div 
            className="w-full md:w-1/3"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card className="sticky top-24">
              <CardHeader className="pb-4 pt-6 text-center">
                <Avatar className="w-24 h-24 mx-auto border-4 border-background">
                  <AvatarImage src={agent.avatar_url} alt={`${agent.first_name} ${agent.last_name}`} />
                  <AvatarFallback className="text-xl">{agent.first_name?.[0]}{agent.last_name?.[0]}</AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4 flex items-center justify-center gap-1 text-xl">
                  {agent.first_name} {agent.last_name}
                  {agent.verified && (
                    <CheckCircle className="h-5 w-5 text-togo-green" />
                  )}
                </CardTitle>
                <CardDescription className="flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {agent.city || 'Lomé'}, {agent.country || 'Togo'}
                </CardDescription>
                
                <div className="flex items-center justify-center mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(agent.rating) 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : i < agent.rating
                            ? 'text-yellow-500 fill-yellow-500' // For partial stars
                            : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="text-sm ml-2 font-medium">{agent.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground ml-1">({agent.ratings_count} avis)</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{agent.email || 'contact@togoprop.com'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{agent.phone || '+228 90 12 34 56'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Home className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{properties?.length || 0} propriétés</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>Membre depuis {new Date(agent.joined_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Spécialités</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.specialties.map((specialty, i) => (
                      <Badge key={i} variant="outline" className="bg-primary/5">{specialty}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Langues</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.languages.map((language, i) => (
                      <Badge key={i} variant="secondary" className="bg-secondary/50">{language}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 flex flex-col space-y-2">
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" /> Contacter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Main content */}
          <div className="w-full md:w-2/3">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{agent.bio}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">
                  <Home className="h-4 w-4 mr-2" /> Propriétés
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  <Star className="h-4 w-4 mr-2" /> Avis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="properties" className="mt-6">
                {isLoadingProperties ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full rounded-lg" />
                    ))}
                  </div>
                ) : properties && properties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.map((property) => (
                      <Link to={`/property/${property.id}`} key={property.id}>
                        <PropertyCard
                          id={property.id}
                          title={property.title}
                          price={property.price}
                          priceUnit="XOF"
                          type={property.property_type as any}
                          purpose="sale"
                          location={`${property.city}`}
                          beds={property.bedrooms}
                          baths={property.bathrooms}
                          area={property.size_sqm}
                          image={property.main_image_url}
                          featured={false}
                          new={false}
                        />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Cet agent n'a pas de propriétés listées actuellement.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Évaluations et avis</CardTitle>
                    <CardDescription>
                      Basé sur {agent.ratings_count} avis clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2">{agent.rating.toFixed(1)}</div>
                        <div className="flex justify-center mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${
                                i < Math.floor(agent.rating) 
                                  ? 'text-yellow-500 fill-yellow-500' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">{agent.ratings_count} avis</div>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        {Object.entries(agent.rating_breakdown)
                          .sort((a, b) => Number(b[0]) - Number(a[0]))
                          .map(([rating, count]) => (
                            <div key={rating} className="flex items-center gap-2">
                              <div className="w-8 text-right">{rating}</div>
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <Progress 
                                value={(count / totalRatings) * 100} 
                                className="h-2 flex-1" 
                              />
                              <div className="w-8 text-sm text-muted-foreground">{count}</div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    
                    <div className="border-t pt-6 space-y-6">
                      {isLoadingReviews ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-1/3" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-2/3" />
                            </div>
                          </div>
                        ))
                      ) : reviews && reviews.length > 0 ? (
                        reviews.map((review) => (
                          <div key={review.id} className="pb-6 border-b last:border-b-0">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarImage src={review.user_avatar} alt={review.user_name} />
                                <AvatarFallback>{review.user_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{review.user_name}</h4>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                                <div className="flex my-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3.5 w-3.5 ${
                                        i < review.rating 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {review.comment}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Aucun avis pour cet agent pour le moment.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentProfile;
