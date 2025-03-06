
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Map, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Territory {
  id: string;
  agent_id: string;
  territory_name: string;
  city: string;
  state: string;
  postal_codes: string[];
  is_primary: boolean;
}

const TerritoriesSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTerritory, setNewTerritory] = useState({
    territory_name: '',
    city: '',
    state: '',
    postal_codes: '',
    is_primary: false
  });

  useEffect(() => {
    if (user) {
      fetchTerritories();
    }
  }, [user]);

  const fetchTerritories = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('agent_territories')
        .select('*')
        .eq('agent_id', user.id)
        .order('is_primary', { ascending: false });
        
      if (error) throw error;
      
      setTerritories(data || []);
    } catch (error) {
      console.error('Error fetching territories:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos territoires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTerritory = async () => {
    if (!user) return;
    
    if (!newTerritory.territory_name || !newTerritory.city || !newTerritory.state) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      // Split postal codes by comma
      const postalCodes = newTerritory.postal_codes
        .split(',')
        .map(code => code.trim())
        .filter(code => code.length > 0);
        
      // Check if this would be the first territory
      const isPrimary = territories.length === 0 ? true : newTerritory.is_primary;
      
      // If setting as primary, update existing territories
      if (isPrimary) {
        await supabase
          .from('agent_territories')
          .update({ is_primary: false })
          .eq('agent_id', user.id);
      }
      
      // Add new territory
      const { error } = await supabase
        .from('agent_territories')
        .insert([{
          agent_id: user.id,
          territory_name: newTerritory.territory_name,
          city: newTerritory.city,
          state: newTerritory.state,
          postal_codes: postalCodes,
          is_primary: isPrimary
        }]);
        
      if (error) throw error;
      
      toast({
        title: "Territoire ajouté",
        description: "Le nouveau territoire a été ajouté avec succès",
      });
      
      // Reset form and refresh data
      setNewTerritory({
        territory_name: '',
        city: '',
        state: '',
        postal_codes: '',
        is_primary: false
      });
      setShowAddForm(false);
      fetchTerritories();
    } catch (error) {
      console.error('Error adding territory:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le territoire",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTerritory = async (id: string, isPrimary: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('agent_territories')
        .delete()
        .eq('id', id)
        .eq('agent_id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Territoire supprimé",
        description: "Le territoire a été supprimé avec succès",
      });
      
      // If we deleted the primary territory, set a new one
      if (isPrimary && territories.length > 1) {
        const nextPrimary = territories.find(t => t.id !== id);
        if (nextPrimary) {
          await supabase
            .from('agent_territories')
            .update({ is_primary: true })
            .eq('id', nextPrimary.id);
        }
      }
      
      fetchTerritories();
    } catch (error) {
      console.error('Error deleting territory:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le territoire",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (id: string) => {
    if (!user) return;
    
    try {
      // Set all territories to non-primary
      await supabase
        .from('agent_territories')
        .update({ is_primary: false })
        .eq('agent_id', user.id);
        
      // Set selected territory as primary
      const { error } = await supabase
        .from('agent_territories')
        .update({ is_primary: true })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Territoire principal mis à jour",
        description: "Le territoire principal a été modifié avec succès",
      });
      
      fetchTerritories();
    } catch (error) {
      console.error('Error setting primary territory:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le territoire principal",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTerritory(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Map className="mr-2 h-5 w-5" />
                Territoires
              </CardTitle>
              <CardDescription>Gérez les zones géographiques où vous opérez</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Annuler
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 border rounded-md">
              <h3 className="font-medium text-lg mb-4">Ajouter un nouveau territoire</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="territory_name">Nom du territoire *</Label>
                    <Input
                      id="territory_name"
                      name="territory_name"
                      value={newTerritory.territory_name}
                      onChange={handleInputChange}
                      placeholder="Ex: Centre-ville"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={newTerritory.city}
                      onChange={handleInputChange}
                      placeholder="Ex: Lomé"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">État/Région *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={newTerritory.state}
                      onChange={handleInputChange}
                      placeholder="Ex: Maritime"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postal_codes">Codes postaux (séparés par des virgules)</Label>
                    <Input
                      id="postal_codes"
                      name="postal_codes"
                      value={newTerritory.postal_codes}
                      onChange={handleInputChange}
                      placeholder="Ex: 01BP, 02BP, 03BP"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="is_primary"
                    checked={newTerritory.is_primary}
                    onCheckedChange={(checked) => 
                      setNewTerritory(prev => ({ ...prev, is_primary: checked }))
                    }
                  />
                  <Label htmlFor="is_primary">Définir comme territoire principal</Label>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={handleAddTerritory} 
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      'Ajouter le territoire'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {territories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Vous n'avez pas encore défini de territoires</p>
              <p className="text-sm mt-1">Ajoutez votre premier territoire pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {territories.map((territory) => (
                <div 
                  key={territory.id}
                  className={`p-4 border rounded-md ${territory.is_primary ? 'bg-primary-foreground' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{territory.territory_name}</h3>
                        {territory.is_primary && (
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            Principal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {territory.city}, {territory.state}
                      </p>
                      {territory.postal_codes && territory.postal_codes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {territory.postal_codes.map((code, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!territory.is_primary && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSetPrimary(territory.id)}
                        >
                          Définir principal
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTerritory(territory.id, territory.is_primary)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default TerritoriesSettings;
