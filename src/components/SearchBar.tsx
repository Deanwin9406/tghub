
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  variant?: 'default' | 'minimal';
  onSearch?: (term: string) => void;
}

const SearchBar = ({ className, variant = 'default', onSearch }: SearchBarProps) => {
  const [searchType, setSearchType] = useState('buy');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch && location.trim()) {
      onSearch(location);
    } else {
      navigate(`/search?type=${searchType}&location=${encodeURIComponent(location)}`);
    }
  };
  
  return (
    <form 
      onSubmit={handleSearch} 
      className={cn(
        "bg-white rounded-2xl shadow-lg transition-all",
        variant === 'default' ? 'p-6' : 'p-3',
        className
      )}
    >
      <div className={cn(
        "flex flex-col md:flex-row gap-4",
        variant === 'minimal' && "items-center"
      )}>
        {variant === 'default' && (
          <div className="flex space-x-2 mb-4 bg-muted rounded-lg p-1">
            <Button 
              type="button"
              variant={searchType === 'buy' ? 'default' : 'ghost'} 
              className="flex-1 rounded-md"
              onClick={() => setSearchType('buy')}
            >
              Acheter
            </Button>
            <Button 
              type="button"
              variant={searchType === 'rent' ? 'default' : 'ghost'} 
              className="flex-1 rounded-md"
              onClick={() => setSearchType('rent')}
            >
              Louer
            </Button>
          </div>
        )}
        
        <div className={cn(
          "relative flex-1 flex items-center",
          variant === 'minimal' ? 'w-full md:w-auto' : ''
        )}>
          <MapPin size={18} className="absolute left-3 text-muted-foreground" />
          <Input
            placeholder="Ville, quartier ou adresse..."
            className="pl-10 pr-4 py-6 rounded-xl border-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        
        {variant === 'default' && (
          <div className="flex-1">
            <Select defaultValue="all">
              <SelectTrigger className="py-6 rounded-xl border-input">
                <SelectValue placeholder="Type de propriété" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="house">Maison</SelectItem>
                <SelectItem value="apartment">Appartement</SelectItem>
                <SelectItem value="land">Terrain</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Button 
          type="submit" 
          className={cn(
            "py-6 px-8 rounded-xl btn-effect",
            variant === 'minimal' ? 'w-full md:w-auto' : 'flex-1 md:flex-none'
          )}
          size={variant === 'minimal' ? 'default' : 'lg'}
        >
          {variant === 'default' ? (
            <>
              <Search size={18} className="mr-2" />
              Rechercher
            </>
          ) : (
            <Search size={18} />
          )}
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
