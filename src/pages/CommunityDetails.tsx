import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import CommunityTabs from '@/components/community/CommunityTabs';
import { getCommunityDetails } from '@/services/communityService';
import { Community } from '@/types/community';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { getInitials } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CommunityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCommunity = async () => {
      setIsLoading(true);
      try {
        const data = await getCommunityDetails(id!);
        setCommunity(data);
      } catch (error) {
        console.error('Error loading community details:', error);
        setError('Failed to load community details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunity();
  }, [id]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-48 w-full md:w-1/3 rounded-lg" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : community ? (
          <>
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* Community Image */}
              <div className="md:w-1/3">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {community.image_url ? (
                    <img 
                      src={community.image_url} 
                      alt={community.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Users className="h-16 w-16 text-primary/40" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Community Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
                  <Button>Join Community</Button>
                </div>
                
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{community.location}</span>
                  <span className="mx-2">•</span>
                  <Users className="h-4 w-4 mr-1" />
                  <span>{community.member_count} members</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created {format(new Date(community.created_at), 'MMMM yyyy')}</span>
                </div>
                
                <p className="text-muted-foreground mb-4">{community.description}</p>
                
                {/* Created by */}
                {community.created_by_profile && (
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">Created by:</span>
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage 
                        src={community.created_by_profile.avatar_url || undefined} 
                        alt={`${community.created_by_profile.first_name} ${community.created_by_profile.last_name}`} 
                      />
                      <AvatarFallback>
                        {getInitials(`${community.created_by_profile.first_name} ${community.created_by_profile.last_name}`)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {community.created_by_profile.first_name} {community.created_by_profile.last_name}
                    </span>
                  </div>
                )}
                
                {/* Tags/Categories */}
                {community.tags && community.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {community.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Community Tabs */}
            <CommunityTabs communityId={community.id} />
          </>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>This community could not be found.</AlertDescription>
          </Alert>
        )}
      </div>
    </Layout>
  );
};

export default CommunityDetails;
