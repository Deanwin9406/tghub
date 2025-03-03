
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PropertyFormBasicInfoProps {
  title: string;
  location: string;
  address: string;
  description: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const PropertyFormBasicInfo = ({ 
  title, 
  location, 
  address, 
  description, 
  onInputChange 
}: PropertyFormBasicInfoProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={onInputChange}
            placeholder="Property title"
            required
          />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="location">City</Label>
          <Input
            id="location"
            name="location"
            value={location}
            onChange={onInputChange}
            placeholder="City"
            required
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={address}
          onChange={onInputChange}
          placeholder="Full address"
          required
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={onInputChange}
          placeholder="Describe your property"
          rows={4}
        />
      </div>
    </>
  );
};

export default PropertyFormBasicInfo;
