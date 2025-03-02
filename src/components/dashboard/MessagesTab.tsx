
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
  };
}

interface MessagesTabProps {
  messages: Message[];
}

const MessagesTab = ({ messages }: MessagesTabProps) => {
  const navigate = useNavigate();
  
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
        {messages.length === 0 ? (
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
                <Button variant="ghost" size="icon">
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
