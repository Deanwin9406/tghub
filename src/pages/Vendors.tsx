
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Mail, Search, Filter, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  address: string;
  phone: string;
  email: string;
  verified: boolean;
  image: string;
  services: string[];
}

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Elite Plumbing Solutions',
    category: 'Plumbing',
    rating: 4.8,
    address: 'Accra, Ghana',
    phone: '+233 20 123 4567',
    email: 'contact@eliteplumbing.com',
    verified: true,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop',
    services: ['Pipe Installation', 'Leak Repair', 'Drainage Solutions', 'Water Heater Service']
  },
  {
    id: '2',
    name: 'GreenScape Gardens',
    category: 'Landscaping',
    rating: 4.6,
    address: 'Tema, Ghana',
    phone: '+233 24 987 6543',
    email: 'info@greenscape.com',
    verified: true,
    image: 'https://images.unsplash.com/photo-1599685315640-4b2430af782c?q=80&w=2069&auto=format&fit=crop',
    services: ['Garden Design', 'Lawn Maintenance', 'Irrigation Systems', 'Tree Trimming']
  },
  {
    id: '3',
    name: 'PowerTech Electricians',
    category: 'Electrical',
    rating: 4.9,
    address: 'Kumasi, Ghana',
    phone: '+233 27 345 6789',
    email: 'service@powertech.com',
    verified: true,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2069&auto=format&fit=crop',
    services: ['Wiring', 'Lighting Installation', 'Electrical Repairs', 'Safety Inspections']
  },
  {
    id: '4',
    name: 'Clean Sweep Services',
    category: 'Cleaning',
    rating: 4.5,
    address: 'Accra, Ghana',
    phone: '+233 23 456 7890',
    email: 'bookings@cleansweep.com',
    verified: false,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop',
    services: ['Deep Cleaning', 'Regular Housekeeping', 'Move-in/out Cleaning', 'Office Cleaning']
  },
  {
    id: '5',
    name: 'SecureHome Systems',
    category: 'Security',
    rating: 4.7,
    address: 'Takoradi, Ghana',
    phone: '+233 26 789 0123',
    email: 'info@securehome.com',
    verified: true,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop',
    services: ['CCTV Installation', 'Alarm Systems', 'Access Control', 'Security Consultation']
  }
];

const Vendors = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredVendors = mockVendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      vendor.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(mockVendors.map(vendor => vendor.category)))];

  const handleContactVendor = (vendorName: string) => {
    toast({
      title: "Contact Request Sent",
      description: `Your request to contact ${vendorName} has been submitted.`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Property Vendors</h1>
            <p className="text-muted-foreground">Find trusted service providers for your property needs</p>
          </div>
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <TabsList className="flex w-max">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard 
                key={vendor.id} 
                vendor={vendor} 
                onContact={handleContactVendor} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Vendors Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any vendors matching your criteria.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

const VendorCard = ({ 
  vendor, 
  onContact 
}: { 
  vendor: Vendor, 
  onContact: (name: string) => void 
}) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={vendor.image} 
          alt={vendor.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="mb-1">{vendor.name}</CardTitle>
            <CardDescription className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> {vendor.address}
            </CardDescription>
          </div>
          <Badge variant={vendor.verified ? "default" : "outline"} className="flex items-center">
            {vendor.verified ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
            {vendor.verified ? 'Verified' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center mb-3">
          <Badge variant="secondary" className="mr-2">{vendor.category}</Badge>
          <div className="flex items-center text-amber-500">
            <Star className="fill-current h-4 w-4" />
            <span className="ml-1 text-sm font-medium">{vendor.rating}</span>
          </div>
        </div>
        
        <h4 className="text-sm font-semibold mb-2">Services offered:</h4>
        <div className="flex flex-wrap gap-1 mb-3">
          {vendor.services.map((service, index) => (
            <span key={index} className="px-2 py-1 bg-muted text-xs rounded-md">
              {service}
            </span>
          ))}
        </div>
        
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            <span>{vendor.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            <span>{vendor.email}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" className="w-full mr-2">View Profile</Button>
        <Button className="w-full" onClick={() => onContact(vendor.name)}>Contact</Button>
      </CardFooter>
    </Card>
  );
};

export default Vendors;
