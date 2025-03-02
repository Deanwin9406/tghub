
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
    member_count: community.community_members?.[0]?.count || 0,
    property_count: community.properties?.[0]?.count || 0
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
    member_count: data.community_members?.[0]?.count || 0,
    property_count: data.properties?.[0]?.count || 0
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

// This function is a placeholder as community_events table doesn't exist yet
export async function fetchCommunityEvents(communityId: string): Promise<CommunityEvent[]> {
  // Mock response until the table is created
  return [
    {
      id: "mock-event-1",
      community_id: communityId,
      created_by: "user-id",
      title: "Community Meetup",
      description: "Let's meet and discuss community matters",
      location: "Community Center",
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attendees_count: 0
    }
  ];
}

// This function is a placeholder as community_polls table doesn't exist yet
export async function fetchCommunityPolls(communityId: string): Promise<CommunityPoll[]> {
  // Mock response until the table is created
  return [
    {
      id: "mock-poll-1",
      community_id: communityId,
      created_by: "user-id",
      question: "What should we discuss at our next meeting?",
      description: "Please vote on the topic for our upcoming community meeting",
      end_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      is_multiple_choice: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: [
        {
          id: "option-1",
          poll_id: "mock-poll-1",
          option_text: "Community safety",
          votes_count: 0
        },
        {
          id: "option-2",
          poll_id: "mock-poll-1",
          option_text: "Landscaping improvements",
          votes_count: 0
        }
      ],
      votes_count: 0
    }
  ];
}

// This function is a placeholder as marketplace_items table doesn't exist yet
export async function fetchMarketplaceItems(communityId: string): Promise<MarketplaceItem[]> {
  // Mock response until the table is created
  return [
    {
      id: "mock-item-1",
      community_id: communityId,
      seller_id: "user-id",
      title: "Used Furniture",
      description: "Gently used couch, good condition",
      price: 150,
      image_url: null,
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: "Furniture"
    }
  ];
}

export async function fetchCommunityPosts(communityId: string): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      profiles:user_id(first_name, last_name, avatar_url),
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
    comments_count: post.comments?.[0]?.count || 0,
    reactions_count: post.reactions?.[0]?.count || 0
  }));
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
