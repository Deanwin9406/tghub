
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CommunityMember, Profile } from '@/types/community';
import { isUserCommunityMember, joinCommunity } from '@/services/community/communityMembers';
import CommunityMembersHeader from './CommunityMembersHeader';
import CommunityMembersSearch from './CommunityMembersSearch';
import CommunityMembersList from './CommunityMembersList';

interface CommunityMembersProps {
  communityId: string;
}

interface MemberWithProfile extends CommunityMember {
  profile?: Profile;
  properties_count?: number;
}

const CommunityMembers = ({ communityId }: CommunityMembersProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Check if the current user is a member of this community
  useEffect(() => {
    const checkMembership = async () => {
      if (user) {
        const isMember = await isUserCommunityMember(communityId, user.id);
        setIsMember(isMember);
      }
    };
    
    checkMembership();
  }, [communityId, user]);

  // Fetch community members
  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        // Fetch community members with their profiles
        const { data, error } = await supabase
          .from('community_members')
          .select(`
            id, 
            community_id, 
            user_id, 
            joined_at, 
            role,
            profile:user_id(
              id, 
              first_name, 
              last_name, 
              avatar_url
            )
          `)
          .eq('community_id', communityId);

        if (error) throw error;
        
        const memberProfiles = data.map(member => ({
          ...member,
          profile: member.profile as unknown as Profile,
          properties_count: 0,  // Default value
          role: member.role as "admin" | "moderator" | "member" // Type assertion for role
        }));
        
        setMembers(memberProfiles);
      } catch (error) {
        console.error('Error fetching community members:', error);
        toast({
          title: "Error",
          description: "Failed to load community members.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [communityId, toast]);

  const handleJoinCommunity = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join this community",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);
    try {
      await joinCommunity(communityId, user.id);
      setIsMember(true);
      
      // Add the new member to the list
      const userProfile = {
        id: user.id,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        avatar_url: user.user_metadata?.avatar_url || null
      } as Profile;
      
      const newMember: MemberWithProfile = {
        id: '',
        community_id: communityId,
        user_id: user.id,
        joined_at: new Date().toISOString(),
        role: "member",
        profile: userProfile,
        properties_count: 0
      };
      
      setMembers(prev => [...prev, newMember]);
      
      toast({
        title: "Success!",
        description: "You've joined the community successfully",
      });
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Failed to join community. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const fullName = `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <CommunityMembersHeader 
        isMember={isMember} 
        isJoining={isJoining} 
        onJoin={handleJoinCommunity} 
      />
      
      <CommunityMembersSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />
      
      <CommunityMembersList 
        members={filteredMembers} 
        isLoading={isLoading} 
        currentUserId={user?.id} 
      />
    </div>
  );
};

export default CommunityMembers;
