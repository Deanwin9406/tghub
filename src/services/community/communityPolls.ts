
import { supabase } from "@/integrations/supabase/client";
import { CommunityPoll } from "@/types/community";

// Get community polls
export const getCommunityPolls = async (communityId: string): Promise<CommunityPoll[]> => {
  try {
    const { data: polls, error } = await supabase
      .from("community_polls")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get poll options and votes
    const pollsWithOptions = await Promise.all(
      polls.map(async (poll) => {
        // Get poll options
        const { data: options, error: optionsError } = await supabase
          .from("poll_options")
          .select("*")
          .eq("poll_id", poll.id);

        if (optionsError) throw optionsError;

        // Get total votes count
        const { count: totalVotes } = await supabase
          .from("poll_votes")
          .select("*", { count: 'exact', head: true })
          .eq("poll_id", poll.id);

        // Get votes for each option
        const optionsWithVotes = await Promise.all(
          options.map(async (option) => {
            const { count } = await supabase
              .from("poll_votes")
              .select("*", { count: 'exact', head: true })
              .eq("option_id", option.id);

            return {
              ...option,
              votes_count: count || 0
            };
          })
        );

        return {
          ...poll,
          options: optionsWithVotes,
          votes_count: totalVotes || 0
        } as CommunityPoll;
      })
    );

    return pollsWithOptions;
  } catch (error) {
    console.error("Error fetching community polls:", error);
    throw error;
  }
};

// Create a community poll
export const createCommunityPoll = async (
  pollData: {
    community_id: string;
    created_by: string;
    question: string;
    description?: string;
    end_date?: string;
    is_multiple_choice?: boolean;
  },
  options: string[]
): Promise<string> => {
  try {
    // Insert poll
    const { data: poll, error } = await supabase
      .from("community_polls")
      .insert(pollData)
      .select()
      .single();

    if (error) throw error;

    // Insert options
    const optionsData = options.map(option_text => ({
      poll_id: poll.id,
      option_text
    }));

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(optionsData);

    if (optionsError) throw optionsError;

    return poll.id;
  } catch (error) {
    console.error("Error creating community poll:", error);
    throw error;
  }
};

// Vote in a poll
export const votePoll = async (pollId: string, optionId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("poll_votes")
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId
      });

    if (error) throw error;
  } catch (error) {
    console.error("Error voting in poll:", error);
    throw error;
  }
};
