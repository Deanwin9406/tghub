
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CommunityMembersSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const CommunityMembersSearch = ({ searchTerm, onSearchChange }: CommunityMembersSearchProps) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Search members..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default CommunityMembersSearch;
