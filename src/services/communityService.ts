import { supabase } from "@/integrations/supabase/client";
import { Community, CommunityPost, CommunityEvent, CommunityPoll, MarketplaceItem } from "@/types/community";

// Get all communities with member counts
export const getCommunities = async (): Promise<Community[]> => {
  try {
    const { data: communities, error } = await supabase
      .from("communities")
      .select(`
        *,
        community_members!inner (
          id
        )
      `);

    if (error) throw error;

    // Count members and get the most recent communities
    const communitiesWithCounts = await Promise.all(
      communities.map(async (community) => {
        const { count } = await supabase
          .from("community_members")
          .select("*", { count: 'exact', head: true })
          .eq("community_id", community.id);

        return {
          ...community,
          member_count: count || 0
        };
      })
    );

    return communitiesWithCounts;
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
};

// Get community details
export const getCommunityDetails = async (communityId: string): Promise<Community> => {
  try {
    const { data, error } = await supabase
      .from("communities")
      .select(`
        *,
        created_by_profile:profiles(*)
      `)
      .eq("id", communityId)
      .single();

    if (error) throw error;

    // Get member count
    const { count } = await supabase
      .from("community_members")
      .select("*", { count: 'exact', head: true })
      .eq("community_id", communityId);

    return {
      ...data,
      member_count: count || 0
    };
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
};

// Get community posts with author info
export const getCommunityPosts = async (communityId: string): Promise<CommunityPost[]> => {
  try {
    const { data, error } = await supabase
      .from("community_posts")
      .select(`
        *,
        profiles(*)
      `)
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get comments and reactions counts
    const postsWithCounts = await Promise.all(
      data.map(async (post) => {
        // Get comments count
        const { count: commentsCount } = await supabase
          .from("community_comments")
          .select("*", { count: 'exact', head: true })
          .eq("post_id", post.id);

        // Get reactions count
        const { count: reactionsCount } = await supabase
          .from("post_reactions")
          .select("*", { count: 'exact', head: true })
          .eq("post_id", post.id);

        // Format author info
        const author = post.profiles ? {
          first_name: post.profiles.first_name || "",
          last_name: post.profiles.last_name || "",
          avatar_url: post.profiles.avatar_url || ""
        } : {
          first_name: "Unknown",
          last_name: "User",
          avatar_url: ""
        };

        return {
          ...post,
          author,
          comments_count: commentsCount || 0,
          reactions_count: reactionsCount || 0
        } as CommunityPost;
      })
    );

    return postsWithCounts as CommunityPost[];
  } catch (error) {
    console.error("Error fetching community posts:", error);
    throw error;
  }
};

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

// Get marketplace items
export const getMarketplaceItems = async (communityId: string): Promise<MarketplaceItem[]> => {
  try {
    const { data, error } = await supabase
      .from("marketplace_items")
      .select(`
        *,
        profiles(*)
      `)
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format the items with seller info
    const formattedItems = data.map(item => {
      const sellerInfo = item.profiles ? {
        first_name: item.profiles.first_name || "",
        last_name: item.profiles.last_name || "",
        avatar_url: item.profiles.avatar_url || ""
      } : null;

      return {
        ...item,
        seller: sellerInfo
      } as MarketplaceItem;
    });

    return formattedItems;
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    throw error;
  }
};

// Create a community post
export const createCommunityPost = async (communityId: string, userId: string, content: string, imageUrl?: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("community_posts")
      .insert({
        community_id: communityId,
        user_id: userId,
        content,
        image_url: imageUrl
      });

    if (error) throw error;
  } catch (error) {
    console.error("Error creating community post:", error);
    throw error;
  }
};

// Create a new community
export const createCommunity = async (data: {
  name: string;
  description: string;
  location: string;
  image_url?: string;
  created_by: string;
}): Promise<string> => {
  try {
    const { data: community, error } = await supabase
      .from("communities")
      .insert({
        name: data.name,
        description: data.description,
        location: data.location,
        image_url: data.image_url,
        created_by: data.created_by
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as a member
    const { error: memberError } = await supabase
      .from("community_members")
      .insert({
        community_id: community.id,
        user_id: data.created_by,
        role: "admin"
      });

    if (memberError) throw memberError;

    return community.id;
  } catch (error) {
    console.error("Error creating community:", error);
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

// Create a marketplace item
export const createMarketplaceItem = async (itemData: {
  community_id: string;
  seller_id: string;
  title: string;
  description: string;
  price?: number;
  image_url?: string;
  category?: string;
}): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("marketplace_items")
      .insert(itemData)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating marketplace item:", error);
    throw error;
  }
};

// React to a post
export const reactToPost = async (postId: string, userId: string, reactionType: string): Promise<void> => {
  try {
    // Check if reaction already exists
    const { data: existingReaction, error: checkError } = await supabase
      .from("post_reactions")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .eq("reaction_type", reactionType)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    // If reaction exists, delete it (toggle off)
    if (existingReaction) {
      const { error: deleteError } = await supabase
        .from("post_reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (deleteError) throw deleteError;
      return;
    }

    // Otherwise add new reaction
    const { error } = await supabase
      .from("post_reactions")
      .insert({
        post_id: postId,
        user_id: userId,
        reaction_type: reactionType
      });

    if (error) throw error;
  } catch (error) {
    console.error("Error reacting to post:", error);
    throw error;
  }
};
