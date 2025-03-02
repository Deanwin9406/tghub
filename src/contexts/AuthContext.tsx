
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'tenant' | 'landlord' | 'agent' | 'admin' | 'manager' | 'vendor';

// Define a profile type
interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  roles: UserRole[];
  resetPassword: (email: string) => Promise<{ error?: any }>;
  profile: Profile | null;
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: any }>;
  hasCompletedKyc?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasCompletedKyc, setHasCompletedKyc] = useState<boolean>(false);

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        await fetchUserRoles(session.user.id);
        await fetchUserProfile(session.user.id);
        await checkKycStatus(session.user.id);
      }

      setIsLoading(false);
    };

    loadSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserRoles(session.user.id);
        await fetchUserProfile(session.user.id);
        await checkKycStatus(session.user.id);
      } else {
        setRoles([]);
        setProfile(null);
        setHasCompletedKyc(false);
      }
    });
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      const userRoles = data.map(item => item.role as UserRole);
      setRoles(userRoles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkKycStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking KYC status:', error);
        return;
      }

      setHasCompletedKyc(data?.status === 'approved');
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      setSession(data.session);
      setUser(data.session?.user || null);
      if (data.session?.user) {
        await fetchUserRoles(data.session.user.id);
        await fetchUserProfile(data.session.user.id);
        await checkKycStatus(data.session.user.id);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) return { error };

      setSession(data.session);
      setUser(data.user || null);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      setRoles([]);
      setProfile(null);
      setHasCompletedKyc(false);
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      return { error };
    } catch (error: any) {
      console.error('Error resetting password:', error.message);
      return { error };
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) return { error };
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signIn, 
      signUp, 
      signOut, 
      roles,
      resetPassword,
      profile,
      updateProfile,
      hasCompletedKyc
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
