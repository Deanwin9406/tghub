
export interface PropertyType {
  id: string;
  title: string;
  description: string;
  address: string;
  city?: string;
  country?: string;
  price: number;
  property_type: 'apartment' | 'house' | 'condo' | 'land' | 'commercial' | 'townhouse' | 'industrial' | 'mixed_use';
  bedrooms: number;
  bathrooms: number;
  area_size: number;
  size_sqm?: number;
  features?: any;
  owner_id?: string;
  status: 'pending' | 'draft' | 'available' | 'rented' | 'sold' | 'unavailable' | 'maintenance' | 'archived';
  verification_status?: string;
  compliance_status?: string;
  location_coordinates?: any;
  featured?: boolean;
  images?: string[];
  main_image_url?: string;
  year_built?: number;
  parking_spaces?: number;
  amenities?: string[];
  published_at?: string;
  latitude?: number;
  longitude?: number;
  availability_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  property_id: string;
  tenant_id: string;
  priority: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  image_url?: string;
  notes?: string;
  resolved_date?: string;
  property: {
    title: string;
  };
}

export interface Payment {
  id: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'cancelled' | 'overdue';
  lease_id: string;
  receipt_url?: string;
  payment_method?: string;
  lease: {
    property: {
      title: string;
    };
  };
}

export interface Appointment {
  id: string;
  vendor_id: string;
  client_id: string;
  property_id?: string;
  appointment_date: string;
  status: string;
  notes?: string;
  location?: string;
  vendor: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  client: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  property?: {
    title: string;
    address: string;
  };
}

export interface SystemSetting {
  id: string;
  setting_name: string;
  setting_value: any;
  setting_description?: string;
  created_at: string;
  updated_at: string;
}
