
import { supabase } from './client';

// Check if a property manager exists for a property
export const checkPropertyManager = async (propertyId: string) => {
  try {
    const { data, error } = await supabase
      .from('property_managers')
      .select('id, manager_id')
      .eq('property_id', propertyId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking property manager:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception checking property manager:', err);
    return null;
  }
};

// Get property manager for a property
export const getPropertyManager = async (propertyId: string) => {
  try {
    const { data: manager, error: managerError } = await supabase
      .from('property_managers')
      .select('manager_id, assigned_at, updated_at')
      .eq('property_id', propertyId)
      .maybeSingle();
    
    if (managerError) {
      console.error('Error getting property manager:', managerError);
      return null;
    }
    
    if (!manager) return null;
    
    // Get manager profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, avatar_url')
      .eq('id', manager.manager_id)
      .single();
    
    if (profileError) {
      console.error('Error getting manager profile:', profileError);
      return null;
    }
    
    return {
      ...profile,
      assigned_at: manager.assigned_at,
      updated_at: manager.updated_at
    };
  } catch (err) {
    console.error('Exception getting property manager:', err);
    return null;
  }
};

// Update a property manager
export const updatePropertyManager = async (propertyId: string, managerId: string) => {
  try {
    const existingManager = await checkPropertyManager(propertyId);
    
    if (existingManager) {
      // Update existing assignment
      const { error } = await supabase
        .from('property_managers')
        .update({ 
          manager_id: managerId,
          updated_at: new Date().toISOString()
        })
        .eq('property_id', propertyId);
      
      if (error) throw error;
    } else {
      // Create new assignment
      const { error } = await supabase
        .from('property_managers')
        .insert({
          property_id: propertyId,
          manager_id: managerId,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (err) {
    console.error('Error updating property manager:', err);
    return false;
  }
};

// Get properties with manager information
export const getPropertiesWithManagerInfo = async (ownerId: string) => {
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*, property_managers!left(manager_id)')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return properties.map(property => ({
      ...property,
      has_manager: !!property.property_managers?.manager_id
    }));
  } catch (err) {
    console.error('Error getting properties with manager info:', err);
    return [];
  }
};

// Check if a property has an agent
export const checkPropertyAgent = async (propertyId: string) => {
  try {
    const { data, error } = await supabase
      .from('agent_properties')
      .select('id, agent_id, commission_percentage, is_exclusive')
      .eq('property_id', propertyId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking property agent:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception checking property agent:', err);
    return null;
  }
};

// Get agent info for a property
export const getPropertyAgent = async (propertyId: string) => {
  try {
    const { data: agent, error: agentError } = await supabase
      .from('agent_properties')
      .select('agent_id, commission_percentage, is_exclusive, start_date, end_date')
      .eq('property_id', propertyId)
      .maybeSingle();
    
    if (agentError) {
      console.error('Error getting property agent:', agentError);
      return null;
    }
    
    if (!agent) return null;
    
    // Get agent profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, avatar_url')
      .eq('id', agent.agent_id)
      .single();
    
    if (profileError) {
      console.error('Error getting agent profile:', profileError);
      return null;
    }
    
    return {
      ...profile,
      commission_percentage: agent.commission_percentage,
      is_exclusive: agent.is_exclusive,
      start_date: agent.start_date,
      end_date: agent.end_date
    };
  } catch (err) {
    console.error('Exception getting property agent:', err);
    return null;
  }
};
