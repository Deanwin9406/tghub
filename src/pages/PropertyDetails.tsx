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
import FeaturedProperties from '@/components/FeaturedProperties';
import mockProperties from '../data/mockProperties';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const foundProperty = mockProperties.find(p => p.id === id) || null;
      setProperty(foundProperty);
      setLoading(false);
      
      // Scroll to top
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
  
  // Create a bigger gallery for demo
  const galleryImages = [
    property.image,
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  ];
  
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
                    className="rounded-full"
                  >
                    <Heart size={18} />
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
          
          <div className="grid grid-rows-2 gap-6 h-full">
            {galleryImages.slice(1, 3).map((image, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-2xl cursor-pointer"
                onClick={() => setActiveImage(index + 1)}
              >
                <img 
                  src={image} 
                  alt={`Property image ${index + 2}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors"></div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin size={16} className="mr-1" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {property.price.toLocaleString()} {property.priceUnit}
                    {property.purpose === 'rent' && <span className="text-sm font-normal text-muted-foreground">/mois</span>}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 my-8">
                {property.beds !== undefined && (
                  <div className="bg-muted/40 rounded-xl p-4 text-center">
                    <Bed size={24} className="mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.beds}</div>
                    <div className="text-sm text-muted-foreground">Chambres</div>
                  </div>
                )}
                
                {property.baths !== undefined && (
                  <div className="bg-muted/40 rounded-xl p-4 text-center">
                    <Bath size={24} className="mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.baths}</div>
                    <div className="text-sm text-muted-foreground">Salles de bain</div>
                  </div>
                )}
                
                {property.area !== undefined && (
                  <div className="bg-muted/40 rounded-xl p-4 text-center">
                    <Square size={24} className="mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.area}</div>
                    <div className="text-sm text-muted-foreground">m²</div>
                  </div>
                )}
              </div>
            </motion.div>
            
            <Tabs defaultValue="details">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="features">Caractéristiques</TabsTrigger>
                <TabsTrigger value="location">Emplacement</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Description</h3>
                    <p className="text-muted-foreground">
                      Magnifique {property.type === 'house' ? 'maison' : 
                        property.type === 'apartment' ? 'appartement' : 
                        property.type === 'land' ? 'terrain' : 'espace commercial'} 
                      situé à {property.location}. Cette propriété offre un excellent emplacement 
                      dans un quartier recherché et sécurisé de Lomé.
                    </p>
                    <p className="text-muted-foreground mt-4">
                      Parfait pour une famille ou un investissement locatif, cette propriété ne restera 
                      pas longtemps sur le marché. Contactez-nous dès aujourd'hui pour organiser une visite.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Détails de la propriété</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                      <div>
                        <span className="text-muted-foreground">Type:</span>{' '}
                        <span className="font-medium">{
                          property.type === 'house' ? 'Maison' : 
                          property.type === 'apartment' ? 'Appartement' : 
                          property.type === 'land' ? 'Terrain' : 'Commercial'
                        }</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Statut:</span>{' '}
                        <span className="font-medium">{property.purpose === 'sale' ? 'À vendre' : 'À louer'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Année de construction:</span>{' '}
                        <span className="font-medium">2020</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Surface du terrain:</span>{' '}
                        <span className="font-medium">{property.area} m²</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Garage:</span>{' '}
                        <span className="font-medium">Oui, 1 place</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ID de propriété:</span>{' '}
                        <span className="font-medium">TP-{property.id.padStart(5, '0')}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="features">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Caractéristiques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Check size={18} className="text-primary mr-2" />
                        <span>Climatisation</span>
                      </div>
                      <div className="flex items-center">
                        <Check size={18} className="text-primary mr-2" />
                        <span>Balcon</span>
                      </div>
                      <div className="flex items-center">
                        <Check size={18} className="text-primary mr-2" />
                        <span>Cuisine équipée</span>
                      </div>
                      <div className="flex items-center">
                        <Check size={18} className="text-primary mr-2" />
                        <span>Eau chaude</span>
                      </div>
                      <div className="flex items-center">
                        <Check size={18} className="text-primary mr-2" />
                        <span>Internet fibre</span>
                      </div>
                      <div className="flex items-center">
                        <Check size={18} className="text-primary mr-2" />
                        <span>Parking sécurisé</span>
                      </div>
                      <div className="flex items-center">
                        <Check size={18} className="text-primary mr-2" />
                        <span>Groupe électrogène</span>
                      </div>
                      <div className="flex items-center">
                        <Check size={18} className="text-primary mr-2" />
                        <span>Sécurité 24/7</span>
                      </div>
                    </div>
                  </div>
                  
                  {property.type !== 'land' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Équipements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Check size={18} className="text-primary mr-2" />
                          <span>Réfrigérateur</span>
                        </div>
                        <div className="flex items-center">
                          <Check size={18} className="text-primary mr-2" />
                          <span>Machine à laver</span>
                        </div>
                        <div className="flex items-center">
                          <Check size={18} className="text-primary mr-2" />
                          <span>Cuisinière</span>
                        </div>
                        <div className="flex items-center">
                          <Check size={18} className="text-primary mr-2" />
                          <span>Four micro-ondes</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
              
              <TabsContent value="location">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="aspect-[16/9] bg-muted rounded-xl flex items-center justify-center">
                    <div className="text-center p-8">
                      <MapPin size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">Carte interactive</h3>
                      <p className="text-muted-foreground">
                        La carte sera disponible prochainement.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">À proximité</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Écoles:</span>{' '}
                        <span className="font-medium">2 km</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hôpitaux:</span>{' '}
                        <span className="font-medium">3.5 km</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commerces:</span>{' '}
                        <span className="font-medium">0.8 km</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Restaurants:</span>{' '}
                        <span className="font-medium">1.2 km</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-border p-6 sticky top-32"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" 
                    alt="Agent"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">David Amegbor</h3>
                  <p className="text-sm text-muted-foreground">Agent immobilier certifié</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <Button className="w-full" size="lg">
                  <PhoneCall size={18} className="mr-2" />
                  Appeler
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageSquare size={18} className="mr-2" />
                  Envoyer un message
                </Button>
              </div>
              
              <div className="border border-border rounded-xl p-4 bg-muted/30">
                <div className="flex items-start">
                  <Info size={18} className="text-primary mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Besoin d'un financement ?</p>
                    <p className="text-muted-foreground mt-1">
                      Nos partenaires bancaires peuvent vous proposer des solutions adaptées à votre projet.
                    </p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                      En savoir plus
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="mt-16 bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Propriétés similaires</h2>
          <FeaturedProperties limit={3} viewAllLink="/search" title="" />
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails;
