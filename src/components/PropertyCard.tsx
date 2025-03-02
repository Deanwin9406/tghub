
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Bed, Bath, MapPin, Heart, HeartOff, Plus, Check } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useComparison } from '@/contexts/ComparisonContext';

export interface PropertyType {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  description: string;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  square_footage: number | null;
  year_built: number | null;
  amenities: string[] | null;
  main_image_url: string | null;
  image_urls: string[] | null;
  availability_date: string | null;
  status: string;
  owner_id?: string;
}

interface PropertyCardProps {
  property: PropertyType;
  showFavoriteButton?: boolean;
  showCompareButton?: boolean;
  onRemoveFromFavorites?: () => void;
}

const PropertyCard = ({ 
  property, 
  showFavoriteButton = true, 
  showCompareButton = true,
  onRemoveFromFavorites
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFromFavorite } = useFavorites();
  const { addToComparison, isInComparison } = useComparison();
  
  const isInFavorites = favorites.includes(property.id);
  const inComparison = isInComparison(property.id);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInFavorites) {
      if (onRemoveFromFavorites) {
        onRemoveFromFavorites();
      } else {
        removeFromFavorite(property.id);
      }
    } else {
      addFavorite(property.id);
    }
  };
  
  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToComparison(property);
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'rented':
        return 'secondary';
      case 'sold':
        return 'destructive';
      case 'under_maintenance':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col cursor-pointer hover:border-primary transition-colors duration-200" onClick={() => navigate(`/property/${property.id}`)}>
      <div className="relative h-48 overflow-hidden bg-muted">
        {property.main_image_url ? (
          <img 
            src={property.main_image_url} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant={getStatusBadgeVariant(property.status)}>
            {property.status.replace('_', ' ')}
          </Badge>
        </div>
        {showFavoriteButton && (
          <button 
            className="absolute top-2 right-2 p-1.5 bg-background rounded-full shadow-sm hover:scale-110 transition-transform"
            onClick={handleFavoriteClick}
          >
            {isInFavorites ? (
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      <CardContent className="flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
          <p className="font-bold text-primary whitespace-nowrap">{property.price.toLocaleString()} XOF</p>
        </div>
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="text-sm truncate">{property.address}, {property.city}</span>
        </div>
        <div className="flex gap-3 text-sm">
          {property.bedrooms != null && (
            <div className="flex items-center">
              <Bed className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>{property.bedrooms} Bed{property.bedrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center">
              <Bath className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>{property.bathrooms} Bath{property.bathrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex items-center">
            <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span className="capitalize">{property.property_type.replace('_', ' ')}</span>
          </div>
        </div>
      </CardContent>
      {showCompareButton && (
        <CardFooter className="p-4 pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleCompareClick}
            disabled={inComparison}
          >
            {inComparison ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                Added to Comparison
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add to Compare
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PropertyCard;
