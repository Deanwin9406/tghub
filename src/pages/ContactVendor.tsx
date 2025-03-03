import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Phone, Mail, MessageCircle, Calendar as CalendarIcon2, Clock, Info, MapPin, Star, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  description: string;
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  availability: {
    days: string[];
    hours: string;
  };
  image: string;
}

const ContactVendor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [activeTab, setActiveTab] = useState('message');
  
  const getTimeSlots = () => {
    if (!vendor) return [];
    
    const hours = vendor.availability.hours.split(' - ');
    const startTime = hours[0];
    const endTime = hours[1];
    
    const timeSlots = [];
    
    const startHour = startTime.includes('AM') 
      ? parseInt(startTime.split(':')[0]) 
      : (parseInt(startTime.split(':')[0]) + 12) % 24;
    
    const endHour = endTime.includes('AM') 
      ? parseInt(endTime.split(':')[0]) 
      : (parseInt(endTime.split(':')[0]) + 12) % 24;
    
    for (let hour = startHour; hour < endHour; hour++) {
      const formattedHour = hour > 12 ? hour - 12 : hour;
      const amPm = hour >= 12 ? 'PM' : 'AM';
      timeSlots.push(`${formattedHour}:00 ${amPm} - ${formattedHour}:59 ${amPm}`);
    }
    
    return timeSlots;
  };
  
  useEffect(() => {
    const vendorFromState = location.state?.vendor;
    
    if (vendorFromState) {
      setVendor(vendorFromState);
      setLoading(false);
    } else {
      const mockVendors = [
        {
          id: '1',
          name: 'Bright Stars Electricians',
          category: 'Electrician',
          location: 'Accra, Ghana',
          rating: 4.5,
          description: 'Reliable and professional electricians for all your electrical needs.',
          contact: {
            phone: '+233 555 123 456',
            email: 'info@brightstars.com',
            whatsapp: '+233 555 123 456'
          },
          availability: {
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            hours: '8:00 AM - 5:00 PM'
          },
          image: 'https://images.unsplash.com/photo-1621905244249-563b19458969?q=80&w=870&auto=format&fit=crop'
        },
        {
          id: '2',
          name: 'AquaFlow Plumbing Services',
          category: 'Plumber',
          location: 'Kumasi, Ghana',
          rating: 4.2,
          description: 'Expert plumbers providing top-notch plumbing services.',
          contact: {
            phone: '+233 200 987 654',
            email: 'aqua@flow.com',
            whatsapp: '+233 200 987 654'
          },
          availability: {
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            hours: '9:00 AM - 6:00 PM'
          },
          image: 'https://images.unsplash.com/photo-1617838482403-48a924a8557f?q=80&w=870&auto=format&fit=crop'
        },
        {
          id: '3',
          name: 'Supreme Painters',
          category: 'Painter',
          location: 'Takoradi, Ghana',
          rating: 4.8,
          description: 'Professional painting services to transform your space.',
          contact: {
            phone: '+233 244 333 111',
            email: 'paint@supreme.com',
            whatsapp: '+233 244 333 111'
          },
          availability: {
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            hours: '7:00 AM - 7:00 PM'
          },
          image: 'https://images.unsplash.com/photo-1574172269172-890559175891?q=80&w=870&auto=format&fit=crop'
        }
      ];
      
      const vendorId = new URLSearchParams(location.search).get('id');
      
      if (vendorId) {
        const foundVendor = mockVendors.find(v => v.id === vendorId);
        if (foundVendor) {
          setVendor(foundVendor);
        } else {
          toast({
            title: "Fournisseur introuvable",
            description: "Nous n'avons pas pu trouver les détails de ce fournisseur.",
            variant: "destructive"
          });
          navigate('/vendors');
        }
      } else {
        toast({
          title: "ID de fournisseur manquant",
          description: "Aucun ID de fournisseur n'a été spécifié.",
          variant: "destructive"
        });
        navigate('/vendors');
      }
      
      setLoading(false);
    }
  }, [location, navigate, toast]);
  
  const handleCall = () => {
    if (vendor?.contact.phone) {
      window.location.href = `tel:${vendor.contact.phone.replace(/\s/g, '')}`;
    }
  };
  
  const handleEmail = () => {
    if (vendor?.contact.email) {
      window.location.href = `mailto:${vendor.contact.email}?subject=Service%20Request`;
    }
  };
  
  const handleWhatsApp = () => {
    if (vendor?.contact.whatsapp) {
      const phoneNumber = vendor.contact.whatsapp.replace(/\s/g, '');
      window.open(`https://wa.me/${phoneNumber}?text=I'm interested in your services`, '_blank');
    }
  };
  
  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour envoyer un message.",
        variant: "destructive"
      });
      return;
    }
    
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Champs obligatoires",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Message envoyé",
      description: "Votre message a été envoyé avec succès au fournisseur.",
      variant: "default"
    });
    
    setMessageSubject('');
    setMessageContent('');
  };
  
  const handleBookAppointment = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour prendre rendez-vous.",
        variant: "destructive"
      });
      return;
    }
    
    if (!date || !timeSlot) {
      toast({
        title: "Champs obligatoires",
        description: "Veuillez sélectionner une date et une heure pour le rendez-vous.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Rendez-vous réservé",
      description: `Votre rendez-vous a été réservé pour le ${format(date, 'PPP', { locale: fr })} à ${timeSlot}.`,
      variant: "default"
    });
    
    setDate(undefined);
    setTimeSlot('');
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse">Chargement des détails du fournisseur...</div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!vendor) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Fournisseur introuvable</h1>
            <p className="text-muted-foreground mb-6">
              Nous n'avons pas pu trouver les détails de ce fournisseur.
            </p>
            <Button onClick={() => navigate('/vendors')}>
              Retour aux fournisseurs
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/vendors')}
        >
          &larr; Retour aux fournisseurs
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="mb-6">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={vendor.image} 
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{vendor.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  {vendor.rating} • {vendor.category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <p className="text-sm">{vendor.description}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <p className="text-sm">{vendor.location}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <p className="text-sm">Disponible: {vendor.availability.days.join(', ')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <p className="text-sm">Heures: {vendor.availability.hours}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full" onClick={handleCall}>
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={handleWhatsApp}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 mr-2">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contacter {vendor.name}</CardTitle>
                <CardDescription>
                  Choisissez votre méthode de contact préférée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="message">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </TabsTrigger>
                    <TabsTrigger value="appointment">
                      <CalendarIcon2 className="h-4 w-4 mr-2" />
                      Rendez-vous
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="message" className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <Input
                          placeholder="Sujet du message"
                          value={messageSubject}
                          onChange={(e) => setMessageSubject(e.target.value)}
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="Votre message ici..."
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          className="min-h-[150px]"
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleSendMessage}
                      >
                        Envoyer le message
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="appointment" className="pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Date du rendez-vous</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  
                                  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
                                  const dayAbbrev = dayOfWeek.substring(0, 3);
                                  
                                  return date < today || !vendor.availability.days.includes(dayAbbrev);
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Heure du rendez-vous</label>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            disabled={!date}
                          >
                            <option value="">Sélectionner une heure</option>
                            {getTimeSlots().map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <Textarea
                          placeholder="Détails ou questions supplémentaires (optionnel)"
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={handleBookAppointment}
                      >
                        Prendre rendez-vous
                      </Button>
                      
                      <div className="text-xs text-muted-foreground flex items-start gap-2 mt-2">
                        <Info className="h-4 w-4 shrink-0" />
                        <p>
                          L'horaire des rendez-vous est sujet à confirmation. 
                          {vendor.name} vous contactera pour confirmer votre demande.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactVendor;
