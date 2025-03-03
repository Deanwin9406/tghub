
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyFormPricingProps {
  price: number;
  priceUnit: string;
  purpose: string;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const PropertyFormPricing = ({
  price,
  priceUnit,
  purpose,
  onNumberChange,
  onSelectChange
}: PropertyFormPricingProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-3">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={price}
          onChange={onNumberChange}
          placeholder="Price"
          required
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="priceUnit">Currency</Label>
        <Select 
          value={priceUnit} 
          onValueChange={(value) => onSelectChange('priceUnit', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="XOF">XOF</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="purpose">Purpose</Label>
        <Select 
          value={purpose} 
          onValueChange={(value) => onSelectChange('purpose', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sale">For Sale</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PropertyFormPricing;
