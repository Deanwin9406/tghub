
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PropertyType } from '@/types/property';

interface ComparisonDropdownProps {
  comparisonList: PropertyType[];
  onClearComparison: () => void;
}

const ComparisonDropdown = ({ comparisonList, onClearComparison }: ComparisonDropdownProps) => {
  if (comparisonList.length === 0) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Comparer <Badge className="ml-2">{comparisonList.length}</Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end">
        <DropdownMenuLabel>Liste de comparaison</DropdownMenuLabel>
        <ScrollArea className="h-64">
          {comparisonList.map((property) => (
            <DropdownMenuItem key={property.id}>
              <Link to={`/property/${property.id}`} className="w-full">
                {property.title}
              </Link>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onClearComparison}>
          Effacer la comparaison
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ComparisonDropdown;
