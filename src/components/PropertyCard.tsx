import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Heart, Bed, Bath, MapPin, ArrowRight, Home, X } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { PropertyType } from '@/types/property';

export interface PropertyCardProps {
  property: PropertyType;
  onRemoveFromFavorites?: () => void;
  showRemoveButton?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onRemoveFromFavorites,
  showRemoveButton = false
}) => {
  const navigate = useNavigate();
  const { addToComparison, isInComparison } = useComparison();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const isComparing = isInComparison(property.id);
  const isFavorited = isFavorite(property.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToComparison(property);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFromFavorites) {
      onRemoveFromFavorites();
    }
  };

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer relative group"
      onClick={handleCardClick}
    >
      <div className="relative">
        <AspectRatio ratio={4/3}>
          <img 
            src={property.main_image_url || '/placeholder.svg'} 
            alt={property.title} 
            className="w-full h-full object-cover" 
          />
        </AspectRatio>
        
        <div className="absolute top-2 left-2">
          <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
            {property.status === 'available' ? 'Disponible' : 'Vendu'}
          </Badge>
        </div>
        
        <div className="absolute top-2 right-2 space-x-1">
          {showRemoveButton ? (
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm" 
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Retirer des favoris</span>
            </Button>
          ) : (
            <Button 
              size="icon" 
              variant="secondary" 
              className={`h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm ${isFavorited ? 'text-red-500' : ''}`} 
              onClick={handleFavoriteClick}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              <span className="sr-only">Ajouter aux favoris</span>
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-center text-sm text-muted-foreground">
          <Home className="mr-1 h-4 w-4" />
          <span className="capitalize">{property.property_type}</span>
        </div>
        
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">{property.title}</h3>
        
        <div className="flex items-start mb-2">
          <MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground line-clamp-1">
            {property.address}, {property.city}
          </span>
        </div>
        
        <div className="text-xl font-bold mb-3">
          {formatPrice(property.price)}
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          {property.bedrooms !== null && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{property.bedrooms} Ch</span>
            </div>
          )}
          
          {property.bathrooms !== null && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{property.bathrooms} SdB</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className={`${isComparing ? 'bg-primary/10' : ''}`}
          onClick={handleCompareClick}
          disabled={isComparing}
        >
          {isComparing ? 'Ajouté à la comparaison' : 'Comparer'}
        </Button>
        
        <Button size="sm" variant="ghost" className="ml-auto group-hover:translate-x-1 transition-transform">
          Voir <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
