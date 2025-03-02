import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Send, User } from 'lucide-react';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  unread_count: number;
  last_message?: string;
  last_message_time?: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

const Messages = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_message_contacts', {
        current_user_id: user.id
      });

      if (error) throw error;
      
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (!user || !currentContact) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            recipient_id,
            content,
            created_at,
            is_read,
            sender:profiles!messages_sender_id_fkey(first_name, last_name, avatar_url)
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${currentContact.id}),and(sender_id.eq.${currentContact.id},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMessages(data);

        const unreadMessageIds = data
          .filter(m => m.recipient_id === user.id && !m.is_read)
          .map(m => m.id);

        if (unreadMessageIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessageIds);
            
          fetchContacts();
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    fetchMessages();

    const messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new.sender_id === currentContact.id) {
          setMessages(prev => [...prev, payload.new as Message]);
          
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', payload.new.id);
        } else {
          fetchContacts();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [user, currentContact, toast, fetchContacts]);

  const sendMessage = async () => {
    if (!user || !currentContact || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: currentContact.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    return '?';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden min-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 min-h-[70vh]">
            <div className="border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Rechercher un contact..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="h-[calc(70vh-80px)] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Aucun contact</p>
                    <p className="text-muted-foreground mb-4">
                      Vous n'avez pas encore échangé de messages.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {filteredContacts.map((contact) => (
                      <li 
                        key={contact.id}
                        className={`hover:bg-muted/30 transition-colors cursor-pointer p-4 ${currentContact?.id === contact.id ? 'bg-muted/50' : ''}`}
                        onClick={() => setCurrentContact(contact)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={contact.avatar_url} alt={`${contact.first_name} ${contact.last_name}`} />
                            <AvatarFallback>{getInitials(contact.first_name, contact.last_name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">{contact.first_name} {contact.last_name}</p>
                              {contact.last_message_time && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(contact.last_message_time)}
                                </span>
                              )}
                            </div>
                            {contact.last_message && (
                              <p className="text-sm text-muted-foreground truncate">
                                {contact.last_message}
                              </p>
                            )}
                          </div>
                          {contact.unread_count > 0 && (
                            <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                              {contact.unread_count}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
              {!currentContact ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-medium mb-2">Vos messages</p>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Sélectionnez un contact pour voir vos messages ou commencer une nouvelle conversation.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={currentContact.avatar_url} alt={`${currentContact.first_name} ${currentContact.last_name}`} />
                      <AvatarFallback>{getInitials(currentContact.first_name, currentContact.last_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentContact.first_name} {currentContact.last_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 h-[calc(70vh-160px)]">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`mb-4 flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t">
                    <div className="flex items-center">
                      <Textarea
                        placeholder="Tapez votre message..."
                        className="resize-none"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button 
                        className="ml-2 px-3 h-full" 
                        onClick={sendMessage}
                        disabled={sendingMessage || !newMessage.trim()}
                      >
                        {sendingMessage ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send size={20} />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const MessageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default Messages;
