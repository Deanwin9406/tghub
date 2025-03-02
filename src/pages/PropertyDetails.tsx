import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  Heart,
  Share2,
  PhoneCall,
  MessageSquare,
  ArrowLeft,
  Info,
  Check
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyType } from '@/components/PropertyCard';
import { motion } from 'framer-motion';
import { useFavorites } from '@/contexts/FavoritesContext';
import FeaturedProperties from '@/components/FeaturedProperties';
import mockProperties from '../data/mockProperties';
import { cn } from '@/lib/utils';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const foundProperty = mockProperties.find(p => p.id === id) || null;
      setProperty(foundProperty);
      setLoading(false);
      
      window.scrollTo(0, 0);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [id]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="aspect-[16/9] bg-muted rounded-2xl"></div>
            <div className="h-10 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-muted rounded-xl"></div>
              <div className="h-64 bg-muted rounded-xl"></div>
              <div className="h-64 bg-muted rounded-xl"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Propriété non trouvée</h1>
          <p className="mb-8">La propriété que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link to="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  const galleryImages = [
    property.image,
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  ];
  
  const propertyIsFavorite = id ? isFavorite(id) : false;
  
  const handleFavoriteClick = () => {
    if (!property) return;
    
    if (propertyIsFavorite) {
      removeFavorite(property.id);
    } else {
      addFavorite(property);
    }
  };
  
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} XOF`;
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <Link to="/search" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Retour aux résultats
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 h-[500px]">
          <div className="md:col-span-2 h-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full relative overflow-hidden rounded-2xl"
            >
              <img 
                src={galleryImages[activeImage]} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              <div className="absolute top-4 left-4 flex space-x-2">
                {property.featured && (
                  <Badge className="bg-togo-yellow text-black font-medium">
                    Featured
                  </Badge>
                )}
                {property.new && (
                  <Badge className="bg-togo-green text-white font-medium">
                    New
                  </Badge>
                )}
                <Badge className={property.purpose === 'sale' ? 'bg-togo-red/90 text-white' : 'bg-blue-500/90 text-white'}>
                  {property.purpose === 'sale' ? 'À Vendre' : 'À Louer'}
                </Badge>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="text-white text-xl font-semibold drop-shadow-md">
                  {activeImage + 1}/{galleryImages.length}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className={cn(
                      "rounded-full",
                      propertyIsFavorite && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={handleFavoriteClick}
                  >
                    <Heart 
                      size={18} 
                      className={propertyIsFavorite ? "fill-current" : ""} 
                    />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="rounded-full"
                  >
                    <Share2 size={18} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="md:col-span-1">
            <div className="grid grid-cols-2 gap-2">
              {galleryImages.map((image, index) => (
                <motion.button
                  key={index}
                  className={`aspect-square overflow-hidden rounded-xl border-2 border-transparent hover:border-primary focus:border-primary ${activeImage === index ? 'border-primary' : ''}`}
                  onClick={() => setActiveImage(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img 
                    src={image} 
                    alt={`${property.title} - Image ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="md:flex md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin size={16} className="mr-2" />
              {property.location}
            </div>
          </div>
          
          <div className="text-3xl font-bold text-primary mb-4 md:mb-0">
            {formatPrice(property.price)}
          </div>
        </div>
        
        <div className="flex items-center justify-between py-4 border-y border-border">
          <div className="flex items-center">
            <Bed size={20} className="mr-2 text-muted-foreground" />
            <span>{property.beds || 0} Chambres</span>
          </div>
          <div className="flex items-center">
            <Bath size={20} className="mr-2 text-muted-foreground" />
            <span>{property.baths || 0} Salles de bain</span>
          </div>
          <div className="flex items-center">
            <Square size={20} className="mr-2 text-muted-foreground" />
            <span>{property.area || 0} m²</span>
          </div>
        </div>
        
        <Tabs defaultValue="description" className="mt-6">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4 space-y-2">
            <p>{property.description}</p>
            <h4 className="font-semibold mt-4">Commodités</h4>
            <ul className="list-disc list-inside">
              {property.features?.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="details" className="mt-4 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Type de propriété</h4>
                <p className="text-muted-foreground">{property.type}</p>
              </div>
              <div>
                <h4 className="font-semibold">But</h4>
                <p className="text-muted-foreground">{property.purpose === 'sale' ? 'Vente' : 'Location'}</p>
              </div>
              <div>
                <h4 className="font-semibold">Date de publication</h4>
                <p className="text-muted-foreground">
                  {property.created_at ? formatDistanceToNow(new Date(property.created_at), {
                    addSuffix: true,
                    locale: fr
                  }) : 'Inconnue'}
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="contact" className="mt-4 space-y-2">
            <div className="bg-muted/30 rounded-md p-4">
              <h4 className="font-semibold mb-2">Contactez l'agent</h4>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    src={property.agent?.avatar || "https://via.placeholder.com/150"} 
                    alt={property.agent?.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <p className="font-medium">{property.agent?.name}</p>
                  <p className="text-muted-foreground text-sm">Agent immobilier</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" className="w-full">
                  <PhoneCall size={16} className="mr-2" />
                  Appeler
                </Button>
                <Button className="w-full">
                  <MessageSquare size={16} className="mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Propriétés similaires</h2>
          <FeaturedProperties />
        </section>
      </div>
    </Layout>
  );
};

export default PropertyDetails;
