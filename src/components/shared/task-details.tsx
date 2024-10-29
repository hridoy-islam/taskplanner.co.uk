import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import moment from 'moment';
import axiosInstance from '../../lib/axios';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

interface TaskDetailsProps {
  task: {
    _id: string;
    taskName: string;
    dueDate;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetails({
  task,
  isOpen,
  onOpenChange
}: TaskDetailsProps) {
  const [comments, setComments] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state: any) => state.auth);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/comment/${task._id}`); // Adjust your endpoint as needed
      setComments(response.data.data); // Assuming the response contains an array of comments
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (task && isOpen) {
      fetchComments();
    }
  }, [task, isOpen]);

  const handleCommentSubmit = async (data) => {
    try {
      setIsLoading(true);

      data.taskId = task?._id;
      data.authorId = user?._id;
      const response = await axiosInstance.post('/comment', data);
      if (response.data.success) {
        // Optionally refresh comments after a successful post
        fetchComments();
        reset(); // Reset the form
      } else {
        console.error('Failed to add comment:', response.data.message);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[400px] flex-col p-0 sm:w-[540px]">
        <div className="flex-shrink-0 p-6">
          <SheetHeader>
            <SheetTitle>{task?.taskName}</SheetTitle>
            <SheetDescription>
              <b>Deadline: {moment(task.dueDate).format('MMM Do YYYY')}</b>
            </SheetDescription>
          </SheetHeader>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
          <div className="space-y-4">
            {comments.map((comment: any, index) => (
              <div
                key={comment._id}
                className={`flex ${comment.authorId._id === user?._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex ${comment.authorId._id === user?._id ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}
                >
                  <Avatar
                    className={`h-8 w-8 ${comment.authorId._id === user?._id && 'ml-1'}`}
                  >
                    <AvatarFallback>
                      {comment?.authorId.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[90%] ${comment.authorId._id === user?._id ? 'mr-2' : 'ml-2'}`}
                  >
                    <div
                      className={`rounded-lg p-2 ${comment.authorId._id === user?._id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      {comment.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 border-t bg-gray-50 p-6">
          <form
            onSubmit={handleSubmit(handleCommentSubmit)}
            className="grid gap-2"
          >
            <Label htmlFor="comment" className="sr-only">
              Add Comment
            </Label>
            <Textarea
              id="comment"
              {...register('content', { required: true })}
              placeholder="Type your comment here..."
              className="resize-none"
              rows={3}
            />
            <Button type="submit" variant={'outline'}>
              Submit{' '}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
