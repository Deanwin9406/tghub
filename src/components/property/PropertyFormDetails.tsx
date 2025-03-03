
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyFormDetailsProps {
  type: string;
  beds: number;
  baths: number;
  area: number;
  image: string;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const PropertyFormDetails = ({
  type,
  beds,
  baths,
  area,
  image,
  onNumberChange,
  onInputChange,
  onSelectChange
}: PropertyFormDetailsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <Label htmlFor="type">Property Type</Label>
          <Select 
            value={type} 
            onValueChange={(value) => onSelectChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="beds">Bedrooms</Label>
          <Input
            id="beds"
            name="beds"
            type="number"
            value={beds}
            onChange={onNumberChange}
            placeholder="Number of bedrooms"
          />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="baths">Bathrooms</Label>
          <Input
            id="baths"
            name="baths"
            type="number"
            value={baths}
            onChange={onNumberChange}
            placeholder="Number of bathrooms"
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="area">Area (m²)</Label>
        <Input
          id="area"
          name="area"
          type="number"
          value={area}
          onChange={onNumberChange}
          placeholder="Property area in square meters"
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="image">Main Image URL</Label>
        <Input
          id="image"
          name="image"
          value={image}
          onChange={onInputChange}
          placeholder="URL to main property image"
        />
      </div>
    </>
  );
};

export default PropertyFormDetails;
