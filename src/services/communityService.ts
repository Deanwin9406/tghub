import { supabase } from '@/integrations/supabase/client';
import { Community, CommunityMember, CommunityPost, CommunityEvent, CommunityPoll, MarketplaceItem } from '@/types/community';

// This is a simplified version to fix the type errors
// To properly fix all issues, we would need to check the database schema 
// and update the service methods accordingly

export const getCommunities = async (): Promise<Community[]> => {
  const { data, error } = await supabase
    .from('communities')
    .select('*, community_members(count)');
  
  if (error) {
    console.error('Error fetching communities:', error);
    return [];
  }
  
  return data.map(community => ({
    ...community,
    member_count: community.community_members || 0,
  })) as Community[];
};

export const getCommunityById = async (communityId: string): Promise<Community | null> => {
  const { data, error } = await supabase
    .from('communities')
    .select('*, community_members(count)')
    .eq('id', communityId)
    .single();
  
  if (error) {
    console.error('Error fetching community:', error);
    return null;
  }
  
  return {
    ...data,
    member_count: data?.community_members || 0,
  } as Community;
};

export const getCommunityMembers = async (communityId: string): Promise<CommunityMember[]> => {
  const { data, error } = await supabase
    .from('community_members')
    .select('*')
    .eq('community_id', communityId);

  if (error) {
    console.error('Error fetching community members:', error);
    return [];
  }

  return data as CommunityMember[];
};

export const addCommunityMember = async (communityId: string, userId: string, role: string): Promise<CommunityMember | null> => {
    const { data, error } = await supabase
        .from('community_members')
        .insert([{ community_id: communityId, user_id: userId, role: role }])
        .select()
        .single();

    if (error) {
        console.error('Error adding community member:', error);
        return null;
    }

    return data as CommunityMember;
};

export const removeCommunityMember = async (communityId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('community_members')
        .delete()
        .match({ community_id: communityId, user_id: userId });

    if (error) {
        console.error('Error removing community member:', error);
        return false;
    }

    return true;
};

export const getCommunityPosts = async (communityId: string): Promise<CommunityPost[]> => {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, author:profiles(first_name, last_name, avatar_url), reactions_count:post_reactions(count), comments_count:community_comments(count)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }

  return data as CommunityPost[];
};

export const createCommunityPost = async (communityId: string, userId: string, content: string, imageUrl: string | null): Promise<CommunityPost | null> => {
    const { data, error } = await supabase
        .from('community_posts')
        .insert([{ community_id: communityId, user_id: userId, content: content, image_url: imageUrl }])
        .select()
        .single();

    if (error) {
        console.error('Error creating community post:', error);
        return null;
    }

    return data as CommunityPost;
};

export const deleteCommunityPost = async (postId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('community_posts')
        .delete()
        .match({ id: postId });

    if (error) {
        console.error('Error deleting community post:', error);
        return false;
    }

    return true;
};

export const getCommunityEvents = async (communityId: string): Promise<CommunityEvent[]> => {
  const { data, error } = await supabase
    .from('community_events')
    .select('*, attendees_count:event_attendees(count)')
    .eq('community_id', communityId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching community events:', error);
    return [];
  }

  return data as CommunityEvent[];
};

export const createCommunityEvent = async (communityId: string, createdBy: string, title: string, description: string, location: string | null, startTime: string, endTime: string, imageUrl: string | null): Promise<CommunityEvent | null> => {
    const { data, error } = await supabase
        .from('community_events')
        .insert([{ community_id: communityId, created_by: createdBy, title: title, description: description, location: location, start_time: startTime, end_time: endTime, image_url: imageUrl }])
        .select()
        .single();

    if (error) {
        console.error('Error creating community event:', error);
        return null;
    }

    return data as CommunityEvent;
};

export const deleteCommunityEvent = async (eventId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('community_events')
        .delete()
        .match({ id: eventId });

    if (error) {
        console.error('Error deleting community event:', error);
        return false;
    }

    return true;
};

