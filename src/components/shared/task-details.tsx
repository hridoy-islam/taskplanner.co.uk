//@ts-nocheck
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
import Linkify from 'react-linkify';
import { toast } from 'sonner';
import { useRouter } from '@/routes/hooks';
import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';
import * as UC from '@uploadcare/file-uploader';
import { OutputFileEntry } from '@uploadcare/file-uploader';

UC.defineComponents(UC);
const ENDPOINT = axiosInstance.defaults.baseURL.slice(0, -4);
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
  const [files, setFiles] = useState<OutputFileEntry<'success'>[]>([]);
  const ctxProviderRef = useRef<InstanceType<UC.UploadCtxProvider>>(null);
  const router = useRouter();
  // logic to scroll to the bottom of the chat
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollTop = commentsEndRef.current.scrollHeight;
    }
  }, [comments]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setTyping(true));
    socket.on('stop typing', () => setTyping(false));
  }, [user]);

  const fetchComments = useCallback(async () => {
    // setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/comment/${task._id}`);
      socket.emit('join chat', task._id);
      setComments(response.data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [task?._id]); // Include task._id as a dependency

  useEffect(() => {
    // if (task?._id && isOpen) {
    fetchComments();
    selectedChatCompare = comments;
    // }
    // Only fetch comments if task._id changes
  }, [fetchComments, task._id]);

  // Inside the messageReceivedHandler in the 'message received' event listener
  useEffect(() => {
    const messageReceivedHandler = (newMessageReceived) => {
      const response = newMessageReceived?.data?.data;
      const newComment = {
        authorId: {
          _id: response?.authorId,
          name: response?.authorName
        },
        content: response?.content,
        taskId: response?.taskId,
        _id: response?._id || Math.random().toString(36).substring(7)
      };

      if (task?._id !== newComment?.taskId) {
        toast(`Task: ${response?.taskName || 'new message arrived'}`, {
          description: `Message: ${response?.content}`,
          action: {
            label: 'View',
            onClick: () => {
              // push to the task details page
              alert('push to the task details page');
              router.push(`/dashboard/task/${newComment?.taskId}`);
            }
          }
        });
      } else {
        setComments((prevComments) => {
          // Check if a comment with the same `_id` already exists
          if (!prevComments.some((comment) => comment._id === newComment._id)) {
            return [...prevComments, newComment];
          }
          return prevComments; // Return the current state if duplicate is found
        });
      }
    };

    socket.on('message received', messageReceivedHandler);

    return () => {
      socket.off('message received', messageReceivedHandler);
    };
  }, [task?._id, isOpen]);

  useEffect(() => {
    const ctxProvider = ctxProviderRef.current;
    if (!ctxProvider) return;

    const handleChangeEvent = (e: UC.EventMap['change']) => {
      console.log('change event payload:', e);

      setFiles([
        ...e.detail.allEntries.filter((f) => f.status === 'success')
      ] as OutputFileEntry<'success'>[]);
    };

    /*
      Note: Event binding is the main way to get data and other info from File Uploader.
      There plenty of events you may use.

      See more: https://uploadcare.com/docs/file-uploader/events/
     */
    ctxProvider.addEventListener('change', handleChangeEvent);
    return () => {
      ctxProvider.removeEventListener('change', handleChangeEvent);
    };
  }, [setFiles]);
  console.log(files);

  const handleCommentSubmit = async (data) => {
    try {
      // setIsLoading(true);
      socket.emit('stop typing', task._id);
      data.taskId = task?._id;
      data.authorId = user?._id;
      const response = await axiosInstance.post('/comment', data);
      if (response.data.success) {
        const newComment = {
          authorId: {
            _id: user?._id,
            name: user?.name
          },
          content: data.content,
          taskId: task?._id,
          _id:
            response?.data?.data?._id || Math.random().toString(36).substring(7) // math random is temporary
        };
        setComments([...comments, newComment]);
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

  const typingHandler = () => {
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit('typing', task._id);
    }
    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', task._id);
        setTyping(false);
      }
    }, timerLength);
  };
  const handleKeyDown = (e) => {
    typingHandler();
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
            {comments?.map((comment: any) => (
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
                      style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }} // ensures long text wraps and preserves new lines
                    >
                      <Linkify
                        componentDecorator={(
                          decoratedHref,
                          decoratedText,
                          key
                        ) => (
                          <a
                            href={decoratedHref}
                            key={key}
                            style={{
                              textDecoration: 'underline',
                              color: 'inherit'
                            }}
                          >
                            {decoratedText}
                          </a>
                        )}
                      >
                        {comment.content}
                      </Linkify>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 border-t bg-gray-50 p-6">
          {/* typing indicator */}
          {typing && (
            <div className="relative bottom-5 flex h-[5px] items-center space-x-2 p-2 text-xs">
              <div className="h-1 w-1 animate-ping rounded-full bg-gray-400"></div>
              <div className="h-1 w-1 animate-ping rounded-full bg-gray-400"></div>
              <div className="h-1 w-1 animate-ping rounded-full bg-gray-400"></div>
              <span>Typing...</span>
            </div>
          )}
          <form
            onSubmit={handleSubmit(handleCommentSubmit)}
            className="grid gap-2"
          >
            <Label htmlFor="comment" className="sr-only">
              Add Comment
            </Label>
            {files?.length === 0 && (
              <Textarea
                id="comment"
                {...register('content', { required: true })}
                placeholder="Type your comment here..."
                className="resize-none"
                rows={3}
                onKeyDown={handleKeyDown}
              />
            )}
            <div className="flex flex-row items-center justify-center gap-2">
              {/* <FileUploaderRegular
                sourceList="local, url, camera, gdrive"
                classNameUploader="uc-light"
                pubkey="48a797785d228ebb9033"
              /> */}
              <uc-config
                ctx-name="my-uploader-3"
                pubkey="48a797785d228ebb9033"
                sourceList="local, url, camera, dropbox"
              ></uc-config>
              <uc-file-uploader-regular
                class="uc-light"
                ctx-name="my-uploader-3"
              ></uc-file-uploader-regular>
              <uc-upload-ctx-provider
                ctx-name="my-uploader-3"
                ref={ctxProviderRef}
              ></uc-upload-ctx-provider>
              {files?.length > 0 ? (
                <Button type="submit" className="w-full" variant={'outline'}>
                  {`Finish (${files?.length})`}
                </Button>
              ) : (
                <Button type="submit" className="w-full" variant={'outline'}>
                  Submit
                </Button>
              )}
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
