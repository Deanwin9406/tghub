
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  unread_count: number;
  last_message: string;
  last_message_time: string;
};

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch contacts list
  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_message_contacts', { current_user_id: user.id });
      
      if (error) throw error;
      
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific contact
  const fetchMessages = async (contactId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`sender_id.eq.${contactId},recipient_id.eq.${contactId}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(data || []);
      
      // Mark messages as read
      const unreadMessages = data?.filter(
        (msg) => msg.recipient_id === user.id && !msg.is_read && msg.sender_id === contactId
      );
      
      if (unreadMessages && unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(msg => msg.id));
        
        // Update contacts list to reflect read messages
        fetchContacts();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages.',
        variant: 'destructive',
      });
    }
  };

  // Send a new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedContact || !newMessage.trim()) return;
    
    setSendingMessage(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedContact.id,
          content: newMessage.trim(),
        });
      
      if (error) throw error;
      
      setNewMessage('');
      fetchMessages(selectedContact.id);
      fetchContacts(); // Refresh contacts list to update last message
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Subscribe to real-time updates
  const subscribeToMessages = () => {
    if (!user) return;
    
    const subscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` },
        (payload) => {
          // If we're already chatting with this sender, fetch new messages
          if (selectedContact && payload.new.sender_id === selectedContact.id) {
            fetchMessages(selectedContact.id);
          }
          
          // Refresh contacts list
          fetchContacts();
          
          // Notify user if they're not chatting with this sender
          if (!selectedContact || payload.new.sender_id !== selectedContact.id) {
            const sender = contacts.find(c => c.id === payload.new.sender_id);
            if (sender) {
              toast({
                title: `New message from ${sender.first_name} ${sender.last_name}`,
                description: payload.new.content.length > 30 
                  ? `${payload.new.content.substring(0, 30)}...` 
                  : payload.new.content,
              });
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  };

  // Initial load
  useEffect(() => {
    fetchContacts();
    
    // Set up subscription
    const unsubscribe = subscribeToMessages();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // When a contact is selected
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Contacts List */}
          <Card className="md:col-span-1 overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Contacts</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un contact..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'Aucun contact trouvé' : 'Aucune conversation démarrée'}
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center p-3 hover:bg-muted cursor-pointer ${
                        selectedContact?.id === contact.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatar_url || ''} />
                          <AvatarFallback>{getInitials(contact.first_name, contact.last_name)}</AvatarFallback>
                        </Avatar>
                        {contact.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                            {contact.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <p className="font-medium truncate">{`${contact.first_name} ${contact.last_name}`}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.last_message}
                        </p>
                      </div>
                      {contact.last_message_time && (
                        <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(contact.last_message_time), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
          
          {/* Chat Area */}
          <Card className="md:col-span-3 flex flex-col overflow-hidden">
            {selectedContact ? (
              <>
                <CardHeader className="p-4 border-b">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedContact.avatar_url || ''} />
                      <AvatarFallback>
                        {getInitials(selectedContact.first_name, selectedContact.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <CardTitle className="text-lg">{`${selectedContact.first_name} ${selectedContact.last_name}`}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 p-4 h-[calc(100vh-22rem)]">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : 'bg-muted rounded-bl-none'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatDistanceToNow(new Date(message.created_at), {
                                addSuffix: true,
                                locale: fr
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Separator />
                  <div className="p-4">
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <Input
                        placeholder="Écrivez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sendingMessage}
                      />
                      <Button type="submit" disabled={!newMessage.trim() || sendingMessage}>
                        {sendingMessage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                <div className="mb-4">
                  <Send className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-medium mb-2">Aucune conversation sélectionnée</h3>
                <p>Sélectionnez un contact pour démarrer une conversation</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
