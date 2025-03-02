import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/community';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  roles: string[];
  hasCompletedKyc: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: any | null }>;
  loading: boolean;
  session: Session | null;
  isLoading: boolean;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  checkKycStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCompletedKyc, setHasCompletedKyc] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserRoles();
      checkKycStatus();
    } else {
      setProfile(null);
      setRoles([]);
      setHasCompletedKyc(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      }

      setProfile(profileData || null);
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
    }
  };

  const fetchUserRoles = async () => {
    if (!user) return;

    try {
      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching roles:", error);
        return;
      }

      const rolesArray = rolesData.map(item => item.role);
      setRoles(rolesArray);
    } catch (error) {
      console.error("Unexpected error fetching roles:", error);
    }
  };

  const checkKycStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('status')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching KYC status:", error);
        setHasCompletedKyc(false);
        return false;
      }

      const isApproved = data?.status === 'approved';
      setHasCompletedKyc(isApproved);
      return isApproved;
    } catch (error) {
      console.error("Error checking KYC status:", error);
      setHasCompletedKyc(false);
      return false;
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: any | null }> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Sign-in error:', error);
        return { error };
      }
      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setUser(null);
      setProfile(null);
      setRoles([]);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<{ error: any | null }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        console.error('Sign-up error:', error);
        return { error };
      }

      if (data.user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, email: email, first_name: firstName, last_name: lastName }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }
      }

      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: any | null }> => {
    if (!user) return { error: new Error("No user logged in") };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Update profile error:', error);
        return { error };
      }

      setProfile(prevProfile => ({ ...prevProfile, ...updates } as Profile));

      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<{ error: any | null }> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        console.error('Password reset error:', error);
        return { error };
      }

      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = sendPasswordResetEmail;

  const contextValue = {
    user,
    profile,
    roles,
    hasCompletedKyc,
    signIn,
    signOut,
    signUp,
    updateProfile,
    sendPasswordResetEmail,
    resetPassword,
    loading,
    isLoading: loading,
    session,
    checkKycStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
