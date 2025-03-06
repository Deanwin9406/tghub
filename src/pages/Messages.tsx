
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Send, UserCircle2, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read_at: string | null;
}

interface Thread {
  id: string;
  participant_ids: string[];
  last_message: any;
  updated_at: string;
  participants?: any[];
}

interface UserInfo {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string;
}

const Messages = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [userInfo, setUserInfo] = useState<Record<string, UserInfo>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parse query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tenantId = queryParams.get('tenant');
    
    if (tenantId && user) {
      // Check if thread exists or create a new one
      checkOrCreateThread(tenantId);
    }
  }, [location, user]);

  useEffect(() => {
    if (user) {
      fetchThreads();
    }
  }, [user]);

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread.id);
    }
  }, [activeThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkOrCreateThread = async (otherUserId: string) => {
    if (!user) return;
    
    try {
      // Check if a thread exists with these participants
      const { data: existingThreads, error: checkError } = await supabase
        .from('message_thread_participants')
        .select('thread_id')
        .in('user_id', [user.id, otherUserId])
        .order('thread_id', { ascending: true });
        
      if (checkError) throw checkError;
      
      // Group by thread_id and find threads with both participants
      const threadCounts: Record<string, number> = {};
      existingThreads?.forEach(p => {
        threadCounts[p.thread_id] = (threadCounts[p.thread_id] || 0) + 1;
      });
      
      const sharedThreadIds = Object.entries(threadCounts)
        .filter(([_, count]) => count >= 2)
        .map(([threadId]) => threadId);
      
      if (sharedThreadIds.length > 0) {
        // Thread exists, fetch it
        const { data: threadData, error: threadError } = await supabase
          .from('message_threads')
          .select('*')
          .eq('id', sharedThreadIds[0])
          .single();
          
        if (threadError) throw threadError;
        
        if (threadData) {
          await fetchUserInfo([user.id, otherUserId]);
          setActiveThread(threadData);
          return;
        }
      }
      
      // Create new thread
      const { data: newThread, error: createError } = await supabase
        .from('message_threads')
        .insert({
          participant_ids: [user.id, otherUserId],
        })
        .select()
        .single();
        
      if (createError) throw createError;
      
      if (newThread) {
        await fetchUserInfo([user.id, otherUserId]);
        setActiveThread(newThread);
        await fetchThreads();
      }
    } catch (error) {
      console.error('Error checking/creating thread:', error);
      toast({
        title: 'Error',
        description: 'Failed to open conversation',
        variant: 'destructive',
      });
    }
  };

  const fetchThreads = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Get thread IDs where the user is a participant
      const { data: participations, error: partError } = await supabase
        .from('message_thread_participants')
        .select('thread_id')
        .eq('user_id', user.id);
        
      if (partError) throw partError;
      
      if (!participations || participations.length === 0) {
        setLoading(false);
        return;
      }
      
      const threadIds = participations.map(p => p.thread_id);
      
      // Fetch the actual threads
      const { data: threadData, error: threadError } = await supabase
        .from('message_threads')
        .select('*')
        .in('id', threadIds)
        .order('updated_at', { ascending: false });
        
      if (threadError) throw threadError;
      
      if (threadData) {
        // Collect all user IDs from threads
        const userIds = new Set<string>();
        threadData.forEach(thread => {
          thread.participant_ids.forEach((id: string) => userIds.add(id));
        });
        
        // Fetch user info for all participants
        await fetchUserInfo(Array.from(userIds));
        
        // Enhance threads with participant info
        const enhancedThreads = threadData.map(thread => ({
          ...thread,
          participants: thread.participant_ids
            .filter((id: string) => id !== user.id)
            .map((id: string) => userInfo[id])
        }));
        
        setThreads(enhancedThreads);
        
        // If we have an active thread ID from URL params, set it as active
        const queryParams = new URLSearchParams(location.search);
        const tenantId = queryParams.get('tenant');
        
        if (!activeThread && tenantId) {
          const relevantThread = enhancedThreads.find(t => 
            t.participant_ids.includes(tenantId)
          );
          if (relevantThread) {
            setActiveThread(relevantThread);
          }
        } else if (!activeThread && enhancedThreads.length > 0) {
          // Select the first thread if none is active
          setActiveThread(enhancedThreads[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (userIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, email')
        .in('id', userIds);
        
      if (error) throw error;
      
      if (data) {
        const userMap: Record<string, UserInfo> = {};
        data.forEach(user => {
          userMap[user.id] = user;
        });
        setUserInfo(prev => ({ ...prev, ...userMap }));
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
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
      
      if (data) {
        setMessages(data);
        
        // Mark received messages as read
        const unreadMessages = data.filter(
          msg => msg.recipient_id === user?.id && !msg.read_at
        );
        
        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map(msg => msg.id);
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadIds);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!user || !activeThread || !newMessage.trim()) return;
    
    setSending(true);
    try {
      // Find the other participant
      const recipientId = activeThread.participant_ids.find(id => id !== user.id);
      
      if (!recipientId) {
        throw new Error('No recipient found');
      }
      
      // Send the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: activeThread.id,
          sender_id: user.id,
          recipient_id: recipientId,
          content: newMessage.trim(),
          message_type: 'text'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Add to messages array
        setMessages(prev => [...prev, data]);
        setNewMessage('');
        
        // Update thread's last_message
        await supabase
          .from('message_threads')
          .update({
            last_message: {
              content: newMessage.trim(),
              sender_id: user.id,
              created_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', activeThread.id);
          
        // Refresh threads to update order
        fetchThreads();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getRecipientName = (thread: Thread) => {
    if (!thread || !thread.participant_ids) return 'Unknown';
    
    const otherParticipantId = thread.participant_ids.find(id => id !== user?.id);
    if (!otherParticipantId) return 'Unknown';
    
    const participant = userInfo[otherParticipantId];
    if (!participant) return 'Loading...';
    
    return `${participant.first_name || ''} ${participant.last_name || ''}`.trim() || participant.email;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversation List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <div className="mt-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {threads
                      .filter(thread => {
                        if (!searchTerm) return true;
                        const recipient = getRecipientName(thread);
                        return recipient.toLowerCase().includes(searchTerm.toLowerCase());
                      })
                      .map(thread => (
                        <div
                          key={thread.id}
                          className={`
                            flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors
                            ${activeThread?.id === thread.id ? 'bg-muted' : 'hover:bg-muted/50'}
                          `}
                          onClick={() => setActiveThread(thread)}
                        >
                          <Avatar className="h-10 w-10">
                            {thread.participants && thread.participants[0]?.avatar_url ? (
                              <AvatarImage src={thread.participants[0].avatar_url} />
                            ) : (
                              <AvatarFallback>
                                {getInitials(getRecipientName(thread))}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 truncate">
                            <p className="font-medium">{getRecipientName(thread)}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {thread.last_message?.content || 'No messages yet'}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(thread.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
          
          {/* Message Content */}
          <Card className="md:col-span-2">
            {activeThread ? (
              <>
                <CardHeader className="border-b flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {activeThread.participants && activeThread.participants[0]?.avatar_url ? (
                        <AvatarImage src={activeThread.participants[0].avatar_url} />
                      ) : (
                        <AvatarFallback>
                          {getInitials(getRecipientName(activeThread))}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle>{getRecipientName(activeThread)}</CardTitle>
                      <CardDescription>
                        {activeThread.participants?.[0]?.role || 'User'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[550px]">
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground mb-1">No messages yet</p>
                        <p className="text-xs text-muted-foreground">
                          Send a message to start the conversation
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isCurrentUser = message.sender_id === user?.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`
                                  max-w-[70%] px-4 py-2 rounded-lg 
                                  ${isCurrentUser 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                  }
                                `}
                              >
                                <p>{message.content}</p>
                                <p className={`
                                  text-xs mt-1 
                                  ${isCurrentUser 
                                    ? 'text-primary-foreground/70' 
                                    : 'text-muted-foreground'
                                  }
                                `}>
                                  {new Date(message.created_at).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <form 
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }}
                    >
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim() || sending}
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        <span className="sr-only">Send</span>
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="h-[550px] flex flex-col items-center justify-center text-center p-8">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                <p className="text-muted-foreground">
                  Select a conversation from the list or start a new one
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
