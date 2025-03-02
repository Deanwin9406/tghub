
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import PropertyForm from '@/components/PropertyForm';

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8">Edit Property</h1>
          <p className="text-red-500">Property ID is missing. Please go back and try again.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Property</h1>
        <PropertyForm propertyId={id} isEditing={true} />
      </div>
    </Layout>
  );
};

export default EditProperty;
