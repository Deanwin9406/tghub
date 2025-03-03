
// src/types/property.ts
export interface PropertyType {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  country: string;
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqm: number | null;
  status: string;
  main_image_url: string | null;
  property_type: string;
  description?: string;
  amenities?: string[];
  featured?: boolean;
  owner_id?: string;
  latitude?: number;
  longitude?: number;
  image_urls?: string[];
  area?: number;
  beds?: number;
  baths?: number;
  location?: string;
  purpose?: string;
  type?: string;
  year_built?: number;
  availability_date?: string;
  square_footage?: number;
  image?: string;
  new?: boolean;
}

export interface ExtendedPropertyType extends PropertyType {
  favorite?: boolean;
  compareEnabled?: boolean;
}

// Export these types to be used across the application
