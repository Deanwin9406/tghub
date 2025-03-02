
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCommunityDetails, joinCommunity, leaveCommunity } from '@/services/communityService';
import { Community } from '@/types/community';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import CommunityTabs from '@/components/community/CommunityTabs';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Users, Bell, BellOff, LogOut } from 'lucide-react';

const CommunityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const loadCommunity = async () => {
      if (!id) {
        navigate('/communities');
        return;
      }
      
      try {
        const data = await fetchCommunityDetails(id);
        setCommunity(data);
        
        // Check if user is a member - in a real app this would be a database query
        // Here we're just simulating for demonstration
        setIsMember(Math.random() > 0.5);
        setIsSubscribed(Math.random() > 0.5);
      } catch (error) {
        console.error("Failed to load community details:", error);
        toast({
          title: "Failed to load community",
          description: "Could not load community details. Please try again.",
          variant: "destructive"
        });
        navigate('/communities');
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunity();
  }, [id, navigate, toast]);

  const handleJoinCommunity = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join this community",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsJoining(true);
      if (!id) return;
      
      await joinCommunity(id, user.id);
      setIsMember(true);
      setIsSubscribed(true);
      
      toast({
        title: "Successfully joined",
        description: `You are now a member of ${community?.name}`,
      });
    } catch (error) {
      console.error("Failed to join community:", error);
      toast({
        title: "Failed to join community",
        description: "An error occurred while joining the community.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user || !id) return;
    
    try {
      await leaveCommunity(id, user.id);
      setIsMember(false);
      setIsSubscribed(false);
      
      toast({
        title: "Left community",
        description: `You are no longer a member of ${community?.name}`,
      });
    } catch (error) {
      console.error("Failed to leave community:", error);
      toast({
        title: "Failed to leave community",
        description: "An error occurred while leaving the community.",
        variant: "destructive"
      });
    }
  };

  const toggleNotifications = () => {
    setIsSubscribed(prev => !prev);
    
    toast({
      title: isSubscribed ? "Notifications turned off" : "Notifications turned on",
      description: isSubscribed 
        ? `You will no longer receive notifications from ${community?.name}` 
        : `You will now receive notifications from ${community?.name}`,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 mb-8 rounded-lg"></div>
            <div className="h-8 bg-gray-200 w-1/3 mb-4 rounded"></div>
            <div className="h-4 bg-gray-200 w-1/2 mb-8 rounded"></div>
            <div className="h-12 bg-gray-200 mb-8 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Community Not Found</h2>
            <p className="text-muted-foreground mb-6">The community you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/communities')}>Browse Communities</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-lg overflow-hidden">
          <div className="h-64 bg-gradient-to-r from-blue-600 to-violet-600">
            {community.image_url && (
              <img
                src={community.image_url}
                alt={community.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{community.name}</h1>
              {community.location && (
                <div className="flex items-center text-white/80 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{community.location}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center bg-black/30 px-3 py-1 rounded-full">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{community.member_count || 0} Members</span>
                </div>
                <div className="flex items-center bg-black/30 px-3 py-1 rounded-full">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{community.property_count || 0} Properties</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {isMember ? (
            <>
              <Button 
                variant="outline" 
                onClick={toggleNotifications}
              >
                {isSubscribed ? (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Mute Notifications
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Notifications
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLeaveCommunity}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Community
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleJoinCommunity}
              disabled={isJoining}
            >
              {isJoining ? "Joining..." : "Join Community"}
            </Button>
          )}
        </div>

        {/* Description */}
        {community.description && (
          <div className="mb-8">
            <p className="text-muted-foreground">{community.description}</p>
          </div>
        )}

        {/* Tabs Content */}
        <CommunityTabs community={community} />
      </div>
    </Layout>
  );
};

export default CommunityDetails;
