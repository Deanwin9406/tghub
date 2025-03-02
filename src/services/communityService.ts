import { supabase } from "@/integrations/supabase/client";
import { Community, CommunityPost, CommunityEvent, CommunityPoll, MarketplaceItem } from "@/types/community";

// Get all communities with member counts
export const getCommunities = async (): Promise<Community[]> => {
  try {
    const { data: communities, error } = await supabase
      .from("communities")
      .select(`
        *
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
          member_count: count || 0,
          location: community.location || 'Unknown Location',
          tags: community.tags || []
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
    // First, get the community details
    const { data, error } = await supabase
      .from("communities")
      .select(`*`)
      .eq("id", communityId)
      .single();

    if (error) throw error;

    // Get the creator profile
    const { data: creatorProfile, error: creatorError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.created_by)
      .single();

    // Get member count
    const { count } = await supabase
      .from("community_members")
      .select("*", { count: 'exact', head: true })
      .eq("community_id", communityId);

    return {
      ...data,
      member_count: count || 0,
      location: data.location || 'Unknown Location',
      tags: data.tags || [],
      created_by_profile: creatorError ? null : {
        id: creatorProfile?.id || '',
        first_name: creatorProfile?.first_name || '',
        last_name: creatorProfile?.last_name || '',
        avatar_url: creatorProfile?.avatar_url || null
      }
    };
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
};

// Get community posts with author info
export const getCommunityPosts = async (communityId: string): Promise<CommunityPost[]> => {
  try {
    // Get all posts for the community
    const { data, error } = await supabase
      .from("community_posts")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get comments and reactions counts, and author info for each post
    const postsWithCounts = await Promise.all(
      data.map(async (post) => {
        // Get author info
        const { data: authorData, error: authorError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", post.user_id)
          .single();

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
        const author = authorError ? {
          first_name: "Unknown",
          last_name: "User",
          avatar_url: null
        } : {
          first_name: authorData.first_name || "Unknown",
          last_name: authorData.last_name || "User",
          avatar_url: authorData.avatar_url
        };

        return {
          ...post,
          author,
          comments_count: commentsCount || 0,
          reactions_count: reactionsCount || 0
        } as CommunityPost;
      })
    );

    return postsWithCounts;
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
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format the items with seller info
    const formattedItems = await Promise.all(data.map(async (item) => {
      // Get seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", item.seller_id)
        .single();

      const sellerInfo = sellerError ? null : {
        first_name: sellerData?.first_name || "",
        last_name: sellerData?.last_name || "",
        avatar_url: sellerData?.avatar_url || null
      };

      return {
        ...item,
        seller: sellerInfo
      } as MarketplaceItem;
    }));

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
  tags?: string[];
}): Promise<string> => {
  try {
    const { data: community, error } = await supabase
      .from("communities")
      .insert({
        name: data.name,
        description: data.description,
        location: data.location,
        image_url: data.image_url,
        created_by: data.created_by,
        tags: data.tags || []
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

// Join a community
export const joinCommunity = async (communityId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("community_members")
      .insert({
        community_id: communityId,
        user_id: userId,
        role: "member"
      });

    if (error) {
      // If the error is due to unique constraint, the user is already a member
      if (error.code === '23505') {
        console.log("User is already a member of this community");
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error("Error joining community:", error);
    throw error;
  }
};

// Check if a user is a member of a community
export const isUserCommunityMember = async (communityId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("community_members")
      .select("*")
      .eq("community_id", communityId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking community membership:", error);
    return false;
  }
};
