
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Community } from '@/types/community';
import CommunityFeed from './CommunityFeed';
import CommunityEvents from './CommunityEvents';
import CommunityPolls from './CommunityPolls';
import CommunityMarketplace from './CommunityMarketplace';
import CommunityMembers from './CommunityMembers';

interface CommunityTabsProps {
  community: Community;
}

const CommunityTabs = ({ community }: CommunityTabsProps) => {
  return (
    <Tabs defaultValue="feed" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="feed">Feed</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="polls">Polls</TabsTrigger>
        <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
      </TabsList>
      
      <TabsContent value="feed">
        <CommunityFeed communityId={community.id} />
      </TabsContent>
      
      <TabsContent value="events">
        <CommunityEvents communityId={community.id} />
      </TabsContent>
      
      <TabsContent value="polls">
        <CommunityPolls communityId={community.id} />
      </TabsContent>
      
      <TabsContent value="marketplace">
        <CommunityMarketplace communityId={community.id} />
      </TabsContent>
      
      <TabsContent value="members">
        <CommunityMembers communityId={community.id} />
      </TabsContent>
    </Tabs>
  );
};

export default CommunityTabs;
