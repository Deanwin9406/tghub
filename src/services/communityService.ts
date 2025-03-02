
import { supabase } from "@/integrations/supabase/client";
import { Community, CommunityMember, CommunityEvent, CommunityPoll, MarketplaceItem, CommunityPost } from "@/types/community";

export async function fetchCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      community_members(count),
      properties(count)
    `);
  
  if (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
  
  return data.map(community => ({
    ...community,
    member_count: community.community_members?.[0]?.count ?? 0,
    property_count: community.properties?.[0]?.count ?? 0
  }));
}

export async function fetchCommunityDetails(id: string): Promise<Community> {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      community_members(count),
      properties(count)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
  
  return {
    ...data,
    member_count: data.community_members?.[0]?.count ?? 0,
    property_count: data.properties?.[0]?.count ?? 0
  };
}

export async function joinCommunity(communityId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('community_members')
    .insert({
      community_id: communityId,
      user_id: userId,
      role: 'member'
    });
  
  if (error) {
    console.error("Error joining community:", error);
    throw error;
  }
}

export async function leaveCommunity(communityId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error leaving community:", error);
    throw error;
  }
}

export async function createCommunity(communityData: Partial<Community>, userId: string): Promise<string> {
  // Make sure the name property is required
  if (!communityData.name) {
    throw new Error("Community name is required");
  }
  
  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: communityData.name,
      description: communityData.description,
      image_url: communityData.image_url,
      is_private: communityData.is_private,
      created_by: userId
    })
    .select();
  
  if (error) {
    console.error("Error creating community:", error);
    throw error;
  }
  
  // Automatically add creator as admin
  await supabase
    .from('community_members')
    .insert({
      community_id: data[0].id,
      user_id: userId,
      role: 'admin'
    });
  
  return data[0].id;
}

export async function fetchCommunityEvents(communityId: string): Promise<CommunityEvent[]> {
  // Now using the proper community_events table
  const { data, error } = await supabase
    .from('community_events')
    .select(`
      *,
      event_attendees:event_attendees(count)
    `)
    .eq('community_id', communityId)
    .order('start_time', { ascending: true });
  
  if (error) {
    console.error("Error fetching community events:", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    // Return empty array if no events
    return [];
  }
  
  return data.map(event => ({
    ...event,
    attendees_count: event.event_attendees?.[0]?.count ?? 0
  })) as CommunityEvent[];
}

export async function fetchCommunityPolls(communityId: string): Promise<CommunityPoll[]> {
  // Now using the proper community_polls table
  const { data: pollsData, error: pollsError } = await supabase
    .from('community_polls')
    .select(`
      *,
      poll_votes:poll_votes(count)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });
  
  if (pollsError) {
    console.error("Error fetching community polls:", pollsError);
    throw pollsError;
  }
  
  if (!pollsData || pollsData.length === 0) {
    // Return empty array if no polls
    return [];
  }
  
  const polls = await Promise.all(pollsData.map(async (poll) => {
    // Fetch options for each poll
    const { data: optionsData, error: optionsError } = await supabase
      .from('poll_options')
      .select(`
        *,
        poll_votes:poll_votes(count)
      `)
      .eq('poll_id', poll.id);
    
    if (optionsError) {
      console.error("Error fetching poll options:", optionsError);
      throw optionsError;
    }
    
    const options = optionsData.map(option => ({
      id: option.id,
      poll_id: option.poll_id,
      option_text: option.option_text,
      votes_count: option.poll_votes?.[0]?.count ?? 0
    }));
    
    return {
      ...poll,
      options,
      votes_count: poll.poll_votes?.[0]?.count ?? 0
    };
  }));
  
  return polls as CommunityPoll[];
}

