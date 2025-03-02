
import React, { useState, useEffect } from 'react';
import { getCommunityPolls } from '@/services/community';
import { CommunityPoll } from '@/types/community';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, VoteIcon, Plus, Clock } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface CommunityPollsProps {
  communityId: string;
}

const CommunityPolls = ({ communityId }: CommunityPollsProps) => {
  const { toast } = useToast();
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPolls = async () => {
      try {
        const data = await getCommunityPolls(communityId);
        setPolls(data);
      } catch (error) {
        console.error("Failed to load community polls:", error);
        toast({
          title: "Failed to load polls",
          description: "Could not load community polls. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPolls();
  }, [communityId, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse">Loading community polls...</div>
      </div>
    );
  }

  const activePolls = polls.filter(poll => !poll.end_date || !isPast(new Date(poll.end_date)));
  const closedPolls = polls.filter(poll => poll.end_date && isPast(new Date(poll.end_date)));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Community Polls</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12">
          <VoteIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Polls Available</h3>
          <p className="text-muted-foreground mb-4">
            There are no polls in this community yet.
          </p>
          <Button>Create First Poll</Button>
        </div>
      ) : (
        <>
          {activePolls.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-medium mb-4">Active Polls</h4>
              <div className="grid grid-cols-1 gap-6">
                {activePolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            </div>
          )}

          {closedPolls.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-4">Closed Polls</h4>
              <div className="grid grid-cols-1 gap-6">
                {closedPolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} isClosed />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface PollCardProps {
  poll: CommunityPoll;
  isClosed?: boolean;
}

const PollCard = ({ poll, isClosed }: PollCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = poll.options.reduce((sum, option) => sum + (option.votes_count || 0), 0);

  const handleVote = () => {
    if (!selectedOption) return;
    
    setHasVoted(true);
  };

  const getPercentage = (voteCount: number = 0) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{poll.question}</CardTitle>
          {poll.end_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {isClosed 
                ? "Closed " + formatDistanceToNow(new Date(poll.end_date), { addSuffix: true })
                : "Ends " + formatDistanceToNow(new Date(poll.end_date), { addSuffix: true })}
            </div>
          )}
        </div>
        {poll.description && (
          <p className="text-muted-foreground mt-1">{poll.description}</p>
        )}
      </CardHeader>
      <CardContent>
        {(hasVoted || isClosed) ? (
          <div className="space-y-4">
            {poll.options.map((option) => (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span>{option.option_text}</span>
                  <span>{getPercentage(option.votes_count)}% ({option.votes_count || 0})</span>
                </div>
                <Progress value={getPercentage(option.votes_count)} className="h-2" />
              </div>
            ))}
            <div className="text-sm text-muted-foreground text-center mt-4">
              Total votes: {totalVotes}
            </div>
          </div>
        ) : (
          <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption} className="space-y-3">
            {poll.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">{option.option_text}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isClosed && !hasVoted && (
          <Button 
            onClick={handleVote} 
            disabled={!selectedOption} 
            className="w-full"
          >
            <VoteIcon className="h-4 w-4 mr-2" />
            Vote
          </Button>
        )}
        {(isClosed || hasVoted) && (
          <Button variant="outline" className="w-full">
            <BarChart className="h-4 w-4 mr-2" />
            View Detailed Results
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CommunityPolls;
