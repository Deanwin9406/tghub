import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface Thread {
  id: string;
  participant_ids: string[];
  last_message: {
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count: number;
  updated_at: string;
  participants: Participant[];
}

interface Participant {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  
  // For creating new threads
  const [users, setUsers] = useState<Participant[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchThreads();
      fetchUsers();
      
      // Check for user_id in URL params to start a new conversation
      const recipientId = searchParams.get('user');
      if (recipientId) {
        // Check if there's an existing thread with this user
        createOrFindThread(recipientId);
      }
    }
  }, [user]);

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread);
      markThreadAsRead(activeThread);
    }
  }, [activeThread]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_threads')
        .select('*')
        .contains('participant_ids', [user!.id])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch participants for each thread
      const threadsWithParticipants = await Promise.all(
        data.map(async (thread) => {
          const participants = await fetchParticipantsForThread(thread.id);
          return {
            ...thread,
            participants,
          };
        })
      );

      setThreads(threadsWithParticipants);

      // If no active thread is set, set the first one
      if (threadsWithParticipants.length > 0 && !activeThread) {
        setActiveThread(threadsWithParticipants[0].id);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantsForThread = async (threadId: string): Promise<Participant[]> => {
    try {
      const { data, error } = await supabase
        .from('message_thread_participants')
        .select(`
          user_id,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('thread_id', threadId);

      if (error) throw error;

      // Store participants in the participants state for easy lookup
      const participantData = data.map(p => p.profiles as Participant);
      
      // Update our participants record
      const newParticipants = { ...participants };
      participantData.forEach(p => {
        newParticipants[p.id] = p;
      });
      setParticipants(newParticipants);

      return participantData;
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages',
        variant: 'destructive',
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .neq('id', user!.id);

      if (error) throw error;

      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const markThreadAsRead = async (threadId: string) => {
    try {
      // Mark all messages in this thread as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('recipient_id', user!.id)
        .is('read_at', null);

      // Update the thread's unread count
      const updatedThreads = threads.map(thread => {
        if (thread.id === threadId) {
          return { ...thread, unread_count: 0 };
        }
        return thread;
      });

      setThreads(updatedThreads);
    } catch (error) {
      console.error('Error marking thread as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!activeThread || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      // Get the other participant's ID
      const otherParticipantId = threads
        .find(t => t.id === activeThread)
        ?.participant_ids
        .find(id => id !== user!.id);

      if (!otherParticipantId) {
        toast({
          title: 'Erreur',
          description: 'Impossible de déterminer le destinataire',
          variant: 'destructive',
        });
        return;
      }

      // Create the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: activeThread,
          sender_id: user!.id,
          recipient_id: otherParticipantId,
          content: newMessage,
        })
        .select();

      if (error) throw error;

      // Add the new message to the messages array
      setMessages([...messages, data[0]]);
      
      // Clear the input
      setNewMessage('');
      
      // Refresh threads to update last_message
      fetchThreads();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const createOrFindThread = async (recipientId: string) => {
    try {
      // Check if there's an existing thread with this user
      const { data: existingThreads, error: findError } = await supabase
        .from('message_threads')
        .select('*')
        .contains('participant_ids', [user!.id, recipientId]);

      if (findError) throw findError;

      if (existingThreads && existingThreads.length > 0) {
        // Found an existing thread
        setActiveThread(existingThreads[0].id);
        return;
      }

      // Create a new thread
      const { data: newThread, error: createError } = await supabase
        .from('message_threads')
        .insert({
          participant_ids: [user!.id, recipientId],
        })
        .select();

      if (createError) throw createError;

      // Refresh threads and set the active thread
      await fetchThreads();
      if (newThread && newThread.length > 0) {
        setActiveThread(newThread[0].id);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la conversation',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getThreadName = (thread: Thread): string => {
    // Find participants that are not the current user
    const otherParticipants = thread.participants.filter(p => p.id !== user!.id);
    
    if (otherParticipants.length === 0) return 'Nouvelle conversation';
    
    return otherParticipants
      .map(p => `${p.first_name || ''} ${p.last_name || ''}`.trim())
      .join(', ');
  };

  const getInitials = (firstName: string | null, lastName: string | null): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatThreadTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If it's today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's this year, show day and month
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Threads List */}
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader className="pb-2">
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {loading ? (
                    <div className="flex justify-center items-center h-20">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : threads.length === 0 ? (
                    <div className="px-4 py-6 text-center text-muted-foreground">
                      Aucune conversation
                    </div>
                  ) : (
                    <div>
                      {threads.map((thread) => (
                        <div
                          key={thread.id}
                          className={`flex items-center p-4 gap-3 cursor-pointer hover:bg-muted/50 ${
                            activeThread === thread.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setActiveThread(thread.id)}
                        >
                          <Avatar className="h-10 w-10">
                            {thread.participants.filter(p => p.id !== user!.id).map(p => (
                              <AvatarImage key={p.id} src={p.avatar_url || ''} />
                            ))}
                            <AvatarFallback>
                              {getInitials(
                                thread.participants.find(p => p.id !== user!.id)?.first_name || null,
                                thread.participants.find(p => p.id !== user!.id)?.last_name || null
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between">
                              <p className="font-medium truncate">{getThreadName(thread)}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatThreadTime(thread.updated_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {thread.last_message?.content || 'Nouvelle conversation'}
                            </p>
                          </div>
                          {thread.unread_count > 0 && (
                            <div className="rounded-full bg-primary w-5 h-5 flex items-center justify-center text-xs text-primary-foreground">
                              {thread.unread_count}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="w-full">
                  <label className="text-sm font-medium mb-2 block">Nouvelle conversation</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedUser || ''}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="flex-1 p-2 border rounded-md"
                    >
                      <option value="">Sélectionner un utilisateur</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={() => selectedUser && createOrFindThread(selectedUser)}
                      disabled={!selectedUser}
                    >
                      Démarrer
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Messages */}
          <div className="md:col-span-2">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              {activeThread ? (
                <>
                  <CardHeader className="pb-2 border-b">
                    {threads.find((t) => t.id === activeThread) && (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {threads
                            .find((t) => t.id === activeThread)
                            ?.participants.filter(p => p.id !== user!.id)
                            .map(p => (
                              <AvatarImage key={p.id} src={p.avatar_url || ''} />
                            ))}
                          <AvatarFallback>
                            {getInitials(
                              threads.find((t) => t.id === activeThread)?.participants.find(p => p.id !== user!.id)?.first_name || null,
                              threads.find((t) => t.id === activeThread)?.participants.find(p => p.id !== user!.id)?.last_name || null
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <CardTitle>
                          {getThreadName(threads.find((t) => t.id === activeThread)!)}
                        </CardTitle>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-[calc(100vh-320px)] p-4">
                      {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          Aucun message. Commencez la conversation!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => {
                            const isOwnMessage = message.sender_id === user!.id;
                            const sender = participants[message.sender_id];
                            
                            return (
                              <div
                                key={message.id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
                                  {!isOwnMessage && (
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={sender?.avatar_url || ''} />
                                      <AvatarFallback>
                                        {getInitials(sender?.first_name, sender?.last_name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div>
                                    <div
                                      className={`rounded-lg p-3 ${
                                        isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                      }`}
                                    >
                                      <p className="text-sm">{message.content}</p>
                                    </div>
                                    <p className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : ''}`}>
                                      {formatMessageTime(message.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex w-full gap-2">
                      <Input
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={sendingMessage}
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim() || sendingMessage}>
                        {sendingMessage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sélectionnez une conversation pour afficher les messages
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
