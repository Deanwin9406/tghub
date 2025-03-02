import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  size_sqm: number;
  status: string;
  main_image_url: string;
  property_type: string;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: string;
  created_at: string;
  property: {
    title: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  payment_date: string | null;
  lease: {
    property: {
      title: string;
    };
  };
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
  };
}

interface UseDashboardDataProps {
  user: User | null;
  roles: string[];
}

export const useDashboardData = ({ user, roles }: UseDashboardDataProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  const { data: propertyData } = useQuery({
    queryKey: ['user-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id);
      
      if (error) {
        console.error("Error fetching properties:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user && roles.includes('landlord'),
  });

  const { data: maintenanceData } = useQuery({
    queryKey: ['user-maintenance', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const query = roles.includes('landlord')
        ? supabase
            .from('maintenance_requests')
            .select('id, title, status, priority, created_at, property:properties(title)')
            .order('created_at', { ascending: false })
        : supabase
            .from('maintenance_requests')
            .select('id, title, status, priority, created_at, property:properties(title)')
            .eq('tenant_id', user.id)
            .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching maintenance requests:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  const { data: paymentData } = useQuery({
    queryKey: ['user-payments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('payments')
        .select('id, amount, status, due_date, payment_date, lease:leases(property:properties(title))')
        .order('due_date', { ascending: false });
      
      if (error) {
        console.error("Error fetching payments:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user && roles.includes('tenant'),
  });

  const { data: messageData } = useQuery({
    queryKey: ['recent-messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, created_at, sender:profiles!sender_id(first_name, last_name)')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (propertyData) {
      if (Array.isArray(propertyData) && !('error' in propertyData[0] || {}) && propertyData.length > 0) {
        setProperties(propertyData as Property[]);
      }
    }
  }, [propertyData]);

  useEffect(() => {
    if (maintenanceData) {
      setMaintenanceRequests(maintenanceData as MaintenanceRequest[]);
    }
  }, [maintenanceData]);

  useEffect(() => {
    if (paymentData) {
      if (Array.isArray(paymentData) && paymentData.length > 0) {
        setPayments(paymentData as Payment[]);
      }
    }
  }, [paymentData]);

  useEffect(() => {
    if (messageData) {
      const safeMessages = messageData.map(msg => {
        return {
          id: msg.id || 'unknown',
          content: msg.content || 'No content',
          created_at: msg.created_at || new Date().toISOString(),
          sender: {
            first_name: msg.sender?.first_name || 'Unknown',
            last_name: msg.sender?.last_name || ''
          }
        };
      });
      
      setRecentMessages(safeMessages as Message[]);
    }
  }, [messageData]);

  return {
    properties,
    maintenanceRequests,
    payments,
    recentMessages
  };
};
