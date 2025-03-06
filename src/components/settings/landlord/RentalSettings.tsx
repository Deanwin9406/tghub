
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Home, Settings, CalendarDays } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RentalSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rentDueDay, setRentDueDay] = useState('1');
  const [latePaymentGracePeriod, setLatePaymentGracePeriod] = useState('3');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [rentalTerm, setRentalTerm] = useState('monthly');
  const [defaultLeaseTemplate, setDefaultLeaseTemplate] = useState('standard');
  const [defaultLateReminderMessage, setDefaultLateReminderMessage] = useState(
    'Rappel amical: votre paiement de loyer est en retard. Veuillez effectuer le paiement dès que possible.'
  );

  const handleSaveSettings = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Paramètres enregistrés",
        description: "Vos préférences de location ont été mises à jour.",
      });
    }, 1000);
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Préférences de paiement
          </CardTitle>
          <CardDescription>Définissez les paramètres par défaut pour les paiements de loyer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rent-due-day">Jour d'échéance du loyer</Label>
              <Select value={rentDueDay} onValueChange={setRentDueDay}>
                <SelectTrigger id="rent-due-day">
                  <SelectValue placeholder="Sélectionnez un jour" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(28)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Le jour du mois où le loyer est dû pour tous les baux
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grace-period">Période de grâce pour paiement tardif (jours)</Label>
              <Select value={latePaymentGracePeriod} onValueChange={setLatePaymentGracePeriod}>
                <SelectTrigger id="grace-period">
                  <SelectValue placeholder="Sélectionnez le nombre de jours" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(15)].map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Nombre de jours avant qu'un paiement en retard ne soit considéré comme tel
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-method">Méthode de paiement préférée</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="grid grid-cols-2 gap-2 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer">Virement bancaire</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Espèces</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile_money" id="mobile_money" />
                <Label htmlFor="mobile_money">Mobile Money</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="check" id="check" />
                <Label htmlFor="check">Chèque</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="late-reminder">Message de rappel de retard par défaut</Label>
            <Textarea
              id="late-reminder"
              value={defaultLateReminderMessage}
              onChange={(e) => setDefaultLateReminderMessage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Message envoyé automatiquement aux locataires en retard de paiement
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="mr-2 h-5 w-5" />
            Préférences de bail
          </CardTitle>
          <CardDescription>Configurez les paramètres par défaut pour les nouveaux baux</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rental-term">Durée de location par défaut</Label>
            <RadioGroup 
              value={rentalTerm} 
              onValueChange={setRentalTerm}
              className="grid grid-cols-2 gap-2 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Mensuel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarterly" id="quarterly" />
                <Label htmlFor="quarterly">Trimestriel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="semi_annual" id="semi_annual" />
                <Label htmlFor="semi_annual">Semestriel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="annual" id="annual" />
                <Label htmlFor="annual">Annuel</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="auto-renewal" className="font-medium">Renouvellement automatique</Label>
              <p className="text-sm text-muted-foreground">
                Les baux seront automatiquement renouvelés à leur expiration
              </p>
            </div>
            <Switch 
              id="auto-renewal"
              checked={autoRenewal} 
              onCheckedChange={setAutoRenewal}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lease-template">Modèle de bail par défaut</Label>
            <Select value={defaultLeaseTemplate} onValueChange={setDefaultLeaseTemplate}>
              <SelectTrigger id="lease-template">
                <SelectValue placeholder="Sélectionnez un modèle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="short_term">Court terme</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Le modèle de contrat utilisé par défaut pour les nouveaux baux
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        onClick={handleSaveSettings} 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          'Enregistrer les paramètres'
        )}
      </Button>
    </>
  );
};

export default RentalSettings;
