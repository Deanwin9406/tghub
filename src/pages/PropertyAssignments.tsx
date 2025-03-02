import React, { useState, useEffect } from 'react';
import Layout from "@/components/Layout";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Check, 
  X, 
  Wrench, 
  MessageSquare, 
  Clock,
  Loader2 
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PropertyAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [maintenanceStatus, setMaintenanceStatus] = useState('in_progress');

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          property:properties(*),
          tenant:profiles!tenant_id(*),
          comments:maintenance_comments(*)
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load your assignments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateMaintenanceStatus = async (id, status) => {
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      setAssignments(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status } : item
        )
      );
      
      if (selectedAssignment && selectedAssignment.id === id) {
        setSelectedAssignment(prev => ({ ...prev, status }));
      }
      
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim() || !selectedAssignment) return;
    
    try {
      setSubmitting(true);
      
      const newComment = {
        request_id: selectedAssignment.id,
        user_id: user.id,
        content: comment.trim(),
      };
      
      const { data, error } = await supabase
        .from('maintenance_comments')
        .insert(newComment)
        .select();
      
      if (error) throw error;
      
      setAssignments(prev => 
        prev.map(item => 
          item.id === selectedAssignment.id 
            ? { 
                ...item, 
                comments: [...(item.comments || []), data[0]] 
              } 
            : item
        )
      );
      
      if (selectedAssignment) {
        setSelectedAssignment(prev => ({
          ...prev,
          comments: [...(prev.comments || []), data[0]]
        }));
      }
      
      setComment('');
      
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = selectedStatus === 'all' 
    ? assignments 
    : assignments.filter(a => a.status === selectedStatus);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">{status}</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">{status}</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Maintenance Assignments</h1>
        
        <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Assignments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedStatus}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-lg text-muted-foreground">{error}</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/30">
                <p className="text-lg text-muted-foreground">No maintenance assignments found.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => (
                  <Card key={assignment.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{assignment.title}</CardTitle>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <CardDescription>
                        {assignment.property?.address}, {assignment.property?.city}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <p className="text-sm mb-4 line-clamp-3">{assignment.description}</p>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span>Priority: <span className="font-medium">{assignment.priority || 'Normal'}</span></span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-0">
                      <div className="flex space-x-2">
                        {assignment.status !== 'completed' && assignment.status !== 'cancelled' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600"
                            onClick={() => updateMaintenanceStatus(assignment.id, 'completed')}
                            disabled={submitting}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        
                        {assignment.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600"
                            onClick={() => updateMaintenanceStatus(assignment.id, 'cancelled')}
                            disabled={submitting}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Wrench className="h-4 w-4 mr-1" />
                            Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Maintenance Status</DialogTitle>
                            <DialogDescription>
                              Change the status of this maintenance request.
                            </DialogDescription>
                          </DialogHeader>
                          <Select value={maintenanceStatus} onValueChange={setMaintenanceStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => updateMaintenanceStatus(assignment.id, maintenanceStatus)}>Save</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Comment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Comment to Maintenance Request</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Add a comment to provide updates or request more information.
                            </p>
                            <Textarea 
                              placeholder="Type your comment here..." 
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                addComment();
                              }}
                              disabled={!comment.trim() || submitting}
                            >
                              {submitting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <MessageSquare className="h-4 w-4 mr-2" />
                              )}
                              Add Comment
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                    
                    {assignment.comments && assignment.comments.length > 0 && (
                      <div className="px-6 pb-4">
                        <div className="text-sm font-medium mb-2">Recent Comments</div>
                        <div className="space-y-2">
                          {assignment.comments.slice(0, 2).map((comment) => (
                            <div key={comment.id} className="bg-muted p-2 rounded-md text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">
                                  {comment.user_id === user.id ? 'You' : 'Property Manager'}
                                </span>
                                <Check className="h-3 w-3 text-green-500" />
                              </div>
                              <p>{comment.content}</p>
                            </div>
                          ))}
                          {assignment.comments.length > 2 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" size="sm" className="p-0 h-auto">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  View all {assignment.comments.length} comments
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>All Comments</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                  {assignment.comments.map((comment) => (
                                    <div key={comment.id} className="bg-muted p-3 rounded-md">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">
                                          {comment.user_id === user.id ? 'You' : 'Property Manager'}
                                        </span>
                                        <Textarea 
                                          placeholder="Type your comment here..." 
                                          value={comment}
                                          onChange={(e) => setComment(e.target.value)}
                                          rows={4}
                                        />
                                      </div>
                                      <DialogFooter>
                                        <Button 
                                          onClick={() => {
                                            setSelectedAssignment(assignment);
                                            addComment();
                                          }}
                                          disabled={!comment.trim() || submitting}
                                        >
                                          {submitting ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          ) : (
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                          )}
                                          Add Comment
                                        </Button>
                                      </DialogFooter>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="px-6 pb-4 text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        Created: {new Date(assignment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PropertyAssignments;
