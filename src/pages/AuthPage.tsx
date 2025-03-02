
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [loadingSignUp, setLoadingSignUp] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: ''
  });

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData(prev => ({ ...prev, [name]: value }));
    setSignInError('');
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({ ...prev, [name]: value }));
    setSignUpError('');
  };

  const validateSignIn = () => {
    if (!signInData.email || !signInData.password) {
      setSignInError('Please fill in all fields');
      return false;
    }
    return true;
  };

  const validateSignUp = () => {
    if (!signUpData.email || !signUpData.password || !signUpData.passwordConfirm || !signUpData.firstName || !signUpData.lastName) {
      setSignUpError('Please fill in all fields');
      return false;
    }

    if (signUpData.password !== signUpData.passwordConfirm) {
      setSignUpError('Passwords do not match');
      return false;
    }

    if (signUpData.password.length < 6) {
      setSignUpError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;

    setLoadingSignIn(true);
    try {
      const { error } = await signIn(signInData.email, signInData.password);
      if (error) {
        throw new Error(error.message || 'Failed to sign in');
      }
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
      navigate('/');
    } catch (error: any) {
      setSignInError(error.message || 'Failed to sign in');
      toast({
        title: "Authentication failed",
        description: error.message || 'Failed to sign in',
        variant: "destructive"
      });
    } finally {
      setLoadingSignIn(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUp()) return;

    setLoadingSignUp(true);
    try {
      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.firstName, signUpData.lastName);
      if (error) {
        throw new Error(error.message || 'Failed to sign up');
      }
      toast({
        title: "Account created",
        description: "You have successfully signed up."
      });
      navigate('/');
    } catch (error: any) {
      setSignUpError(error.message || 'Failed to sign up');
      toast({
        title: "Registration failed",
        description: error.message || 'Failed to sign up',
        variant: "destructive"
      });
    } finally {
      setLoadingSignUp(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to PropertyPal
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your account or create a new one
          </p>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          <Tabs defaultValue="sign-in" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="sign-in" className="p-6">
              <form onSubmit={handleSignIn}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Icons.mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={signInData.email}
                        onChange={handleSignInChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Icons.lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={signInData.password}
                        onChange={handleSignInChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {signInError && (
                    <div className="text-sm text-destructive">{signInError}</div>
                  )}
                  <Button type="submit" className="w-full" disabled={loadingSignIn}>
                    {loadingSignIn ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="sign-up" className="p-6">
              <form onSubmit={handleSignUp}>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={signUpData.firstName}
                        onChange={handleSignUpChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={signUpData.lastName}
                        onChange={handleSignUpChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Icons.mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={signUpData.email}
                        onChange={handleSignUpChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Icons.lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={signUpData.password}
                        onChange={handleSignUpChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm">Confirm Password</Label>
                    <div className="relative">
                      <Icons.lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="passwordConfirm"
                        name="passwordConfirm"
                        type="password"
                        placeholder="••••••••"
                        value={signUpData.passwordConfirm}
                        onChange={handleSignUpChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {signUpError && (
                    <div className="text-sm text-destructive">{signUpError}</div>
                  )}
                  <Button type="submit" className="w-full" disabled={loadingSignUp}>
                    {loadingSignUp ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
