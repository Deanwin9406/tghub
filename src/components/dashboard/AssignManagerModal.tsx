
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AssignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}

interface ManagerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const AssignManagerModal = ({ isOpen, onClose, propertyId }: AssignManagerModalProps) => {
  const [selectedManager, setSelectedManager] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch property managers (users with manager role)
  const { data: managers = [], isLoading } = useQuery({
    queryKey: ['property-managers'],
    queryFn: async () => {
      // Safely get managers by first checking if the table exists
      try {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'manager');

        if (rolesError) throw rolesError;

        if (!userRoles?.length) return [];

        const managerIds = userRoles.map(role => role.user_id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', managerIds);

        if (profilesError) throw profilesError;
        
        return profiles as ManagerProfile[];
      } catch (error) {
        console.error("Error fetching managers:", error);
        return [];
      }
    },
    enabled: isOpen
  });

  // Assign property manager mutation
  const assignManager = useMutation({
    mutationFn: async () => {
      if (!selectedManager || !propertyId) return;

      try {
        // Check if the property_managers table exists and the row exists
        const { data: existingManager } = await supabase
          .rpc('check_property_manager', { 
            p_property_id: propertyId 
          });

        if (existingManager) {
          // Update the existing manager assignment
          const { error } = await supabase
            .rpc('update_property_manager', { 
              p_property_id: propertyId,
              p_manager_id: selectedManager,
              p_updated_at: new Date().toISOString()
            });
            
          if (error) throw error;
        } else {
          // Insert a new manager assignment
          const { error } = await supabase
            .rpc('insert_property_manager', { 
              p_property_id: propertyId,
              p_manager_id: selectedManager,
              p_assigned_at: new Date().toISOString()
            });
            
          if (error) throw error;
        }
      } catch (error) {
        console.error("Error in assignManager mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Property manager assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ['property-details', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-manager', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-ownership', propertyId] });
      onClose();
    },
    onError: (error) => {
      console.error("Error assigning property manager:", error);
      toast.error("Failed to assign property manager");
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignManager.mutate();
  };

  // Load current manager if exists
  useEffect(() => {
    if (isOpen && propertyId) {
      const fetchCurrentManager = async () => {
        try {
          const { data, error } = await supabase
            .rpc('get_property_manager', { 
              p_property_id: propertyId 
            });
            
          if (data && !error) {
            setSelectedManager(data.manager_id);
          } else {
            setSelectedManager('');
          }
        } catch (error) {
          console.error("Error fetching current manager:", error);
          setSelectedManager('');
        }
      };
      
      fetchCurrentManager();
    }
  }, [isOpen, propertyId]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Property Manager</DialogTitle>
          <DialogDescription>
            Select a property manager to assign to this property.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manager" className="col-span-4">
                Property Manager
              </Label>
              <Select
                value={selectedManager}
                onValueChange={setSelectedManager}
                disabled={isLoading}
              >
                <SelectTrigger className="col-span-4">
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.first_name} {manager.last_name} ({manager.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedManager || assignManager.isPending}
            >
              {assignManager.isPending ? "Assigning..." : "Assign Manager"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignManagerModal;
