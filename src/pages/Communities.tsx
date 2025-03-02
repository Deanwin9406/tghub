
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Users, Building, Home } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  location: string;
  propertyCount: number;
  residentCount: number;
  description: string;
  image: string;
}

const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Riverside Gardens',
    location: 'Accra, Ghana',
    propertyCount: 45,
    residentCount: 120,
    description: 'A beautiful riverside community with modern amenities and 24/7 security.',
    image: 'https://images.unsplash.com/photo-1543373072-69f3d4788832?q=80&w=774&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Palm Heights',
    location: 'Kumasi, Ghana',
    propertyCount: 32,
    residentCount: 85,
    description: 'Luxury apartments surrounded by palm trees with swimming pools and fitness centers.',
    image: 'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?q=80&w=870&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Harmony Court',
    location: 'Takoradi, Ghana',
    propertyCount: 28,
    residentCount: 67,
    description: 'Family-friendly community with parks, playgrounds, and community events.',
    image: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=774&auto=format&fit=crop'
  }
];

const Communities = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredCommunities = mockCommunities.filter(community => 
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    community.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinCommunity = (communityName: string) => {
    toast({
      title: "Request Sent",
      description: `Your request to join ${communityName} has been submitted.`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Communities</h1>
            <p className="text-muted-foreground">Discover and join housing communities in Ghana</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80"
            />
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Communities</TabsTrigger>
            <TabsTrigger value="joined">My Communities</TabsTrigger>
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.length > 0 ? (
                filteredCommunities.map((community) => (
                  <CommunityCard 
                    key={community.id} 
                    community={community} 
                    onJoin={handleJoinCommunity} 
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-muted-foreground">No communities found matching your search.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="joined">
            <div className="text-center py-16">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Communities Joined Yet</h3>
              <p className="text-muted-foreground mb-4">You haven't joined any communities yet.</p>
              <Button onClick={() => setActiveTab('all')}>Browse Communities</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="nearby">
            <div className="text-center py-16">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Location Access Required</h3>
              <p className="text-muted-foreground mb-4">Please enable location access to see nearby communities.</p>
              <Button variant="outline">Enable Location</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const CommunityCard = ({ 
  community, 
  onJoin 
}: { 
  community: Community, 
  onJoin: (name: string) => void 
}) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={community.image} 
          alt={community.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      <CardHeader>
        <CardTitle>{community.name}</CardTitle>
        <CardDescription className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" /> {community.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{community.description}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{community.propertyCount} Properties</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{community.residentCount} Residents</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <a href={`/community/${community.id}`}>View Details</a>
        </Button>
        <Button onClick={() => onJoin(community.name)}>Join Community</Button>
      </CardFooter>
    </Card>
  );
};

export default Communities;
