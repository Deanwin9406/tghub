
export interface Community {
  id: string;
  name: string;
  description: string | null;
  location?: string;
  image_url: string | null;
  is_private: boolean | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  property_count?: number;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  joined_at: string;
  role: 'admin' | 'moderator' | 'member';
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  reactions_count?: number;
  comments_count?: number;
}

export interface CommunityEvent {
  id: string;
  community_id: string;
  created_by: string;
  title: string;
  description: string;
  location: string | null;
  start_time: string;
  end_time: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  attendees_count?: number;
}

export interface CommunityPoll {
  id: string;
  community_id: string;
  created_by: string;
  question: string;
  description: string | null;
  end_date: string | null;
  is_multiple_choice: boolean;
  created_at: string;
  updated_at: string;
  options: PollOption[];
  votes_count?: number;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  votes_count?: number;
}

export interface MarketplaceItem {
  id: string;
  community_id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number | null;
  image_url: string | null;
  status: 'available' | 'pending' | 'sold';
  created_at: string;
  updated_at: string;
  category: string | null;
}

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  roles: string[];
  hasCompletedKyc: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: any | null }>;
  loading: boolean;
}
