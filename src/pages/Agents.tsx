
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Search, Star, CheckCircle, MapPin } from 'lucide-react';

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  verified: boolean;
  rating: number;
  properties_count: number;
  city: string;
}

const fetchAgents = async (): Promise<Agent[]> => {
  // In a real application, you would fetch from Supabase with a join to user_roles
  // This is a mock implementation until the actual agent role is set up
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(12);

  if (error) throw error;

  // Mock some additional agent-specific fields
  return data.map((profile) => ({
    ...profile,
    verified: Math.random() > 0.3, // Random verification status
    rating: Math.floor(Math.random() * 5) + 1, // Random rating 1-5
    properties_count: Math.floor(Math.random() * 20) + 1, // Random properties count
  }));
};

const Agents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  });

  const filteredAgents = agents?.filter((agent) => {
    const fullName = `${agent.first_name} ${agent.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           (agent.city && agent.city.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Animation variants for staggered loading
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Nos Agents Immobiliers</h1>
            <p className="text-muted-foreground mt-2">
              Découvrez nos agents professionnels et trouvez le partenaire idéal pour votre projet immobilier
            </p>
          </div>
          <div className="relative w-full md:w-64 mt-4 md:mt-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un agent..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-4">
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Une erreur est survenue lors du chargement des agents.</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredAgents?.map((agent) => (
              <motion.div key={agent.id} variants={item}>
                <Link to={`/agents/${agent.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow overflow-hidden group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-14 w-14 border-2 border-primary/10">
                            <AvatarImage src={agent.avatar_url} alt={`${agent.first_name} ${agent.last_name}`} />
                            <AvatarFallback>{agent.first_name?.[0]}{agent.last_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              {agent.first_name} {agent.last_name}
                              {agent.verified && (
                                <CheckCircle className="h-4 w-4 ml-1 text-togo-green" />
                              )}
                            </CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{agent.city || 'Lomé, Togo'}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/5">
                          {agent.properties_count} propriétés
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < agent.rating 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm ml-2">{agent.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-sm mt-3 text-muted-foreground line-clamp-2">
                        Agent immobilier professionnel spécialisé dans les propriétés {agent.properties_count > 10 ? 'de luxe' : 'résidentielles'} à Lomé.
                      </p>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/30 pt-3">
                      <div className="w-full text-center text-sm font-medium text-primary group-hover:underline">
                        Voir le profil
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}

            {filteredAgents?.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p>Aucun agent ne correspond à votre recherche.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Agents;
