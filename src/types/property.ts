
// Centralized property type definition
export interface PropertyType {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  main_image_url: string | null;
  status: string;
  description: string | null;
  size_sqm: number | null;
  square_footage: number;
  year_built: number;
  amenities: string[] | null;
  image_urls: string[];
  availability_date: string | null;
  latitude?: number | null;
  longitude?: number | null;
  country?: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Type for property comparison
export interface ExtendedPropertyType extends PropertyType {
  image?: string;
  location?: string;
  purpose?: string;
  type?: string;
  beds?: number;
  baths?: number;
  area?: number;
}
