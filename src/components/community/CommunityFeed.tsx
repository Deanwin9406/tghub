
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCommunityPosts, createCommunityPost } from '@/services/community';
import { CommunityPost } from '@/types/community';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Heart, Share, Image, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityFeedProps {
  communityId: string;
  isMember?: boolean;
}

const CommunityFeed = ({ communityId, isMember = false }: CommunityFeedProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const loadPosts = async () => {
    try {
      const data = await getCommunityPosts(communityId);
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

  useEffect(() => {
    loadPosts();
  }, [communityId, toast]);

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Post content required",
        description: "Please write something in your post.",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    try {
      await createCommunityPost(communityId, user!.id, postContent, selectedImage);
      
      // Clear form and reload posts
      setPostContent('');
      setSelectedImage('');
      setShowImageUpload(false);
      loadPosts();
      
      toast({
        title: "Post created",
        description: "Your post has been published.",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Failed to create post",
        description: "There was an error publishing your post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
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
      {user && isMember && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={user.user_metadata?.avatar_url || undefined} alt={user.user_metadata?.first_name || "User"} />
                <AvatarFallback>{getInitials(user.user_metadata?.first_name, user.user_metadata?.last_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share something with the community..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={3}
                  className="w-full mb-2"
                />
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" type="button">
                    <Image className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={isPosting || !postContent.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isPosting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isMember && user && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Join this community to share posts and interact with members
            </p>
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
          {user && isMember ? (
            <p className="text-sm text-muted-foreground">
              Share news, updates, or questions above.
            </p>
          ) : user ? (
            <p className="text-sm text-muted-foreground">
              Join this community to share posts.
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