export async function fetchMarketplaceItems(communityId: string): Promise<MarketplaceItem[]> {
  // Now using the proper marketplace_items table
  const { data, error } = await supabase
    .from('marketplace_items')
    .select(`
      *,
      profiles:seller_id(first_name, last_name, avatar_url)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching marketplace items:", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    // Return empty array if no items
    return [];
  }
  
  return data.map(item => ({
    ...item,
    seller: item.profiles
  })) as MarketplaceItem[];
}

export async function fetchCommunityPosts(communityId: string): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      user:user_id(first_name, last_name, avatar_url),
      community_comments(count),
      post_reactions(count)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching community posts:", error);
    throw error;
  }
  
  if (!data) return [];
  
  return data.map(post => ({
    ...post,
    author: post.user,
    comments_count: post.community_comments?.[0]?.count ?? 0,
    reactions_count: post.post_reactions?.[0]?.count ?? 0
  })) as CommunityPost[];
}

export async function createCommunityPost(postData: { community_id: string; user_id: string; content: string; image_url?: string | null }): Promise<string> {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(postData)
    .select();
  
  if (error) {
    console.error("Error creating post:", error);
    throw error;
  }
  
  return data[0].id;
}

export async function createCommunityEvent(eventData: { 
  community_id: string; 
  created_by: string; 
  title: string; 
  description: string; 
  location?: string | null; 
  start_time: string; 
  end_time: string; 
  image_url?: string | null 
}): Promise<string> {
  const { data, error } = await supabase
    .from('community_events')
    .insert(eventData)
    .select();
  
  if (error) {
    console.error("Error creating event:", error);
    throw error;
  }
  
  return data[0].id;
}

export async function attendEvent(eventId: string, userId: string, status: 'going' | 'maybe' | 'not_going' = 'going'): Promise<void> {
  const { error } = await supabase
    .from('event_attendees')
    .upsert({
      event_id: eventId,
      user_id: userId,
      status
    }, {
      onConflict: 'event_id,user_id'
    });
  
  if (error) {
    console.error("Error attending event:", error);
    throw error;
  }
}

export async function createCommunityPoll(pollData: { 
  community_id: string; 
  created_by: string; 
  question: string; 
  description?: string | null; 
  end_date?: string | null; 
  is_multiple_choice: boolean;
  options: string[] 
}): Promise<string> {
  // First create the poll
  const { data: pollResult, error: pollError } = await supabase
    .from('community_polls')
    .insert({
      community_id: pollData.community_id,
      created_by: pollData.created_by,
      question: pollData.question,
      description: pollData.description,
      end_date: pollData.end_date,
      is_multiple_choice: pollData.is_multiple_choice
    })
    .select();
  
  if (pollError) {
    console.error("Error creating poll:", pollError);
    throw pollError;
  }
  
  const pollId = pollResult[0].id;
  
  // Then create the options
  const optionsToInsert = pollData.options.map(optionText => ({
    poll_id: pollId,
    option_text: optionText
  }));
  
  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(optionsToInsert);
  
  if (optionsError) {
    console.error("Error creating poll options:", optionsError);
    throw optionsError;
  }
  
  return pollId;
}

export async function voteOnPoll(pollId: string, optionId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('poll_votes')
    .insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId
    });
  
  if (error) {
    console.error("Error voting on poll:", error);
    throw error;
  }
}

export async function createMarketplaceItem(itemData: { 
  community_id: string; 
  seller_id: string; 
  title: string; 
  description: string; 
  price?: number | null; 
  image_url?: string | null;
  category?: string | null 
}): Promise<string> {
  const { data, error } = await supabase
    .from('marketplace_items')
    .insert(itemData)
    .select();
  
  if (error) {
    console.error("Error creating marketplace item:", error);
    throw error;
  }
  
  return data[0].id;
}

export async function reactToPost(postId: string, userId: string, reactionType: 'like' | 'love' | 'laugh' | 'sad' | 'angry' = 'like'): Promise<void> {
  const { error } = await supabase
    .from('post_reactions')
    .upsert({
      post_id: postId,
      user_id: userId,
      reaction_type: reactionType
    }, {
      onConflict: 'post_id,user_id'
    });
  
  if (error) {
    console.error("Error reacting to post:", error);
    throw error;
  }
}
