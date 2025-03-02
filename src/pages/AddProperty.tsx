
import React from 'react';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from '@/components/PropertyForm';

const AddProperty = () => {
  const { toast } = useToast();

  const handleSubmit = (propertyData: any) => {
    console.log('Property data:', propertyData);
    toast({
      title: 'Propriété ajoutée',
      description: 'La propriété a été ajoutée avec succès.',
    });
  };

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
