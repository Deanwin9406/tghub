
import { supabase } from "@/integrations/supabase/client";
import { Community, CommunityMember, CommunityEvent, CommunityPoll, MarketplaceItem, CommunityPost } from "@/types/community";

export async function fetchCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      community_members:community_members(count),
      properties:properties(count)
    `);
  
  if (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
  
  return data.map(community => ({
    ...community,
    member_count: community.community_members[0]?.count || 0,
    property_count: community.properties[0]?.count || 0
  }));
}

export async function fetchCommunityDetails(id: string): Promise<Community> {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      community_members:community_members(count),
      properties:properties(count)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
  
  return {
    ...data,
    member_count: data.community_members[0]?.count || 0,
    property_count: data.properties[0]?.count || 0
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
  const { data, error } = await supabase
    .from('communities')
    .insert({
      ...communityData,
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
  const { data, error } = await supabase
    .from('community_events')
    .select(`
      *,
      attendees:event_attendees(count)
    `)
    .eq('community_id', communityId)
    .order('start_time', { ascending: true });
  
  if (error) {
    console.error("Error fetching community events:", error);
    throw error;
  }
  
  return data.map(event => ({
    ...event,
    attendees_count: event.attendees[0]?.count || 0
  }));
}

export async function fetchCommunityPolls(communityId: string): Promise<CommunityPoll[]> {
  const { data, error } = await supabase
    .from('community_polls')
    .select(`
      *,
      options:poll_options(*)
    `)
    .eq('community_id', communityId);
  
  if (error) {
    console.error("Error fetching community polls:", error);
    throw error;
  }
  
  return data;
}

export async function fetchMarketplaceItems(communityId: string): Promise<MarketplaceItem[]> {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select('*')
    .eq('community_id', communityId)
    .eq('status', 'available');
  
  if (error) {
    console.error("Error fetching marketplace items:", error);
    throw error;
  }
  
  return data;
}

export async function fetchCommunityPosts(communityId: string): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      profiles:profiles(first_name, last_name, avatar_url),
      comments:community_comments(count),
      reactions:post_reactions(count)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching community posts:", error);
    throw error;
  }
  
  return data.map(post => ({
    ...post,
    author: post.profiles,
    comments_count: post.comments[0]?.count || 0,
    reactions_count: post.reactions[0]?.count || 0
  }));
}

export async function createCommunityPost(postData: Partial<CommunityPost>): Promise<string> {
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
