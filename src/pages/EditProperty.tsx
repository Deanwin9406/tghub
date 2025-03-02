
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from '@/components/PropertyForm';

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching property data
    setTimeout(() => {
      setProperty({ title: 'Sample Property', /* other props */ });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleSubmit = (propertyData: any) => {
    console.log('Updated property data:', propertyData);
    toast({
      title: 'Propriété mise à jour',
      description: 'La propriété a été mise à jour avec succès.',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Modifier la propriété</h1>
        <PropertyForm 
          onSubmit={handleSubmit} 
          propertyId={id} 
          isEditing={true}
          initialData={property}
        />
      </div>
    </Layout>
  );
};

export default EditProperty;
