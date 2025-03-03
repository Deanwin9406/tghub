
import React from 'react';
import { CommunityMember, Profile } from '@/types/community';
import CommunityMemberCard from './CommunityMemberCard';

interface MemberWithProfile extends CommunityMember {
  profile?: Profile;
  properties_count?: number;
}

interface CommunityMembersListProps {
  members: MemberWithProfile[];
  isLoading: boolean;
  currentUserId?: string;
}

const CommunityMembersList = ({ members, isLoading, currentUserId }: CommunityMembersListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No members found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <CommunityMemberCard 
          key={member.id} 
          member={member} 
          currentUserId={currentUserId} 
        />
      ))}
    </div>
  );
};

export default CommunityMembersList;
