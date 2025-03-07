
export interface PropertyType {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'industrial' | 'mixed_use';
  status: 'pending' | 'draft' | 'available' | 'rented' | 'sold' | 'unavailable' | 'maintenance' | 'archived';
  bedrooms: number;
  bathrooms: number;
  area_size: number;
  size_sqm: number;
  main_image_url: string;
  city: string;
  address: string;
  country: string;
  amenities: string[];
  featured: boolean;
  availability_date: string;
  latitude: number;
  longitude: number;
  created_at: string;
  owner_id: string;
  year_built?: number;
  energy_rating?: string;
  verification_status?: string;
  square_footage?: number; // Added for compatibility
  image_urls?: string[]; // Added for compatibility
}

export interface Property extends PropertyType {
  owner?: {
    first_name: string;
    last_name: string;
  };
}

export interface ExtendedPropertyType extends PropertyType {
  owner?: {
    first_name: string;
    last_name: string;
  };
  new?: boolean;
  purpose?: 'rent' | 'sale';
  type?: string;
  beds?: number;
  baths?: number;
  area?: number;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: string;
  created_at: string;
  property: {
    title: string;
  };
}

export interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'overdue';
  due_date: string;
  payment_date: string | null;
  lease: {
    property: {
      title: string;
    };
  };
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
  };
}

export interface SystemSetting {
  id: string;
  setting_name: string;
  setting_value: string;
  setting_description: string;
  created_at: string;
  updated_at: string;
  // Support for the existing system settings structure
  email?: any;
  security?: any;
  notifications?: any;
  system?: any;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  budget: number;
  urgency: string;
  created_at: string;
  updated_at: string;
  requester_id: string;
  property_id: string;
  requester: {
    first_name: string;
    last_name: string;
    email: string;
  };
  property: {
    title: string;
    address: string;
  };
  proposals?: any[];
}

export interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  notes: string;
  location: string;
  client: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  vendor: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  property: {
    title: string;
    address: string;
  };
}

export interface Viewing {
  id: string;
  viewing_date: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  duration_minutes: number;
  notes: string;
  property: {
    title: string;
    address: string;
  };
  client: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  country?: string;
  two_factor_enabled?: boolean;
}
