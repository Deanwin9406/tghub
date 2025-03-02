
import React, { useState, useEffect } from 'react';
import { fetchCommunityEvents } from '@/services/communityService';
import { CommunityEvent } from '@/types/community';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';
import { format, isPast } from 'date-fns';

interface CommunityEventsProps {
  communityId: string;
}

const CommunityEvents = ({ communityId }: CommunityEventsProps) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchCommunityEvents(communityId);
        setEvents(data);
      } catch (error) {
        console.error("Failed to load community events:", error);
        toast({
          title: "Failed to load events",
          description: "Could not load community events. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [communityId, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse">Loading community events...</div>
      </div>
    );
  }

  const upcomingEvents = events.filter(event => !isPast(new Date(event.end_time)));
  const pastEvents = events.filter(event => isPast(new Date(event.end_time)));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Community Events</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Events Scheduled</h3>
          <p className="text-muted-foreground mb-4">
            There are no upcoming events in this community.
          </p>
          <Button>Create First Event</Button>
        </div>
      ) : (
        <>
          {upcomingEvents.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-medium mb-4">Upcoming Events</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-4">Past Events</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastEvents.slice(0, 4).map((event) => (
                  <EventCard key={event.id} event={event} isPast />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface EventCardProps {
  event: CommunityEvent;
  isPast?: boolean;
}

const EventCard = ({ event, isPast }: EventCardProps) => {
  return (
    <Card className={isPast ? "opacity-70" : ""}>
      {event.image_url && (
        <div className="h-40 overflow-hidden">
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event.attendees_count || 0} attendees</span>
          </div>
        </div>
        {event.description && (
          <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}
      </CardContent>
      <CardFooter>
        {isPast ? (
          <Button variant="outline" className="w-full">View Photos</Button>
        ) : (
          <Button className="w-full">RSVP</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CommunityEvents;
