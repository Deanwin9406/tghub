
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MessageSender {
  first_name: string;
  last_name: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: MessageSender;
}

interface MessagesTabProps {
  messages?: Message[];
}

const MessagesTab = ({ messages: initialMessages }: MessagesTabProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [loading, setLoading] = useState(!initialMessages);
  
  useEffect(() => {
    if (!initialMessages && user) {
      fetchMessages();
    }
  }, [user]);
  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Fetch messages where the user is the recipient
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id (
            first_name,
            last_name
          )
        `)
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        throw error;
      }
      
      // Transform the data to match our component's expected format
      const formattedMessages = messagesData.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender: {
          first_name: msg.profiles?.first_name || 'Unknown',
          last_name: msg.profiles?.last_name || 'User'
        }
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Messages récents</CardTitle>
          <Button size="sm" onClick={() => navigate('/messages')}>
            Voir tout
          </Button>
        </div>
        <CardDescription>Vos dernières conversations</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Chargement des messages...</p>
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
            <MessageCircle className="h-8 w-8 mb-2" />
            <p>Aucun message récent.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                <div>
                  <p className="font-medium">{message.content}</p>
                  <p className="text-sm text-muted-foreground">
                    De: {message.sender.first_name} {message.sender.last_name}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessagesTab;
