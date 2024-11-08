import { useState, useEffect, useCallback, useRef } from 'react';
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
import { io } from 'socket.io-client';

const ENDPOINT = 'http://localhost:4000';
let socket, selectedChatCompare;

interface TaskDetailsProps {
  task: {
    _id: string;
    taskName: string;
    dueDate: string;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetails({
  task,
  isOpen,
  onOpenChange
}: TaskDetailsProps) {
  const [typing, setTyping] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const [socketConnected, setSocketConnected] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      socket.emit('join chat', task._id);
      const response = await axiosInstance.get(`/comment/${task._id}`);
      setComments(response.data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [task?._id]); // Include task._id as a dependency

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setTyping(true));
    socket.on('stop typing', () => setTyping(false));
  }, []);

  useEffect(() => {
    socket.on('message received', (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // give notification
      } else {
        const modifiedMsg = {
          message: newMessageReceived?.content,
          sender: newMessageReceived?.sender?.name,
          direction:
            newMessageReceived?.sender?._id === user._id
              ? 'outgoing'
              : 'incoming'
        };
        setComments((prevComments) => [...prevComments, modifiedMsg]);
      }
    });
  }, [comments]); // Include `comments` dependency

  useEffect(() => {
    if (task?._id && isOpen) {
      fetchComments();
    }
    // Only fetch comments if task._id changes
  }, [task?._id, isOpen]);

  // logic to scroll to the bottom of the chat
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollTop = commentsEndRef.current.scrollHeight;
    }
  }, [comments]);

  const handleCommentSubmit = async (data) => {
    try {
      // setIsLoading(true);
      socket.emit('stop typing', task._id);
      data.taskId = task?._id;
      data.authorId = user?._id;
      const response = await axiosInstance.post('/comment', data);
      if (response.data.success) {
        fetchComments();
        socket.emit('new message', response);
        reset();
      } else {
        console.error('Failed to add comment:', response.data.message);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      socket.emit('stop typing', task._id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(handleCommentSubmit)();
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
        <div ref={commentsEndRef} className="flex-grow overflow-y-auto p-6">
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <div
                key={comment._id}
                className={`flex ${comment.authorId._id === user?._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex ${comment.authorId._id === user?._id ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}
                >
                  <Avatar
                    className={`h-8 w-8 ${comment.authorId._id === user?._id && 'ml-1'} ${socketConnected && 'border border-green-500'}`} // Add animate-ping class
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
              onKeyDown={handleKeyDown}
            />
            <Button type="submit" variant={'outline'}>
              Submit
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
