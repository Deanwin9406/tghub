
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';

interface CommunityMembersHeaderProps {
  isMember: boolean;
  isJoining: boolean;
  onJoin: () => void;
}

const CommunityMembersHeader = ({ isMember, isJoining, onJoin }: CommunityMembersHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold">Community Members</h3>
      {!isMember ? (
        <Button onClick={onJoin} disabled={isJoining}>
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
  );
};

export default CommunityMembersHeader;
