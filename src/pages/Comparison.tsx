
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Bed, Bath, Square, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useComparison } from '@/contexts/ComparisonContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ComparisonPage = () => {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const navigate = useNavigate();

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'XOF') {
      return `${price.toLocaleString()} ${currency}`;
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  const propertyTypeLabel = (type: string) => {
    switch(type) {
      case 'house': return 'Maison';
      case 'apartment': return 'Appartement';
      case 'land': return 'Terrain';
      case 'commercial': return 'Commercial';
      default: return type;
    }
  };

  const renderComparisonTable = () => {
    if (comparisonList.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="mb-6">
            <Trash2 className="mx-auto h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Aucune propriété à comparer</h2>
          <p className="text-muted-foreground mb-6">
            Ajoutez des propriétés à comparer en cliquant sur le bouton de comparaison sur les fiches des propriétés.
          </p>
          <Button onClick={() => navigate('/search')}>
            Parcourir les propriétés
          </Button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="p-4 text-left min-w-[200px]">Caractéristiques</th>
              {comparisonList.map(property => (
                <th key={property.id} className="p-4 text-center min-w-[300px]">
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-muted-foreground/10"
                      onClick={() => removeFromComparison(property.id)}
                    >
                      <X size={16} />
                    </Button>
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{property.location}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      Voir détails
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4 font-medium">Prix</td>
              {comparisonList.map(property => (
                <td key={`${property.id}-price`} className="p-4 text-center">
                  <span className="font-semibold text-primary">
                    {formatPrice(property.price, property.priceUnit)}
                  </span>
                  {property.purpose === 'rent' && (
                    <span className="text-sm text-muted-foreground">/mois</span>
                  )}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Type</td>
              {comparisonList.map(property => (
                <td key={`${property.id}-type`} className="p-4 text-center">
                  {propertyTypeLabel(property.type)}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">But</td>
              {comparisonList.map(property => (
                <td key={`${property.id}-purpose`} className="p-4 text-center">
                  {property.purpose === 'sale' ? 'À Vendre' : 'À Louer'}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Chambres</td>
              {comparisonList.map(property => (
                <td key={`${property.id}-beds`} className="p-4 text-center">
                  <div className="flex items-center justify-center">
                    <Bed size={16} className="mr-2 text-muted-foreground" />
                    {property.beds ?? 'N/A'}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Salles de bain</td>
              {comparisonList.map(property => (
                <td key={`${property.id}-baths`} className="p-4 text-center">
                  <div className="flex items-center justify-center">
                    <Bath size={16} className="mr-2 text-muted-foreground" />
                    {property.baths ?? 'N/A'}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Surface</td>
              {comparisonList.map(property => (
                <td key={`${property.id}-area`} className="p-4 text-center">
                  <div className="flex items-center justify-center">
                    <Square size={16} className="mr-2 text-muted-foreground" />
                    {property.area ? `${property.area} m²` : 'N/A'}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-2xl font-bold">Comparaison de propriétés</h1>
          </div>
          {comparisonList.length > 0 && (
            <Button variant="outline" onClick={clearComparison}>
              Effacer tout
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            {renderComparisonTable()}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ComparisonPage;
