
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Building, Calendar, Shield, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PropertyCard } from '@/components/PropertyCard';
import { mockProperties } from '@/data/mockProperties';

// Mock data for a single community
const communityData = {
  id: '1',
  name: 'Riverside Gardens',
  location: 'Accra, Ghana',
  propertyCount: 45,
  residentCount: 120,
  description: 'A beautiful riverside community with modern amenities and 24/7 security. Residents enjoy access to swimming pools, fitness centers, and community events throughout the year.',
  image: 'https://images.unsplash.com/photo-1543373072-69f3d4788832?q=80&w=774&auto=format&fit=crop',
  established: '2018',
  amenities: ['Swimming Pool', 'Gym', 'Tennis Court', 'Playground', '24/7 Security', 'Community Center'],
  rules: [
    'Quiet hours from 10pm to 7am',
    'No pets over 40 pounds',
    'No smoking in common areas',
    'Garbage disposal according to schedule',
    'Guest parking limited to 2 days'
  ],
  events: [
    { id: '1', title: 'Community Cleanup Day', date: '2023-06-15', description: 'Join us for a day of community service and beautification.' },
    { id: '2', title: 'Summer Pool Party', date: '2023-07-04', description: 'Annual pool party with food, music, and games for all residents.' },
    { id: '3', title: 'Neighborhood Watch Meeting', date: '2023-07-15', description: 'Monthly security meeting for all community members.' }
  ]
};

const CommunityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isJoined, setIsJoined] = useState(false);

  // Mock properties filtered to those that would be in this community
  const communityProperties = mockProperties.slice(0, 3);

  const handleJoinCommunity = () => {
    setIsJoined(true);
    toast({
      title: "Success!",
      description: `You've joined ${communityData.name}.`,
    });
  };

  const handleReport = () => {
    toast({
      title: "Report Submitted",
      description: "Your report has been sent to the community managers.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {/* Hero section */}
        <div className="relative h-64 md:h-80 mb-8 rounded-lg overflow-hidden">
          <img 
            src={communityData.image} 
            alt={communityData.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{communityData.name}</h1>
              <div className="flex items-center mt-2">
                <MapPin className="h-5 w-5 mr-2" /> 
                <span>{communityData.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Community info & actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About This Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6">{communityData.description}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <Users className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-lg font-semibold">{communityData.residentCount}</span>
                    <span className="text-sm text-muted-foreground">Residents</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <Building className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-lg font-semibold">{communityData.propertyCount}</span>
                    <span className="text-sm text-muted-foreground">Properties</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <Calendar className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-lg font-semibold">{communityData.established}</span>
                    <span className="text-sm text-muted-foreground">Established</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <Shield className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-lg font-semibold">24/7</span>
                    <span className="text-sm text-muted-foreground">Security</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {communityData.amenities.map((amenity, index) => (
                    <span key={index} className="px-3 py-1 bg-secondary rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Community Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {!isJoined ? (
                  <Button onClick={handleJoinCommunity} className="w-full">
                    Join This Community
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full">
                    You're a Member
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" /> Message Manager
                </Button>
                <Button variant="outline" className="w-full" onClick={handleReport}>
                  Report an Issue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {communityData.rules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs mr-2">
                        {index + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs section */}
        <Tabs defaultValue="properties">
          <TabsList className="mb-6">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="events">Community Events</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties">
            <h2 className="text-2xl font-bold mb-4">Properties in this community</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityData.events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <p>{event.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="discussions">
            <div className="text-center py-16">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Community Discussions</h3>
              <p className="text-muted-foreground mb-4">Join the community to participate in discussions.</p>
              {!isJoined && (
                <Button onClick={handleJoinCommunity}>Join Community</Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CommunityDetails;
