
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface AssignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}

const AssignManagerModal = ({ isOpen, onClose, propertyId }: AssignManagerModalProps) => {
  const { toast } = useToast();
  const [availableManagers, setAvailableManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentManagerId, setCurrentManagerId] = useState<string | null>(null);
  
  const { handleSubmit, register, setValue, watch } = useForm({
    defaultValues: {
      managerId: ''
    }
  });

  const selectedManagerId = watch('managerId');

  useEffect(() => {
    if (isOpen) {
      fetchManagers();
      checkCurrentManager();
    }
  }, [isOpen, propertyId]);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      // Fetch users with manager role
      const { data: roleData, error: roleError } = await supabase
        .rpc('has_role', {
          role: 'manager'
        });
      
      if (roleError) throw roleError;
      
      if (roleData) {
        // Fetch profiles of users with manager role
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .order('first_name');
          
        if (profilesError) throw profilesError;
        
        if (profilesData) {
          setAvailableManagers(profilesData);
        }
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load property managers.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkCurrentManager = async () => {
    try {
      // Check if property already has a manager
      const { data, error } = await supabase
        .from('property_managers')
        .select('manager_id')
        .eq('property_id', propertyId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setCurrentManagerId(data.manager_id);
        setValue('managerId', data.manager_id);
      }
    } catch (error) {
      console.error('Error checking current manager:', error);
    }
  };

  const onSubmit = async (data: { managerId: string }) => {
    if (!data.managerId) {
      toast({
        title: 'Error',
        description: 'Please select a manager.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (currentManagerId) {
        // Update existing property manager
        const { error } = await supabase
          .from('property_managers')
          .update({ manager_id: data.managerId })
          .eq('property_id', propertyId);
          
        if (error) throw error;
      } else {
        // Insert new property manager
        const { error } = await supabase
          .from('property_managers')
          .insert({
            property_id: propertyId,
            manager_id: data.managerId,
          });
          
        if (error) throw error;
      }
      
      toast({
        title: 'Success',
        description: 'Property manager has been assigned successfully.',
      });
      
      onClose();
    } catch (error) {
      console.error('Error assigning manager:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign property manager.',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeManager = async () => {
    if (!currentManagerId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('property_managers')
        .delete()
        .eq('property_id', propertyId);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Property manager has been removed successfully.',
      });
      
      setCurrentManagerId(null);
      setValue('managerId', '');
      onClose();
    } catch (error) {
      console.error('Error removing manager:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove property manager.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Property Manager</DialogTitle>
          <DialogDescription>
            Select a property manager to assign to this property.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Select 
                value={selectedManagerId} 
                onValueChange={value => setValue('managerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property manager" />
                </SelectTrigger>
                <SelectContent>
                  {availableManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.first_name} {manager.last_name} ({manager.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between pt-4">
              {currentManagerId && (
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={removeManager}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Remove Manager
                </Button>
              )}
              
              <Button type="submit" disabled={saving || !selectedManagerId}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {currentManagerId ? 'Update Manager' : 'Assign Manager'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignManagerModal;
