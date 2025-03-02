import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import PropertyCard from '@/components/PropertyCard';
import { mockProperties } from '@/data/mockProperties';
import { MapPin, Users, Calendar, MessageCircle, Share2, Flag, Home, FileText, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Community {
  id: string;
  name: string;
  location: string;
  propertyCount: number;
  residentCount: number;
  description: string;
  image: string;
}

const CommunityDetails = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('properties');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: '1', user: 'John Doe', text: 'Great community!', createdAt: '2023-01-01' },
    { id: '2', user: 'Jane Smith', text: 'Looking forward to joining.', createdAt: '2023-01-02' }
  ]);

  const [community, setCommunity] = useState<Community>({
    id: '1',
    name: 'Riverside Gardens',
    location: 'Accra, Ghana',
    propertyCount: 45,
    residentCount: 120,
    description: 'A beautiful riverside community with modern amenities and 24/7 security.',
    image: 'https://images.unsplash.com/photo-1543373072-69f3d4788832?q=80&w=774&auto=format&fit=crop'
  });

  const handlePostComment = () => {
    if (comment.trim() !== '') {
      const newComment = {
        id: String(comments.length + 1),
        user: 'Current User',
        text: comment,
        createdAt: new Date().toLocaleDateString()
      };
      setComments([...comments, newComment]);
      setComment('');
      toast({
        title: "Comment Posted",
        description: "Your comment has been added to the community discussion.",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Community Details Section */}
          <div className="md:col-span-2">
            <div className="relative rounded-md overflow-hidden">
              <img
                src={community.image}
                alt={community.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4 text-white">
                <h1 className="text-2xl font-bold">{community.name}</h1>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{community.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Tabs defaultValue="about" className="w-full">
                <TabsList>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                  <TabsTrigger value="discussion">Discussion</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">About {community.name}</h2>
                  <p className="text-muted-foreground">{community.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{community.residentCount} Residents</span>
                    </div>
                    <div className="flex items-center">
                      <Home className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{community.propertyCount} Properties</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="properties" className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">Properties in {community.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="discussion" className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">Community Discussion</h2>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{comment.user}</div>
                          <div className="text-sm text-muted-foreground">{comment.createdAt}</div>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://github.com/shadcn.png" alt="Your Avatar" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 border rounded-md p-2"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <Button onClick={handlePostComment}>
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="members" className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">Community Members</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5].map((member) => (
                      <div key={member} className="flex items-center space-x-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://i.pravatar.cc/150?img=${member}`} alt={`Member ${member}`} />
                          <AvatarFallback>M{member}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Member {member}</p>
                          <p className="text-sm text-muted-foreground">Active Now</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Community Actions Section */}
          <div>
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-semibold mb-2">Community Actions</h3>
              <Button className="w-full mb-2">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Community Manager
              </Button>
              <Button className="w-full mb-2">
                <Share2 className="h-4 w-4 mr-2" />
                Share Community
              </Button>
              <Button variant="outline" className="w-full">
                <Flag className="h-4 w-4 mr-2" />
                Report Community
              </Button>
            </div>
            <div className="mt-4 border rounded-md p-4">
              <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
              {[1, 2].map((event) => (
                <div key={event} className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Event {event} - Date</span>
                </div>
              ))}
              <Button variant="link">View All Events</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CommunityDetails;