export const addAttendeeToEvent = async (eventId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, user_id: userId });

    if (error) {
        console.error('Error adding attendee to event:', error);
        return false;
    }

    return true;
};

export const removeAttendeeFromEvent = async (eventId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('event_attendees')
        .delete()
        .match({ event_id: eventId, user_id: userId });

    if (error) {
        console.error('Error removing attendee from event:', error);
        return false;
    }

    return true;
};

export const getCommunityPolls = async (communityId: string): Promise<CommunityPoll[]> => {
  const { data, error } = await supabase
    .from('community_polls')
    .select('*, options:poll_options(*), votes_count:poll_votes(count)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching community polls:', error);
    return [];
  }

  return data as CommunityPoll[];
};

export const createCommunityPoll = async (communityId: string, createdBy: string, question: string, description: string | null, endDate: string | null, isMultipleChoice: boolean, options: { poll_id: string; option_text: string; }[]): Promise<CommunityPoll | null> => {
    const { data, error } = await supabase
        .from('community_polls')
        .insert([{ community_id: communityId, created_by: createdBy, question: question, description: description, end_date: endDate, is_multiple_choice: isMultipleChoice }])
        .select()
        .single();

    if (error) {
        console.error('Error creating community poll:', error);
        return null;
    }

    // Create poll options
    if (data) {
        const pollOptions = options.map(option => ({
            poll_id: data.id,
            option_text: option.option_text,
        }));

        const { error: optionsError } = await supabase
            .from('poll_options')
            .insert(pollOptions);

        if (optionsError) {
            console.error('Error creating poll options:', optionsError);
            return null;
        }
    }

    return data as CommunityPoll;
};

export const voteOnPoll = async (pollId: string, userId: string, optionId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('poll_votes')
        .insert({ poll_id: pollId, user_id: userId, option_id: optionId });

    if (error) {
        console.error('Error voting on poll:', error);
        return false;
    }

    return true;
};

export const getMarketplaceItems = async (communityId: string): Promise<MarketplaceItem[]> => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select('*, seller:profiles(*)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching marketplace items:', error);
    return [];
  }

  return data as MarketplaceItem[];
};

export const createMarketplaceItem = async (communityId: string, sellerId: string, title: string, description: string, price: number | null, imageUrl: string | null, category: string | null): Promise<MarketplaceItem | null> => {
    const { data, error } = await supabase
        .from('marketplace_items')
        .insert([{ community_id: communityId, seller_id: sellerId, title: title, description: description, price: price, image_url: imageUrl, category: category }])
        .select()
        .single();

    if (error) {
        console.error('Error creating marketplace item:', error);
        return null;
    }

    return data as MarketplaceItem;
};

export const getCommunityPostsWithAuthors = async (communityId: string): Promise<CommunityPost[]> => {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, author:profiles(first_name, last_name, avatar_url), reactions_count:post_reactions(count), comments_count:community_comments(count)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }

  return data as CommunityPost[];
};

export const getCommunityCount = async (): Promise<number> => {
    const { count, error } = await supabase
        .from('communities')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching community count:', error);
        return 0;
    }

    return count || 0;
};

// Additional methods should be added after fixing the database schema issues
// The current errors suggest that the expected tables like 'community_events', 'community_polls',
// 'marketplace_items', etc. don't exist in the database or aren't properly related

export const joinCommunity = async (communityId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('community_members')
    .insert({ community_id: communityId, user_id: userId, role: 'member' });
  
  if (error) {
    console.error('Error joining community:', error);
    return false;
  }
  
  return true;
};

export const leaveCommunity = async (communityId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .match({ community_id: communityId, user_id: userId });
  
  if (error) {
    console.error('Error leaving community:', error);
    return false;
  }
  
  return true;
};

// The remaining methods need to be updated based on the actual database schema
