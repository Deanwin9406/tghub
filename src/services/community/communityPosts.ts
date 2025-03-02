import { supabase } from "@/integrations/supabase/client";
import { CommunityPost } from "@/types/community";

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
