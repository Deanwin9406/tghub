
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { MessageCircle, Search, Send } from 'lucide-react';

interface MessageContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  last_message: string;
  last_message_date: string;
  unread_count: number;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  read_at: string | null;
}

const VendorMessagesTab = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<MessageContact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<MessageContact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
      markMessagesAsRead(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // This query gets unique users who have sent messages to or received messages from the current user
      const { data: messageParticipants, error } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Extract unique user IDs from messages
      const uniqueUserIds = new Set<string>();
      messageParticipants?.forEach(msg => {
        if (msg.sender_id !== user.id) uniqueUserIds.add(msg.sender_id);
        if (msg.recipient_id !== user.id) uniqueUserIds.add(msg.recipient_id);
      });
      
      if (uniqueUserIds.size === 0) {
        setContacts([]);
        setLoading(false);
        return;
      }
      
      // Get profile details for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .in('id', Array.from(uniqueUserIds));
      
      if (profilesError) throw profilesError;
      
      // Get unread message counts
      const { data: unreadCounts, error: unreadError } = await supabase
        .from('messages')
        .select('sender_id, count(*)')
        .eq('recipient_id', user.id)
        .is('read_at', null)
        .group('sender_id');
      
      if (unreadError) throw unreadError;
      
      // Create a map of user IDs to unread counts
      const unreadCountMap = new Map<string, number>();
      unreadCounts?.forEach(item => {
        unreadCountMap.set(item.sender_id, parseInt(item.count));
      });
      
      // Create contact objects with last message info
      const contactsWithLastMessage = profiles?.map(profile => {
        // Find the most recent message for this contact
        const lastMessage = messageParticipants?.find(msg => 
          msg.sender_id === profile.id || msg.recipient_id === profile.id
        );
        
        return {
          id: profile.id,
          first_name: profile.first_name || 'Unknown',
          last_name: profile.last_name || 'User',
          email: profile.email || '',
          avatar_url: profile.avatar_url || '',
          last_message: lastMessage?.content || 'No messages yet',
          last_message_date: lastMessage?.created_at || new Date().toISOString(),
          unread_count: unreadCountMap.get(profile.id) || 0
        };
      });
      
      // Sort contacts by last message date
      contactsWithLastMessage?.sort((a, b) => 
        new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()
      );
      
      setContacts(contactsWithLastMessage || []);
      
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load message contacts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    if (!user || !contactId) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(data || []);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', senderId)
        .eq('recipient_id', user.id)
        .is('read_at', null);
      
      if (error) throw error;
      
      // Update the unread count in the contacts list
      setContacts(prev => prev.map(contact => 
        contact.id === senderId ? { ...contact, unread_count: 0 } : contact
      ));
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedContact || !messageText.trim()) return;
    
    try {
      setSendingMessage(true);
      
      const newMessage = {
        sender_id: user.id,
        recipient_id: selectedContact.id,
        content: messageText.trim(),
        created_at: new Date().toISOString(),
        status: 'sent'
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select();
      
      if (error) throw error;
      
      // Add the new message to the messages list
      if (data && data[0]) {
        setMessages(prev => [...prev, data[0]]);
      }
      
      // Update the contact's last message
      setContacts(prev => prev.map(contact => 
        contact.id === selectedContact.id ? { 
          ...contact, 
          last_message: messageText.trim(),
          last_message_date: new Date().toISOString()
        } : contact
      ));
      
      // Clear the message input
      setMessageText('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const selectContact = (contact: MessageContact) => {
    setSelectedContact(contact);
  };

  const filteredContacts = contacts.filter(contact => 
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle>Messages</CardTitle>
            <CardDescription>Your conversations</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredContacts.length > 0 ? (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className={`flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer ${
                      selectedContact?.id === contact.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => selectContact(contact)}
                  >
                    <Avatar>
                      <AvatarImage 
                        src={contact.avatar_url} 
                        alt={`${contact.first_name} ${contact.last_name}`} 
                      />
                      <AvatarFallback>
                        {contact.first_name.charAt(0) + contact.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm truncate">
                          {contact.first_name} {contact.last_name}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(contact.last_message_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {contact.last_message}
                      </p>
                    </div>
                    {contact.unread_count > 0 && (
                      <Badge variant="default" className="ml-2">
                        {contact.unread_count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "No contacts match your search" 
                    : "No messages yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          {selectedContact ? (
            <>
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage 
                      src={selectedContact.avatar_url} 
                      alt={`${selectedContact.first_name} ${selectedContact.last_name}`} 
                    />
                    <AvatarFallback>
                      {selectedContact.first_name.charAt(0) + selectedContact.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedContact.first_name} {selectedContact.last_name}
                    </CardTitle>
                    <CardDescription>{selectedContact.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 h-[500px]">
                <div className="space-y-4">
                  {messages.length > 0 ? messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender_id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Send a message to start the conversation
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              
              <CardFooter className="border-t pt-4">
                <div className="flex w-full gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!messageText.trim() || sendingMessage}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <MessageCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium">Select a conversation</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Choose a contact from the list to view your conversation history
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VendorMessagesTab;
