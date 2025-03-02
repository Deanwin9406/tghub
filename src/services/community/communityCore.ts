
import { supabase } from "@/integrations/supabase/client";
import { Community } from "@/types/community";

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
