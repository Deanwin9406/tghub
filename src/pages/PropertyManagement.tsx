
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2, Eye, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AssignManagerModal from '@/components/dashboard/AssignManagerModal';

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  status: string;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  main_image_url: string | null;
  has_manager: boolean;
}

const PropertyManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // First check if the property_managers table exists
      const { data: tableCheck, error: tableCheckError } = await supabase
        .from('property_managers')
        .select('id')
        .limit(1);
      
      let data;
      let error;
      
      if (tableCheck) {
        // If the table exists, use a query that includes manager info
        const result = await supabase
          .rpc('get_properties_with_manager_info', { owner_id_param: user?.id });
        data = result.data;
        error = result.error;
      } else {
        // Fallback to basic query
        const result = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', user?.id)
          .order('created_at', { ascending: false });
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load properties. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Property deleted successfully.',
      });
      
      // Update the properties list
      setProperties(prev => prev.filter(property => property.id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete property. Please try again.',
      });
    }
  };
  
  const openManagerModal = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setManagerModalOpen(true);
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
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Property Management</h1>
          <Button onClick={() => navigate('/property/add')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Property
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">You don't have any properties yet.</p>
                <Button onClick={() => navigate('/property/add')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Property
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Property</th>
                      <th className="px-4 py-3 text-left">Location</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-center">Type</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Manager</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr key={property.id} className="border-b">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded bg-gray-200 mr-3 overflow-hidden">
                              {property.main_image_url ? (
                                <img 
                                  src={property.main_image_url} 
                                  alt={property.title} 
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="font-medium">{property.title}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {property.address}, {property.city}
                        </td>
                        <td className="px-4 py-4 text-right font-medium">
                          {property.price.toLocaleString()} XOF
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="capitalize">{property.property_type}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant={getStatusBadgeVariant(property.status)}>
                            {property.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {property.has_manager ? (
                            <Badge variant="secondary">
                              Assigned
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Not Assigned
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => navigate(`/property/${property.id}`)}
                              title="View Property"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => navigate(`/property/edit/${property.id}`)}
                              title="Edit Property"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openManagerModal(property.id)}
                              title="Assign Manager"
                            >
                              <UserCog className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteProperty(property.id)}
                              title="Delete Property"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {selectedPropertyId && (
        <AssignManagerModal 
          isOpen={managerModalOpen}
          onClose={() => {
            setManagerModalOpen(false);
            fetchProperties(); // Refresh the properties list with updated manager info
          }}
          propertyId={selectedPropertyId}
        />
      )}
    </Layout>
  );
};

export default PropertyManagement;
