
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Loader2, Send, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  status: 'sent' | 'delivered' | 'read';
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const VendorMessagesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      if (!user) return;

      // Get all conversations where the user is involved
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('recipient_id, content, created_at')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id, content, created_at, read_at')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError || receivedError) throw sentError || receivedError;

      // Combine the lists to find unique contacts
      const contactMap = new Map<string, Contact>();
      
      // Process received messages (from others to user)
      if (receivedMessages) {
        for (const msg of receivedMessages) {
          if (!contactMap.has(msg.sender_id)) {
            // Fetch the contact's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, avatar_url')
              .eq('id', msg.sender_id)
              .single();
              
            contactMap.set(msg.sender_id, {
              id: msg.sender_id,
              first_name: profile?.first_name || 'Unknown',
              last_name: profile?.last_name || 'User',
              avatar_url: profile?.avatar_url || null,
              last_message: msg.content,
              last_message_time: msg.created_at,
              unread_count: msg.read_at ? 0 : 1
            });
          }
        }
      }
      
      // Process sent messages (from user to others)
      if (sentMessages) {
        for (const msg of sentMessages) {
          if (!contactMap.has(msg.recipient_id)) {
            // Fetch the contact's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, avatar_url')
              .eq('id', msg.recipient_id)
              .single();
              
            contactMap.set(msg.recipient_id, {
              id: msg.recipient_id,
              first_name: profile?.first_name || 'Unknown',
              last_name: profile?.last_name || 'User',
              avatar_url: profile?.avatar_url || null,
              last_message: msg.content,
              last_message_time: msg.created_at,
              unread_count: 0
            });
          }
        }
      }

      // Convert map to array and sort by last message time
      const contactArray = Array.from(contactMap.values());
      contactArray.sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );
      
      setContacts(contactArray);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos contacts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      if (!user) return;
      
      // Get all messages between the user and the selected contact
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          created_at,
          read_at,
          status
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`sender_id.eq.${contactId},recipient_id.eq.${contactId}`)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Filter to only include messages between these two users
      const filteredMessages = data.filter(msg => 
        (msg.sender_id === user.id && msg.recipient_id === contactId) || 
        (msg.sender_id === contactId && msg.recipient_id === user.id)
      );
      
      // Mark unread messages as read
      const unreadMessages = filteredMessages.filter(
        msg => msg.recipient_id === user.id && !msg.read_at
      );
      
      if (unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(msg => msg.id);
        
        await supabase
          .from('messages')
          .update({ 
            read_at: new Date().toISOString(),
            status: 'read' as 'sent' | 'delivered' | 'read'
          })
          .in('id', unreadIds);
          
        // Update the unread count for the selected contact
        setContacts(contacts.map(contact => 
          contact.id === contactId 
            ? { ...contact, unread_count: 0 }
            : contact
        ));
      }
      
      setMessages(filteredMessages as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedContact || !newMessage.trim()) return;
    
    try {
      setSending(true);
      
      const messageData = {
        sender_id: user.id,
        recipient_id: selectedContact.id,
        content: newMessage,
        created_at: new Date().toISOString(),
        status: 'sent'
      };
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: messageData.sender_id,
          recipient_id: messageData.recipient_id,
          content: messageData.content,
          status: messageData.status as 'sent' | 'delivered' | 'read'
        });
        
      if (error) throw error;
      
      // Update local messages
      setMessages([...messages, messageData as Message]);
      
      // Update the last message in contacts
      setContacts(contacts.map(contact => 
        contact.id === selectedContact.id 
          ? { 
              ...contact, 
              last_message: newMessage,
              last_message_time: new Date().toISOString()
            }
          : contact
      ));
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] lg:h-[600px]">
      <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-4">
        {/* Contacts sidebar */}
        <div className="col-span-1 border rounded-lg overflow-hidden">
          <div className="p-3 border-b bg-muted/50">
            <h3 className="font-medium">Conversations</h3>
          </div>
          <ScrollArea className="h-[calc(100%-48px)]">
            {contacts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>Aucune conversation</p>
              </div>
            ) : (
              <div className="divide-y">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar_url || ''} />
                        <AvatarFallback>
                          {getInitials(contact.first_name, contact.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">
                            {contact.first_name} {contact.last_name}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(contact.last_message_time).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm truncate text-muted-foreground">
                          {contact.last_message}
                        </p>
                      </div>
                      {contact.unread_count > 0 && (
                        <div className="ml-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                          {contact.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="col-span-1 md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
          {selectedContact ? (
            <>
              <div className="p-3 border-b bg-muted/50 flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedContact.avatar_url || ''} />
                  <AvatarFallback>
                    {getInitials(selectedContact.first_name, selectedContact.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedContact.first_name} {selectedContact.last_name}
                  </p>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-3 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center space-x-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim() || sending} size="icon">
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Sélectionnez une conversation pour commencer à discuter
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorMessagesTab;
