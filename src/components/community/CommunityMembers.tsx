import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, UserPlus, Mail, Shield, Home } from 'lucide-react';

// Mock data for illustration
const mockMembers = [
  { id: '1', name: 'John Doe', role: 'admin', avatar: null, joined: '2023-01-15', properties: 2 },
  { id: '2', name: 'Jane Smith', role: 'moderator', avatar: null, joined: '2023-02-20', properties: 1 },
  { id: '3', name: 'Robert Johnson', role: 'member', avatar: null, joined: '2023-03-05', properties: 0 },
  { id: '4', name: 'Sarah Williams', role: 'member', avatar: null, joined: '2023-03-10', properties: 3 },
  { id: '5', name: 'Michael Brown', role: 'member', avatar: null, joined: '2023-04-15', properties: 0 },
  { id: '6', name: 'Emily Davis', role: 'member', avatar: null, joined: '2023-05-22', properties: 1 },
  { id: '7', name: 'David Miller', role: 'member', avatar: null, joined: '2023-06-30', properties: 0 },
  { id: '8', name: 'Jessica Wilson', role: 'member', avatar: null, joined: '2023-07-14', properties: 2 },
];

interface CommunityMembersProps {
  communityId: string;
}

const CommunityMembers = ({ communityId }: CommunityMembersProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Community Members</h3>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
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
        {filteredMembers.length === 0 ? (
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
                      <AvatarImage src={member.avatar || undefined} alt={member.name} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getRoleBadge(member.role)}
                        {member.properties > 0 && (
                          <span className="flex items-center">
                            <Home className="h-3 w-3 mr-1" />
                            {member.properties} properties
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                    {user && (mockMembers[0].id === user.id || mockMembers[1].id === user.id) && (
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4" />
                      </Button>
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
