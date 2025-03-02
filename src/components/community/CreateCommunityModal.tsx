import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createCommunity } from '@/services/communityService';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCommunityModal = ({ open, onOpenChange }: CreateCommunityModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCommunity = async () => {
    if (!name || !description || !location) {
      toast({
        title: "All fields are required",
        description: "Please fill in all fields to create a community.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const communityId = await createCommunity({
        name,
        description,
        location,
        image_url: imageUrl,
        created_by: user!.id
      });
      toast({
        title: "Community created",
        description: "Your community has been created successfully.",
      });
      onOpenChange(false);
      navigate(`/communities/${communityId}`);
    } catch (error) {
      console.error("Error creating community:", error);
      toast({
        title: "Failed to create community",
        description: "There was an error creating your community. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header>
          <h2>Create Community</h2>
        </Modal.Header>
        <Modal.Body>
          <Input
            placeholder="Community Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4"
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4"
          />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mb-4"
          />
          <Input
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mb-4"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreateCommunity} isLoading={isLoading}>Create</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export default CreateCommunityModal;
