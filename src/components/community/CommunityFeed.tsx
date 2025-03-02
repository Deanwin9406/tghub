
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCommunityPosts, createCommunityPost } from '@/services/communityService';
import { CommunityPost } from '@/types/community';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Heart, Share, Image, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityFeedProps {
  communityId: string;
}

const CommunityFeed = ({ communityId }: CommunityFeedProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchCommunityPosts(communityId);
        setPosts(data);
      } catch (error) {
        console.error("Failed to load community posts:", error);
        toast({
          title: "Failed to load posts",
          description: "Could not load community posts. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [communityId, toast]);

  const handleSubmitPost = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to post in this community",
        variant: "destructive"
      });
      return;
    }

    if (!newPostContent.trim()) {
      toast({
        title: "Empty post",
        description: "Please enter some content for your post",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createCommunityPost({
        community_id: communityId,
        user_id: user.id,
        content: newPostContent
      });

      setNewPostContent('');
      toast({
        title: "Post created",
        description: "Your post has been shared with the community",
      });

      // Refresh posts
      const updatedPosts = await fetchCommunityPosts(communityId);
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({
        title: "Failed to create post",
        description: "An error occurred while creating your post.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse">Loading community posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {user && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={user.avatar_url || undefined} alt={user.first_name || "User"} />
                <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share something with the community..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={3}
                  className="w-full mb-2"
                />
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" type="button">
                    <Image className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <Button 
                    onClick={handleSubmitPost}
                    disabled={isSubmitting || !newPostContent.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to start a conversation in this community!
          </p>
          {user ? (
            <p className="text-sm text-muted-foreground">
              Share news, updates, or questions above.
            </p>
          ) : (
            <Button variant="outline">Sign In to Post</Button>
          )}
        </div>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={post.author?.avatar_url || undefined} alt={post.author?.first_name || "User"} />
                  <AvatarFallback>
                    {getInitials(post.author?.first_name, post.author?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {post.author?.first_name} {post.author?.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{post.content}</p>
              {post.image_url && (
                <div className="mt-3">
                  <img 
                    src={post.image_url} 
                    alt="Post attachment"
                    className="rounded-md w-full max-h-96 object-cover"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t py-3 flex justify-between">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-1" />
                {post.reactions_count || 0}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.comments_count || 0}
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default CommunityFeed;
