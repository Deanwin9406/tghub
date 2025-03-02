
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LockIcon, MailIcon, UserIcon, BuildingIcon } from 'lucide-react';

const AuthPage = () => {
  const { signIn, signUp, resetPassword, session } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('tenant');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: 'Échec de connexion',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Bienvenue !',
          description: 'Vous êtes connecté avec succès.',
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Échec de connexion',
        description: error.message || 'Une erreur inattendue est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!firstName || !lastName) {
        toast({
          title: 'Informations manquantes',
          description: 'Veuillez fournir vos nom et prénom',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await signUp(email, password, firstName, lastName, role);
      
      if (error) {
        toast({
          title: 'Échec de l\'inscription',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Compte créé',
          description: 'Veuillez compléter la vérification KYC pour activer votre compte.',
        });
        navigate('/kyc-verification');
      }
    } catch (error: any) {
      toast({
        title: 'Échec de l\'inscription',
        description: error.message || 'Une erreur inattendue est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: 'Échec de réinitialisation du mot de passe',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Email de réinitialisation envoyé',
          description: 'Veuillez vérifier votre email pour les instructions.',
        });
        setShowResetForm(false);
        setActiveTab('login');
      }
    } catch (error: any) {
      toast({
        title: 'Échec de réinitialisation du mot de passe',
        description: error.message || 'Une erreur inattendue est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-250px)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">
              {showResetForm ? 'Réinitialiser le mot de passe' : 'Bienvenue sur TogoProp'}
            </CardTitle>
            <CardDescription>
              {showResetForm 
                ? 'Entrez votre email pour recevoir un lien de réinitialisation' 
                : 'La première plateforme de gestion immobilière pour les utilisateurs togolais'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {showResetForm ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="votre.email@exemple.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Traitement...' : 'Envoyer le lien'}
                </Button>
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setShowResetForm(false)}
                    className="text-sm"
                  >
                    Retour à la connexion
                  </Button>
                </div>
              </form>
            ) : (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="votre.email@exemple.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Button 
                          variant="link" 
                          className="text-xs"
                          onClick={() => setShowResetForm(true)}
                          type="button"
                        >
                          Mot de passe oublié ?
                        </Button>
                      </div>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Connexion...' : 'Se connecter'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input 
                            id="firstName" 
                            placeholder="Jean" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Dupont" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="votre.email@exemple.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Type de compte</Label>
                      <RadioGroup value={role} onValueChange={setRole} className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
                          <RadioGroupItem value="tenant" id="tenant" />
                          <Label htmlFor="tenant" className="cursor-pointer flex-1">Locataire</Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
                          <RadioGroupItem value="landlord" id="landlord" />
                          <Label htmlFor="landlord" className="cursor-pointer flex-1">Propriétaire</Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
                          <RadioGroupItem value="agent" id="agent" />
                          <Label htmlFor="agent" className="cursor-pointer flex-1">Agent immobilier</Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
                          <RadioGroupItem value="manager" id="manager" />
                          <Label htmlFor="manager" className="cursor-pointer flex-1">Gestionnaire immobilier</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Création du compte...' : 'Créer un compte'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>

          <CardFooter className="text-center text-sm text-muted-foreground flex-col">
            <p>
              En continuant, vous acceptez les{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                Conditions d'utilisation
              </a>{" "}
              et la{" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Politique de confidentialité
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default AuthPage;
