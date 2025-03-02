
import { supabase } from "@/integrations/supabase/client";

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
