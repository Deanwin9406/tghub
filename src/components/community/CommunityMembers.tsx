
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, UserPlus, Mail, Shield, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CommunityMember, Profile } from '@/types/community';
import { isUserCommunityMember, joinCommunity } from '@/services/community/communityMembers';

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
        
        // Get property counts in a separate query (optional enhancement)
        const memberProfiles = data.map(member => ({
          ...member,
          profile: member.profile as unknown as Profile,
          properties_count: 0  // Default value
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
      const newMember: MemberWithProfile = {
        id: '',
        community_id: communityId,
        user_id: user.id,
        joined_at: new Date().toISOString(),
        role: 'member',
        profile: user,
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

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin':
        return <Badge variant="default" className="bg-primary">Admin</Badge>;
      case 'moderator':
        return <Badge variant="default" className="bg-blue-500">Moderator</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  const getInitials = (member: MemberWithProfile) => {
    const firstName = member.profile?.first_name || '';
    const lastName = member.profile?.last_name || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getMemberName = (member: MemberWithProfile) => {
    return `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.trim() || 'Anonymous User';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Community Members</h3>
        {!isMember ? (
          <Button onClick={handleJoinCommunity} disabled={isJoining}>
            <UserPlus className="h-4 w-4 mr-2" />
            {isJoining ? 'Joining...' : 'Join Community'}
          </Button>
        ) : (
          <Button variant="outline" disabled>
            <Users className="h-4 w-4 mr-2" />
            Member
          </Button>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No members found matching your search.</p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.profile?.avatar_url || undefined} alt={getMemberName(member)} />
                      <AvatarFallback>{getInitials(member)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{getMemberName(member)}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getRoleBadge(member.role)}
                        {member.properties_count && member.properties_count > 0 && (
                          <span className="flex items-center">
                            <Home className="h-3 w-3 mr-1" />
                            {member.properties_count} properties
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                    {user && (
                      member.role === 'admin' && user.id === member.user_id && (
                        <Button variant="outline" size="sm">
                          <Shield className="h-4 w-4" />
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityMembers;
