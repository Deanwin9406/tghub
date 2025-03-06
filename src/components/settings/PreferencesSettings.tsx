
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bell, Moon, Sun, Languages } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';

const PreferencesSettings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('fr');

  const handleSavePreferences = async () => {
    setLoading(true);
    
    // Simulate saving preferences
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Préférences enregistrées",
        description: "Vos préférences ont été mises à jour avec succès.",
      });
    }, 1000);
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Gérez vos préférences de notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">Notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Recevez des mises à jour importantes par email
              </p>
            </div>
            <Switch 
              id="email-notifications"
              checked={emailNotifications} 
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="push-notifications" className="font-medium">Notifications push</Label>
              <p className="text-sm text-muted-foreground">
                Recevez des notifications dans votre navigateur
              </p>
            </div>
            <Switch 
              id="push-notifications"
              checked={pushNotifications} 
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="mr-2 h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute mr-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="ml-2">Apparence</span>
          </CardTitle>
          <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            defaultValue={theme}
            onValueChange={setTheme}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light">Clair</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark">Sombre</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">Système</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Languages className="mr-2 h-5 w-5" />
            Langue
          </CardTitle>
          <CardDescription>Définissez votre langue préférée</CardDescription>
        </CardHeader>
        <CardContent>
          <Select defaultValue={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Sélectionnez une langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <Button 
        onClick={handleSavePreferences} 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          'Enregistrer les préférences'
        )}
      </Button>
    </>
  );
};

export default PreferencesSettings;
