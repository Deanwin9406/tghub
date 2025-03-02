
// Type definitions to match our database schema

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string | null;
  address?: string;
  city?: string;
  country?: string;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  price: number;
  property_type: string;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  size_sqm?: number;
  main_image_url?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  featured?: boolean;
}

export interface Lease {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  status?: string;
  contract_url?: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  tenant?: Profile;
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  due_date: string;
  payment_date?: string | null;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  lease?: Lease;
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: string;
  image_url?: string;
  assigned_to?: string;
  resolved_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  read_at?: string | null;
  created_at: string;
  sender?: Profile;
  recipient?: Profile;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_by: string;
  is_private?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role?: string;
  joined_at: string;
  community?: Community;
  user?: Profile;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  community?: Community;
  user?: Profile;
}

export interface Viewing {
  id: string;
  property_id: string;
  client_id: string;
  agent_id?: string;
  viewing_date: string;
  status?: string;
  feedback?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  client?: Profile;
  agent?: Profile;
}

export interface AgentCommission {
  id: string;
  agent_id: string;
  property_id: string;
  amount: number;
  transaction_type: string;
  transaction_date: string;
  status?: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface AgentProperty {
  id: string;
  agent_id: string;
  property_id: string;
  commission_percentage?: number;
  is_exclusive?: boolean;
  start_date: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  property?: Property;
}
