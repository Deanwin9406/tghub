
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AssignAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}

interface AgentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const AssignAgentModal = ({ isOpen, onClose, propertyId }: AssignAgentModalProps) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [commissionPercentage, setCommissionPercentage] = useState<string>('5');
  const [isExclusive, setIsExclusive] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Fetch agents (users with agent role)
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['property-agents'],
    queryFn: async () => {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'agent');

      if (rolesError) throw rolesError;

      if (!userRoles.length) return [];

      const agentIds = userRoles.map(role => role.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', agentIds);

      if (profilesError) throw profilesError;
      
      return profiles as AgentProfile[];
    },
    enabled: isOpen
  });

  // Assign agent mutation
  const assignAgent = useMutation({
    mutationFn: async () => {
      if (!selectedAgent || !propertyId) return;

      // Check if there's an existing assignment
      const { data: existingAssignment } = await supabase
        .from('agent_properties')
        .select('id')
        .eq('property_id', propertyId)
        .eq('agent_id', selectedAgent)
        .maybeSingle();

      const commissionValue = parseFloat(commissionPercentage);
      
      // Update or insert based on whether there's an existing assignment
      if (existingAssignment) {
        const { error } = await supabase
          .from('agent_properties')
          .update({ 
            commission_percentage: commissionValue,
            is_exclusive: isExclusive,
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingAssignment.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('agent_properties')
          .insert({ 
            property_id: propertyId, 
            agent_id: selectedAgent,
            commission_percentage: commissionValue,
            is_exclusive: isExclusive,
            start_date: new Date().toISOString().split('T')[0]
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Agent assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ['property-details', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-agents', propertyId] });
      onClose();
    },
    onError: (error) => {
      console.error("Error assigning agent:", error);
      toast.error("Failed to assign agent");
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignAgent.mutate();
  };

  // Load current agent if exists
  useEffect(() => {
    if (isOpen && propertyId) {
      const fetchCurrentAgent = async () => {
        const { data, error } = await supabase
          .from('agent_properties')
          .select('agent_id, commission_percentage, is_exclusive')
          .eq('property_id', propertyId)
          .maybeSingle();
          
        if (data && !error) {
          setSelectedAgent(data.agent_id);
          setCommissionPercentage(data.commission_percentage?.toString() || '5');
          setIsExclusive(data.is_exclusive || false);
        } else {
          setSelectedAgent('');
          setCommissionPercentage('5');
          setIsExclusive(false);
        }
      };
      
      fetchCurrentAgent();
    }
  }, [isOpen, propertyId]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Property Agent</DialogTitle>
          <DialogDescription>
            Select an agent to represent this property for a commission.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent" className="col-span-4">
                Property Agent
              </Label>
              <Select
                value={selectedAgent}
                onValueChange={setSelectedAgent}
                disabled={isLoading}
              >
                <SelectTrigger className="col-span-4">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name} ({agent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commission" className="col-span-4">
                Commission Percentage
              </Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={commissionPercentage}
                onChange={(e) => setCommissionPercentage(e.target.value)}
                className="col-span-4"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="exclusive"
                checked={isExclusive}
                onChange={(e) => setIsExclusive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="exclusive">
                Exclusive Representation
              </Label>
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
              disabled={!selectedAgent || assignAgent.isPending}
            >
              {assignAgent.isPending ? "Assigning..." : "Assign Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAgentModal;
