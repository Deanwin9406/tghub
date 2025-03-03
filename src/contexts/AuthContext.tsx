
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
    console.log("AuthContext - Authentication state updated:", { 
      hasUser: user ? true : false,
      hasSession: session ? true : false,
      loading
    });
  }, [user, session, loading]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthContext - Initial session check:", session ? "Session exists" : "No session");
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AuthContext - Auth state change event:", _event);
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
      console.log("Sign up data:", { email, firstName, lastName }); // Debug log
      
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

      console.log("Signup response:", data);

      // If user is created successfully, create a profile manually
      if (data.user?.id) {
        try {
          // Explicitly create profile with first and last name
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
              id: data.user.id, 
              email: email, 
              first_name: firstName, 
              last_name: lastName 
            }]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Don't return error here as signup was successful
            // Just log the error and continue
          } else {
            console.log("Profile created successfully with name:", firstName, lastName);
          }

          // Also attempt to assign the default tenant role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{
              user_id: data.user.id,
              role: 'tenant'
            }]);

          if (roleError) {
            console.error('Error assigning role:', roleError);
            // Don't return error, just log it
          } else {
            console.log("Default role assigned successfully");
          }
        } catch (insertError) {
          console.error("Error during profile/role creation:", insertError);
          // Continue since user creation was successful
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error("Unexpected error during signup:", error);
      return { error };
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
