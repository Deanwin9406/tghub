
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Heart, MapPin, Bed, Bath, Square, ArrowUpRight } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';

export interface PropertyType {
  id: string;
  title: string;
  location: string;
  price: number;
  priceUnit: string;
  type: 'apartment' | 'house' | 'land' | 'commercial' | 'villa' | 'office' | 'other';
  purpose: 'rent' | 'sale';
  beds?: number;
  baths?: number;
  area?: number;
  image: string;
  agent?: {
    name: string;
    avatar: string;
  };
  featured?: boolean;
  new?: boolean;
  description?: string;
  features?: string[];
  created_at?: string;
}

interface PropertyCardProps {
  property: PropertyType;
  variant?: 'default' | 'compact';
}

const PropertyCard = ({ property, variant = 'default' }: PropertyCardProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(property.id)) {
      removeFavorite(property.id);
    } else {
      addFavorite(property);
    }
  };
  
  const isPropertyFavorite = isFavorite(property.id);
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md h-full">
      <Link to={`/property/${property.id}`} className="block h-full">
        <div className="relative">
          <div className="aspect-[4/3] relative overflow-hidden">
            <img 
              src={property.image} 
              alt={property.title} 
              className="object-cover w-full h-full transition-transform hover:scale-105 duration-700"
            />
            <div className="absolute top-0 left-0 p-3 flex space-x-2">
              {property.featured && (
                <Badge className="bg-togo-yellow text-black font-medium">
                  Featured
                </Badge>
              )}
              {property.new && (
                <Badge className="bg-togo-green text-white font-medium">
                  Nouveau
                </Badge>
              )}
            </div>
            <div className="absolute top-0 right-0 p-3">
              <Button 
                variant="secondary" 
                size="icon"
                className={`rounded-full ${isPropertyFavorite ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-white/80'}`}
                onClick={handleFavoriteClick}
              >
                <Heart size={16} className={isPropertyFavorite ? 'fill-current' : ''} />
              </Button>
            </div>
            <Badge className={`absolute bottom-3 left-3 ${property.purpose === 'sale' ? 'bg-togo-red/90' : 'bg-blue-500/90'} text-white`}>
              {property.purpose === 'sale' ? 'À Vendre' : 'À Louer'}
            </Badge>
          </div>
        </div>
        
        <CardContent className="py-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
            <div className="text-lg font-bold text-primary">
              {property.price.toLocaleString()} {property.priceUnit}
            </div>
          </div>
          
          <div className="flex items-center text-muted-foreground text-sm mb-4">
            <MapPin size={14} className="mr-1" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            {property.beds !== undefined && (
              <div className="flex items-center">
                <Bed size={16} className="mr-1 text-muted-foreground" />
                <span>{property.beds} ch</span>
              </div>
            )}
            
            {property.baths !== undefined && (
              <div className="flex items-center">
                <Bath size={16} className="mr-1 text-muted-foreground" />
                <span>{property.baths} sdb</span>
              </div>
            )}
            
            {property.area !== undefined && (
              <div className="flex items-center">
                <Square size={16} className="mr-1 text-muted-foreground" />
                <span>{property.area} m²</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 pb-4">
          <div className="w-full flex justify-between items-center">
            {property.agent && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden mr-2">
                  <img 
                    src={property.agent.avatar} 
                    alt={property.agent.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm">{property.agent.name}</span>
              </div>
            )}
            
            <Button variant="ghost" size="sm" className="text-primary p-0 h-auto hover:bg-transparent hover:text-primary">
              Détails <ArrowUpRight size={14} className="ml-1" />
            </Button>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default PropertyCard;
