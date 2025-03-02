
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Users, Building, Home, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCommunities, joinCommunity } from '@/services/communityService';
import { Community } from '@/types/community';
import CreateCommunityModal from '@/components/community/CreateCommunityModal';

const Communities = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const data = await fetchCommunities();
        setCommunities(data);
      } catch (error) {
        console.error("Error fetching communities:", error);
        // Fallback to mock data if API call fails
        setCommunities([
          {
            id: '1',
            name: 'Riverside Gardens',
            location: 'Accra, Ghana',
            property_count: 45,
            member_count: 120,
            description: 'A beautiful riverside community with modern amenities and 24/7 security.',
            image_url: 'https://images.unsplash.com/photo-1543373072-69f3d4788832?q=80&w=774&auto=format&fit=crop',
            created_by: '',
            created_at: '',
            updated_at: '',
            is_private: false
          },
          {
            id: '2',
            name: 'Palm Heights',
            location: 'Kumasi, Ghana',
            property_count: 32,
            member_count: 85,
            description: 'Luxury apartments surrounded by palm trees with swimming pools and fitness centers.',
            image_url: 'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?q=80&w=870&auto=format&fit=crop',
            created_by: '',
            created_at: '',
            updated_at: '',
            is_private: false
          },
          {
            id: '3',
            name: 'Harmony Court',
            location: 'Takoradi, Ghana',
            property_count: 28,
            member_count: 67,
            description: 'Family-friendly community with parks, playgrounds, and community events.',
            image_url: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=774&auto=format&fit=crop',
            created_by: '',
            created_at: '',
            updated_at: '',
            is_private: false
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunities();
  }, []);

  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (community.location && community.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleJoinCommunity = async (communityId: string, communityName: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join communities",
        variant: "destructive"
      });
      return;
    }

    try {
      await joinCommunity(communityId, user.id);
      toast({
        title: "Request Sent",
        description: `Your request to join ${communityName} has been submitted.`,
      });
    } catch (error) {
      console.error("Error joining community:", error);
      toast({
        title: "Failed to join",
        description: "An error occurred while trying to join the community.",
        variant: "destructive"
      });
    }
  };

  const handleCreateCommunitySuccess = (communityId: string) => {
    setShowCreateModal(false);
    
    // Refresh the communities list
    fetchCommunities().then(data => {
      setCommunities(data);
    }).catch(error => {
      console.error("Failed to refresh communities:", error);
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
          <div className="mt-4 md:mt-0 flex gap-2">
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80"
            />
            <Button onClick={() => setShowCreateModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Communities</TabsTrigger>
            <TabsTrigger value="joined">My Communities</TabsTrigger>
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(index => (
                  <Card key={index} className="overflow-hidden h-full flex flex-col opacity-60 animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardHeader>
                      <div className="h-5 bg-gray-200 w-1/2 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 w-1/3 rounded"></div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="h-4 bg-gray-200 w-full rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 w-2/3 rounded mb-4"></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="h-10 bg-gray-200 w-1/3 rounded"></div>
                      <div className="h-10 bg-gray-200 w-1/3 rounded"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community) => (
                  <CommunityCard 
                    key={community.id} 
                    community={community} 
                    onJoin={handleJoinCommunity} 
                  />
                ))}
              </div>
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No communities found matching your search.</p>
              </div>
            )}
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

      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateCommunitySuccess}
      />
    </Layout>
  );
};

const CommunityCard = ({ 
  community, 
  onJoin 
}: { 
  community: Community, 
  onJoin: (id: string, name: string) => void 
}) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={community.image_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1080&auto=format&fit=crop'}
          alt={community.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      <CardHeader>
        <CardTitle>{community.name}</CardTitle>
        <CardDescription className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" /> {community.location || "Unknown location"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">
          {community.description || "No description available."}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{community.property_count || 0} Properties</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{community.member_count || 0} Members</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to={`/communities/${community.id}`}>View Details</Link>
        </Button>
        <Button onClick={() => onJoin(community.id, community.name)}>Join Community</Button>
      </CardFooter>
    </Card>
  );
};

export default Communities;
