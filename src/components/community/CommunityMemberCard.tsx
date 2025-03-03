
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Shield, Home } from 'lucide-react';
import { CommunityMember, Profile } from '@/types/community';

interface MemberWithProfile extends CommunityMember {
  profile?: Profile;
  properties_count?: number;
}

interface CommunityMemberCardProps {
  member: MemberWithProfile;
  currentUserId?: string;
}

const CommunityMemberCard = ({ member, currentUserId }: CommunityMemberCardProps) => {
  const getInitials = (member: MemberWithProfile) => {
    const firstName = member.profile?.first_name || '';
    const lastName = member.profile?.last_name || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getMemberName = (member: MemberWithProfile) => {
    return `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.trim() || 'Anonymous User';
  };

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

  return (
    <Card>
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
            {currentUserId && (
              member.role === 'admin' && currentUserId === member.user_id && (
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4" />
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityMemberCard;
