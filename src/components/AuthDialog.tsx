
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const { signIn, signUp, resetPassword, session, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userRole, setUserRole] = useState('tenant');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') === 'true') {
      setShowResetForm(true);
    }
    
    if (session && !isLoading) {
      onOpenChange(false);
      navigate('/dashboard');
    }
  }, [session, isLoading, navigate, location, onOpenChange]);

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
          title: 'Bienvenue!',
          description: 'Vous vous êtes connecté avec succès.',
        });
        onOpenChange(false);
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
          description: 'Veuillez fournir votre prénom et nom',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      if (password !== confirmPassword) {
        toast({
          title: 'Mots de passe non identiques',
          description: 'Les mots de passe ne correspondent pas',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Signing up with:", { email, firstName, lastName, userRole }); // Debug log
      
      const { error } = await signUp(email, password, firstName, lastName);
      
      if (error) {
        toast({
          title: 'Échec d\'inscription',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Add user role if signup was successful
        if (userRole) {
          // We will handle adding user role in a separate step if needed
          console.log("User role selected:", userRole);
        }
        
        toast({
          title: 'Compte créé',
          description: 'Veuillez vérifier votre email pour confirmation.',
        });
        setActiveTab('login');
      }
    } catch (error: any) {
      toast({
        title: 'Échec d\'inscription',
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

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Chargement...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {showResetForm ? 'Réinitialiser le mot de passe' : 'Bienvenue sur TogoProp'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {showResetForm 
              ? 'Entrez votre email pour recevoir un lien de réinitialisation' 
              : 'La première plateforme de gestion immobilière pour les utilisateurs togolais'}
          </DialogDescription>
        </DialogHeader>
        
        {showResetForm ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="votre.email@exemple.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Traitement...' : 'Envoyer le lien de réinitialisation'}
            </Button>
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setShowResetForm(false)}
                className="text-sm"
                type="button"
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
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="votre.email@exemple.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
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
                      Mot de passe oublié?
                    </Button>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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
                    <Input 
                      id="firstName" 
                      placeholder="Jean" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
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
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="votre.email@exemple.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userRole">Je suis un(e)</Label>
                  <Select 
                    value={userRole} 
                    onValueChange={setUserRole}
                  >
                    <SelectTrigger id="userRole">
                      <SelectValue placeholder="Sélectionnez votre profil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant">Locataire</SelectItem>
                      <SelectItem value="landlord">Propriétaire</SelectItem>
                      <SelectItem value="agent">Agent immobilier</SelectItem>
                      <SelectItem value="manager">Gestionnaire de propriété</SelectItem>
                      <SelectItem value="vendor">Prestataire de service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Création du compte...' : 'Créer un compte'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
        
        <DialogFooter className="text-center text-sm text-muted-foreground">
          En continuant, vous acceptez les{" "}
          <a href="/terms" className="underline underline-offset-4 hover:text-primary">
            Conditions d'utilisation
          </a>{" "}
          et la{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Politique de confidentialité
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
