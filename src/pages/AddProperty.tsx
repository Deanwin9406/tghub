
import React from 'react';
import Layout from '@/components/Layout';
import PropertyForm from '@/components/PropertyForm';

const AddProperty = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Add New Property</h1>
        <PropertyForm />
      </div>
    </Layout>
  );
};

export default AddProperty;
