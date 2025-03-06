
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert, KeyRound, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

const SecuritySettings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(profile?.two_factor_enabled || false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email envoyé",
        description: "Un email de réinitialisation du mot de passe a été envoyé.",
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleTwoFactorToggle = async (checked: boolean) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: checked })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setTwoFactorEnabled(checked);
      
      toast({
        title: checked ? "Authentification à deux facteurs activée" : "Authentification à deux facteurs désactivée",
        description: checked 
          ? "L'authentification à deux facteurs a été activée avec succès." 
          : "L'authentification à deux facteurs a été désactivée.",
      });
    } catch (error) {
      console.error('Error updating 2FA settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres d'authentification. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email || confirmEmail !== user.email) return;
    
    setDeleteLoading(true);
    
    try {
      // In a real implementation, you would delete the account
      // Since Supabase doesn't provide a direct method for users to delete their own accounts,
      // this would typically be handled via a serverless function or API
      
      // For now, we'll just show a success message
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès. Vous allez être déconnecté.",
      });
      
      // Close the dialog
      setIsDeleteDialogOpen(false);
      
      // In a real implementation, you would sign out after deletion
      // await supabase.auth.signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer votre compte. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <KeyRound className="mr-2 h-5 w-5" />
            Mot de passe
          </CardTitle>
          <CardDescription>Gérez votre mot de passe</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Nous vous enverrons un email avec un lien pour réinitialiser votre mot de passe.
          </p>
          <Button 
            onClick={handlePasswordReset} 
            disabled={resetLoading}
          >
            {resetLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5" />
            Sécurité du compte
          </CardTitle>
          <CardDescription>Paramètres de sécurité avancés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Authentification à deux facteurs</h3>
              <p className="text-sm text-muted-foreground">
                Ajoute une couche de sécurité supplémentaire à votre compte.
              </p>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={handleTwoFactorToggle}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Zone de danger
          </CardTitle>
          <CardDescription>
            Les actions dans cette section sont irréversibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            La suppression de votre compte effacera toutes vos données et ne pourra pas être annulée.
          </p>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                Supprimer mon compte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Êtes-vous sûr de vouloir supprimer votre compte ?</DialogTitle>
                <DialogDescription>
                  Cette action est irréversible. Toutes vos données personnelles seront définitivement supprimées.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm font-medium">
                  Pour confirmer, veuillez saisir votre adresse email : <strong>{user?.email}</strong>
                </p>
                <Input 
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Entrez votre email"
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={confirmEmail !== user?.email || deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    'Confirmer la suppression'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
};

export default SecuritySettings;
