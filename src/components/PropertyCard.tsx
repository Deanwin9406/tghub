
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useComparison } from '@/contexts/ComparisonContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';

export interface PropertyType {
  id: string;
  title: string;
  price: number;
  priceUnit: 'XOF' | 'USD' | 'EUR';
  type: 'house' | 'apartment' | 'land' | 'commercial' | 'villa' | 'office' | 'other';
  purpose: 'sale' | 'rent';
  location: string;
  beds?: number;
  baths?: number;
  area?: number;
  image: string;
  featured?: boolean;
  new?: boolean;
}

interface PropertyCardProps {
  property: PropertyType;
  className?: string;
}

const formatPrice = (price: number, currency: string) => {
  if (currency === 'XOF') {
    return `${price.toLocaleString()} ${currency}`;
  }
  return `${currency} ${price.toLocaleString()}`;
};

const PropertyCard = ({ property, className }: PropertyCardProps) => {
  const { 
    addToComparison, 
    removeFromComparison,
    isInComparison 
  } = useComparison();
  
  const {
    addFavorite: addToFavorites,
    removeFavorite: removeFromFavorites,
    isFavorite: isInFavorites
  } = useFavorites();
  
  const { toast } = useToast();

  const {
    id,
    title,
    price,
    priceUnit,
    type,
    purpose,
    location,
    beds,
    baths,
    area,
    image,
    featured,
    new: isNew
  } = property;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInComparison(id)) {
      removeFromComparison(id);
      toast({
        title: "Retiré de la comparaison",
        description: `${title} a été retiré de la comparaison.`,
      });
    } else {
      addToComparison(property);
      toast({
        title: "Ajouté à la comparaison",
        description: `${title} a été ajouté à la comparaison.`,
      });
    }
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInFavorites(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(property);
    }
  };

  const isCompared = isInComparison(id);
  const isFavorite = isInFavorites(id);

  return (
    <div 
      className={cn(
        "bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-apple group",
        className
      )}
    >
      <Link to={`/property/${id}`} className="block relative overflow-hidden aspect-[4/3]">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-apple"
        />
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white",
              isFavorite && "bg-primary/90 text-primary-foreground hover:bg-primary"
            )}
            onClick={handleFavoriteClick}
          >
            <Heart 
              size={18} 
              className={cn(
                "transition-colors",
                isFavorite 
                  ? "text-white fill-current" 
                  : "text-muted-foreground hover:text-red-500"
              )} 
            />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white",
              isCompared && "bg-primary/90 text-primary-foreground hover:bg-primary"
            )}
            onClick={handleCompareClick}
          >
            <Shuffle size={18} className={cn(
              "transition-colors",
              isCompared ? "text-white" : "text-muted-foreground hover:text-primary"
            )} />
          </Button>
        </div>
        
        <div className="absolute top-4 left-4 flex flex-row gap-2">
          {featured && (
            <Badge className="bg-togo-yellow text-black font-medium">
              Featured
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-togo-green text-white font-medium">
              New
            </Badge>
          )}
          <Badge className={purpose === 'sale' ? 'bg-togo-red/90 text-white' : 'bg-blue-500/90 text-white'}>
            {purpose === 'sale' ? 'À Vendre' : 'À Louer'}
          </Badge>
        </div>
      </Link>
      
      <div className="p-5">
        <div className="flex justify-between items-start">
          <Link to={`/property/${id}`} className="block">
            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>
          <div className="font-bold text-lg text-primary">
            {formatPrice(price, priceUnit)}
            {purpose === 'rent' && <span className="text-sm font-normal text-muted-foreground">/mois</span>}
          </div>
        </div>
        
        <div className="flex items-center text-muted-foreground mt-2">
          <MapPin size={14} className="mr-1" />
          <span className="text-sm">{location}</span>
        </div>
        
        <div className="border-t border-border mt-4 pt-4 grid grid-cols-3 gap-2">
          {beds !== undefined && (
            <div className="flex items-center text-sm">
              <Bed size={16} className="mr-2 text-muted-foreground" />
              <span>{beds} {beds > 1 ? 'chambres' : 'chambre'}</span>
            </div>
          )}
          
          {baths !== undefined && (
            <div className="flex items-center text-sm">
              <Bath size={16} className="mr-2 text-muted-foreground" />
              <span>{baths} {baths > 1 ? 'sdb' : 'sdb'}</span>
            </div>
          )}
          
          {area !== undefined && (
            <div className="flex items-center text-sm">
              <Square size={16} className="mr-2 text-muted-foreground" />
              <span>{area} m²</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
