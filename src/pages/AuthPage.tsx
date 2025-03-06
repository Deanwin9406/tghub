
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/utils/formatUtils';

const loginSchema = z.object({
  email: z.string().email({
    message: "Veuillez saisir une adresse email valide.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

const registerSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères.",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez saisir une adresse email valide.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().email({
    message: "Veuillez saisir une adresse email valide.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

const AuthPage = () => {
  const { signIn, signUp, resetPassword, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Extract tab from query params, if any
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['login', 'register', 'reset'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [session, navigate, location]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        console.error('Login error:', error);
        let errorMessage = "Échec de la connexion. Veuillez vérifier vos informations.";
        
        // Custom error messages for common auth errors
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = "Identifiants incorrects. Veuillez vérifier votre email et mot de passe.";
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = "Votre email n'a pas été confirmé. Veuillez vérifier votre boîte de réception.";
        }
        
        toast({
          title: "Erreur de connexion",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        // Navigation will happen via the useEffect above
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Erreur",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.firstName, data.lastName);
      if (error) {
        console.error('Registration error:', error);
        let errorMessage = "Échec de l'inscription. Veuillez réessayer.";
        
        // Custom error messages for common auth errors
        if (error.message?.includes('User already registered')) {
          errorMessage = "Un compte existe déjà avec cette adresse email.";
        } else if (error.message?.includes('Password should be')) {
          errorMessage = "Le mot de passe ne respecte pas les critères de sécurité.";
        }
        
        toast({
          title: "Erreur d'inscription",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
          duration: 5000,
        });
        setActiveTab("login");
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
      toast({
        title: "Erreur",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetFormValues) => {
    setLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Erreur de réinitialisation",
          description: "Impossible d'envoyer l'email de réinitialisation. Veuillez vérifier votre adresse email.",
          variant: "destructive",
        });
      } else {
        setResetSent(true);
        toast({
          title: "Email envoyé",
          description: "Consultez votre boîte de réception pour réinitialiser votre mot de passe.",
        });
      }
    } catch (error) {
      console.error('Unexpected password reset error:', error);
      toast({
        title: "Erreur",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <Link to="/" className="text-3xl font-bold">Immob</Link>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
            <TabsTrigger value="reset">Mot de passe</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>
                  Connectez-vous à votre compte pour accéder à votre espace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="vous@exemple.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Connexion en cours...
                        </>
                      ) : (
                        "Se connecter"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center text-muted-foreground">
                  Vous n'avez pas de compte ?{" "}
                  <button 
                    className="text-primary underline underline-offset-2" 
                    onClick={() => setActiveTab("register")}
                  >
                    Créer un compte
                  </button>
                </div>
                <div className="text-sm text-center text-muted-foreground">
                  <button 
                    className="text-primary underline underline-offset-2" 
                    onClick={() => setActiveTab("reset")}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Inscription</CardTitle>
                <CardDescription>
                  Créez un compte pour accéder à toutes les fonctionnalités.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input placeholder="Jean" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Dupont" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="vous@exemple.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmez le mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Inscription en cours...
                        </>
                      ) : (
                        "S'inscrire"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-center w-full text-muted-foreground">
                  Vous avez déjà un compte ?{" "}
                  <button 
                    className="text-primary underline underline-offset-2" 
                    onClick={() => setActiveTab("login")}
                  >
                    Se connecter
                  </button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Reset Password Tab */}
          <TabsContent value="reset">
            <Card>
              <CardHeader>
                <CardTitle>Réinitialiser le mot de passe</CardTitle>
                <CardDescription>
                  Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resetSent ? (
                  <div className="py-6 text-center">
                    <h3 className="text-lg font-medium mb-2">Email envoyé !</h3>
                    <p className="text-muted-foreground mb-4">
                      Veuillez vérifier votre boîte de réception et suivre les instructions pour réinitialiser votre mot de passe.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setResetSent(false);
                        resetForm.reset();
                      }}
                    >
                      Envoyer à nouveau
                    </Button>
                  </div>
                ) : (
                  <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                      <FormField
                        control={resetForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="vous@exemple.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Envoi en cours...
                          </>
                        ) : (
                          "Envoyer le lien de réinitialisation"
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
              <CardFooter>
                <div className="text-sm text-center w-full text-muted-foreground">
                  <button 
                    className="text-primary underline underline-offset-2" 
                    onClick={() => setActiveTab("login")}
                  >
                    Retour à la connexion
                  </button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
