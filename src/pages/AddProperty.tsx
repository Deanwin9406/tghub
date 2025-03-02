
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PropertyForm from '@/components/PropertyForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

const AddProperty = () => {
  const { toast } = useToast();
  const { user, roles, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      checkPermission();
    }
  }, [isLoading, roles]);

  const checkPermission = () => {
    setChecking(true);
    // Check if user has any of the authorized roles for creating listings
    const authorizedRoles = ['landlord', 'agent', 'manager', 'admin'];
    const permitted = roles.some(role => authorizedRoles.includes(role));
    
    setHasPermission(permitted);
    
    // If not authorized, redirect after a short delay
    if (!permitted && !isLoading) {
      toast({
        title: 'Permission denied',
        description: 'You do not have permission to create property listings.',
        variant: 'destructive',
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    
    setChecking(false);
  };

  const handleSubmit = (propertyData: any) => {
    console.log('Property data:', propertyData);
    toast({
      title: 'Propriété ajoutée',
      description: 'La propriété a été ajoutée avec succès.',
    });
    navigate('/property-management');
  };

  if (isLoading || checking) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!hasPermission) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to add property listings. Only landlords, agents, and property managers can add properties.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Ajouter une propriété</h1>
        <PropertyForm onSubmit={handleSubmit} />
      </div>
    </Layout>
  );
};

export default AddProperty;
