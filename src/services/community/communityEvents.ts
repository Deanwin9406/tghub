
import { supabase } from "@/integrations/supabase/client";
import { CommunityEvent } from "@/types/community";

// Get community events
export const getCommunityEvents = async (communityId: string): Promise<CommunityEvent[]> => {
  try {
    const { data, error } = await supabase
      .from("community_events")
      .select("*")
      .eq("community_id", communityId)
      .order("start_time", { ascending: true });

    if (error) throw error;

    // Get attendee counts
    const eventsWithCounts = await Promise.all(
      data.map(async (event) => {
        const { count } = await supabase
          .from("event_attendees")
          .select("*", { count: 'exact', head: true })
          .eq("event_id", event.id);

        return {
          ...event,
          attendees_count: count || 0
        } as CommunityEvent;
      })
    );

    return eventsWithCounts;
  } catch (error) {
    console.error("Error fetching community events:", error);
    throw error;
  }
};

// Create a community event
export const createCommunityEvent = async (eventData: {
  community_id: string;
  created_by: string;
  title: string;
  description: string;
  location?: string;
  start_time: string;
  end_time: string;
  image_url?: string;
}): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("community_events")
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating community event:", error);
    throw error;
  }
};

// RSVP to an event
export const rsvpToEvent = async (eventId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("event_attendees")
      .insert({
        event_id: eventId,
        user_id: userId
      });

    if (error) throw error;
  } catch (error) {
    console.error("Error RSVPing to event:", error);
    throw error;
  }
};
