import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { 
  Building, 
  Bed, 
  Bath, 
  MapPin, 
  Calendar, 
  Tag, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  HeartOff,
  Plus,
  Check,
  ArrowLeft,
  CircleDollarSign,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useComparison } from '@/contexts/ComparisonContext';
import { supabase } from '@/integrations/supabase/client';
import PropertyOwnershipInfo from '@/components/PropertyOwnershipInfo';
import { PropertyType } from '@/components/PropertyCard';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const Carousel = lazy(() => import('react-responsive-carousel').then(module => ({ default: module.Carousel })));

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { favorites, addFavorite, removeFromFavorite } = useFavorites();
  const { addToComparison, isInComparison } = useComparison();
  const [property, setProperty] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const isInFavorites = property ? favorites.includes(property.id) : false;
  const inComparison = property ? isInComparison(property.id) : false;

  useEffect(() => {
    if (id) {
      fetchPropertyDetails(id);
    }
  }, [id]);

  const fetchPropertyDetails = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Ensure the data conforms to PropertyType
      const propertyData: PropertyType = {
        id: data.id,
        title: data.title,
        address: data.address,
        city: data.city,
        price: data.price,
        description: data.description,
        property_type: data.property_type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        square_footage: data.square_footage || null,
        year_built: data.year_built || null,
        amenities: data.amenities || null,
        main_image_url: data.main_image_url,
        image_urls: data.image_urls || null,
        availability_date: data.availability_date || null,
        status: data.status,
        owner_id: data.owner_id,
      };
      
      setProperty(propertyData);
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load property details. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!property) return;
    
    if (isInFavorites) {
      removeFromFavorite(property.id);
    } else {
      addFavorite(property.id);
    }
  };
  
  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!property) return;
    
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
  
  const handleSendMessage = async () => {
    if (!user || !property) return;
    
    setSending(true);
    
    try {
      // Send message logic here (e.g., store in database)
      // You'll need to implement the backend logic for sending messages
      
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to the property owner.',
      });
      setIsDialogOpen(false);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">Property not found.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative">
                <Suspense fallback={<div className="h-96 bg-muted flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
                  <Carousel
                    showThumbs={false}
                    showStatus={false}
                    infiniteLoop
                    autoPlay
                    interval={5000}
                  >
                    {property.image_urls && property.image_urls.length > 0 ? (
                      property.image_urls.map((url, index) => (
                        <div key={index}>
                          <img src={url} alt={`${property.title} - Image ${index + 1}`} className="object-cover w-full h-96" />
                        </div>
                      ))
                    ) : (
                      <div>
                        <img src={property.main_image_url || ''} alt={property.title} className="object-cover w-full h-96" />
                      </div>
                    )}
                  </Carousel>
                </Suspense>
                <div className="absolute top-2 left-2">
                  <Badge variant={getStatusBadgeVariant(property.status)}>
                    {property.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button 
                    className="p-2 bg-background rounded-full shadow-sm hover:scale-110 transition-transform"
                    onClick={handleFavoriteClick}
                  >
                    {isInFavorites ? (
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    ) : (
                      <HeartOff className="h-4 w-4" />
                    )}
                  </button>
                  <button 
                    className="p-2 bg-background rounded-full shadow-sm hover:scale-110 transition-transform"
                    onClick={handleCompareClick}
                    disabled={inComparison}
                  >
                    {inComparison ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {property.title}
                </CardTitle>
                <CardDescription className="flex items-center text-muted-foreground gap-2">
                  <MapPin className="h-4 w-4" />
                  {property.address}, {property.city}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Price:</span>
                    <span>{property.price.toLocaleString()} XOF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Type:</span>
                    <span className="capitalize">{property.property_type.replace('_', ' ')}</span>
                  </div>
                  {property.bedrooms != null && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Bedrooms:</span>
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms != null && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Bathrooms:</span>
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.square_footage != null && (
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Square Footage:</span>
                      <span>{property.square_footage} sq ft</span>
                    </div>
                  )}
                  {property.year_built != null && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Year Built:</span>
                      <span>{property.year_built}</span>
                    </div>
                  )}
                  {property.availability_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Available Date:</span>
                      <span>
                        {format(parseISO(property.availability_date), 'PPP', { locale: fr })}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Description:</h4>
                  <p className="text-muted-foreground">{property.description}</p>
                </div>
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Amenities:</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {property.amenities.map((amenity, index) => (
                        <li key={index}>{amenity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            {id && <PropertyOwnershipInfo propertyId={id} />}
            <Card>
              <CardHeader>
                <CardTitle>Contact Owner</CardTitle>
                <CardDescription>Send a message to the property owner</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Send a Message</DialogTitle>
                      <DialogDescription>
                        Write your message to the property owner here.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="message" className="text-right">
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          className="col-span-3"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleSendMessage} disabled={sending}>
                        {sending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails;
