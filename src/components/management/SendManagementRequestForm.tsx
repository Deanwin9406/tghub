
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SendManagementRequestFormProps {
  propertyId: string;
  ownerId: string;
  onSuccess: () => void;
}

interface FormValues {
  commission: number;
  message: string;
}

const SendManagementRequestForm = ({ propertyId, ownerId, onSuccess }: SendManagementRequestFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      commission: 5,
      message: 'I would like to manage this property.'
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('management_requests')
        .insert({
          property_id: propertyId,
          requester_id: user.id,
          recipient_id: ownerId,
          commission_percentage: data.commission,
          message: data.message,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: 'Request sent',
        description: 'Your management request has been sent to the property owner.',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send management request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="commission">Commission Percentage</Label>
        <Input
          id="commission"
          type="number"
          step="0.1"
          min="0"
          max="100"
          {...register('commission', { 
            required: 'Commission is required',
            min: { value: 0, message: 'Commission cannot be negative' },
            max: { value: 100, message: 'Commission cannot exceed 100%' }
          })}
        />
        {errors.commission && (
          <p className="text-sm text-destructive">{errors.commission.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message to Owner</Label>
        <Textarea
          id="message"
          {...register('message', { required: 'Message is required' })}
          rows={4}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Sending Request...
          </>
        ) : (
          'Send Management Request'
        )}
      </Button>
    </form>
  );
};

export default SendManagementRequestForm;
