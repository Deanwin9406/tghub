
import { supabase } from '@/integrations/supabase/client';
import { Community, CommunityMember, CommunityPost, CommunityEvent, CommunityPoll, PollOption, MarketplaceItem } from '@/types/community';

// Communities
export const getCommunities = async (): Promise<Community[]> => {
  const { data, error } = await supabase
    .from('communities')
    .select('*, community_members!community_id(count)');
  
  if (error) {
    console.error('Error fetching communities:', error);
    return [];
  }
  
  return data.map(community => ({
    ...community,
    member_count: community.community_members?.count || 0,
  })) as Community[];
};

export const getCommunityById = async (communityId: string): Promise<Community | null> => {
  const { data, error } = await supabase
    .from('communities')
    .select('*, community_members!community_id(count)')
    .eq('id', communityId)
    .single();
  
  if (error) {
    console.error('Error fetching community:', error);
    return null;
  }
  
  return {
    ...data,
    member_count: data?.community_members?.count || 0,
  } as Community;
};

// Community Members
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

// Community Posts
export const getCommunityPosts = async (communityId: string): Promise<CommunityPost[]> => {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      profiles:user_id(first_name, last_name, avatar_url),
      comments_count:community_comments!post_id(count),
      reactions_count:post_reactions!post_id(count)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }

  return data.map(post => ({
    ...post,
    author: post.profiles,
    comments_count: post.comments_count?.count || 0,
    reactions_count: post.reactions_count?.count || 0
  })) as CommunityPost[];
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

// Community Events
export const getCommunityEvents = async (communityId: string): Promise<CommunityEvent[]> => {
  const { data, error } = await supabase
    .from('community_events')
    .select(`
      *,
      attendees_count:event_attendees!event_id(count)
    `)
    .eq('community_id', communityId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching community events:', error);
    return [];
  }

  return data.map(event => ({
    ...event,
    attendees_count: event.attendees_count?.count || 0
  })) as CommunityEvent[];
};

export const createCommunityEvent = async (communityId: string, createdBy: string, title: string, description: string, location: string | null, startTime: string, endTime: string, imageUrl: string | null): Promise<CommunityEvent | null> => {
    const { data, error } = await supabase
        .from('community_events')
        .insert([{ 
          community_id: communityId, 
          created_by: createdBy, 
          title: title, 
          description: description, 
          location: location, 
          start_time: startTime, 
          end_time: endTime, 
          image_url: imageUrl 
        }])
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
        .insert([{ event_id: eventId, user_id: userId }]);

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

// Community Polls
export const getCommunityPolls = async (communityId: string): Promise<CommunityPoll[]> => {
  const { data: pollsData, error: pollsError } = await supabase
    .from('community_polls')
    .select(`
      *,
      votes_count:poll_votes!poll_id(count)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (pollsError) {
    console.error('Error fetching community polls:', pollsError);
    return [];
  }

  const polls = [...pollsData];
  
  for (let i = 0; i < polls.length; i++) {
    const { data: optionsData, error: optionsError } = await supabase
      .from('poll_options')
      .select(`
        *,
        votes_count:poll_votes!option_id(count)
      `)
      .eq('poll_id', polls[i].id);

    if (optionsError) {
      console.error('Error fetching poll options:', optionsError);
      continue;
    }

    polls[i].options = optionsData.map(option => ({
      ...option,
      votes_count: option.votes_count?.count || 0
    })) as PollOption[];
  }

  return polls.map(poll => ({
    ...poll,
    votes_count: poll.votes_count?.count || 0
  })) as CommunityPoll[];
};

export const createCommunityPoll = async (communityId: string, createdBy: string, question: string, description: string | null, endDate: string | null, isMultipleChoice: boolean, options: { option_text: string }[]): Promise<CommunityPoll | null> => {
    const { data, error } = await supabase
        .from('community_polls')
        .insert([{ 
          community_id: communityId, 
          created_by: createdBy, 
          question: question, 
          description: description, 
          end_date: endDate, 
          is_multiple_choice: isMultipleChoice 
        }])
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
        .insert([{ poll_id: pollId, user_id: userId, option_id: optionId }]);

    if (error) {
        console.error('Error voting on poll:', error);
        return false;
    }

    return true;
};

// Marketplace Items
export const getMarketplaceItems = async (communityId: string): Promise<MarketplaceItem[]> => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select(`
      *,
      profiles:seller_id(first_name, last_name, avatar_url)
    `)
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
        .insert([{ 
          community_id: communityId, 
          seller_id: sellerId, 
          title: title, 
          description: description, 
          price: price, 
          image_url: imageUrl, 
          category: category,
          status: 'available'
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating marketplace item:', error);
        return null;
    }

    return data as MarketplaceItem;
};

// Additional helper methods
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

export const getCommunityPostsWithAuthors = async (communityId: string): Promise<CommunityPost[]> => {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      profiles:user_id(first_name, last_name, avatar_url),
      comments_count:community_comments!post_id(count),
      reactions_count:post_reactions!post_id(count)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }

  return data.map(post => ({
    ...post,
    author: post.profiles,
    comments_count: post.comments_count?.count || 0,
    reactions_count: post.reactions_count?.count || 0
  })) as CommunityPost[];
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

// Adding a reaction to a post
export const addReactionToPost = async (postId: string, userId: string, reactionType: string): Promise<boolean> => {
    const { error } = await supabase
        .from('post_reactions')
        .insert([{ post_id: postId, user_id: userId, reaction_type: reactionType }]);

    if (error) {
        console.error('Error adding reaction to post:', error);
        return false;
    }

    return true;
};

// Removing a reaction from a post
export const removeReactionFromPost = async (postId: string, userId: string, reactionType: string): Promise<boolean> => {
    const { error } = await supabase
        .from('post_reactions')
        .delete()
        .match({ post_id: postId, user_id: userId, reaction_type: reactionType });

    if (error) {
        console.error('Error removing reaction from post:', error);
        return false;
    }

    return true;
};
