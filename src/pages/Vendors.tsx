
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Mail, MessageCircle, Calendar, Briefcase, Building, Clock } from 'lucide-react';

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
  };
  availability: {
    days: string[];
    hours: string;
  };
  image: string;
}

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Bright Stars Electricians',
    category: 'Electrician',
    location: 'Accra, Ghana',
    rating: 4.5,
    description: 'Reliable and professional electricians for all your electrical needs.',
    contact: {
      phone: '+233 555 123 456',
      email: 'info@brightstars.com'
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
      email: 'aqua@flow.com'
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
      email: 'paint@supreme.com'
    },
    availability: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      hours: '7:00 AM - 7:00 PM'
    },
    image: 'https://images.unsplash.com/photo-1574172269172-890559175891?q=80&w=870&auto=format&fit=crop'
  }
];

const Vendors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredVendors = mockVendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Service Providers</h1>
            <p className="text-muted-foreground">Find trusted service providers for your property needs</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80"
            />
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="electrician">Electricians</TabsTrigger>
            <TabsTrigger value="plumber">Plumbers</TabsTrigger>
            <TabsTrigger value="painter">Painters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-muted-foreground">No service providers found matching your search.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="electrician">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.filter(v => v.category === 'Electrician').map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="plumber">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.filter(v => v.category === 'Plumber').map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="painter">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.filter(v => v.category === 'Painter').map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const VendorCard = ({ vendor }: { vendor: Vendor }) => {
  const navigate = useNavigate();

  const handleContact = () => {
    // Navigate to the contact vendor page with vendor data in state
    navigate(`/contact-vendor?id=${vendor.id}`, { state: { vendor } });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={vendor.image} 
          alt={vendor.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      <CardHeader>
        <CardTitle>{vendor.name}</CardTitle>
        <CardDescription className="flex items-center">
          <Briefcase className="h-4 w-4 mr-1" /> {vendor.category}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{vendor.description}</p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{vendor.location}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{vendor.contact.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{vendor.contact.email}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{vendor.availability.days.join(', ')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{vendor.availability.hours}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1 text-yellow-500" />
          <span>{vendor.rating}</span>
        </div>
        <Button variant="outline" onClick={handleContact}>
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Vendors;
