/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
// import seen from '@/assets/imges/home/logos/seen.svg';
// import delivered from '@/assets/imges/home/logos/delivered.svg';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import moment from 'moment';
import axiosInstance from '@/lib/axios';
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
import delivered from '@/assets/imges/home/logos/delivered.svg';
import seen from '@/assets/imges/home/logos/seen.svg';
import {
  ArrowUp,
  ArrowUpRightFromSquare,
  DownloadIcon,
  ForwardIcon,
  Paperclip,
  Edit,
  Check,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import axios from 'axios';
import { ScrollArea } from '@/components/ui/scroll-area';

import { ImageUploader } from './file-uploader';
import Loader from '@/components/shared/loader';

UC.defineComponents(UC);
const ENDPOINT = axiosInstance.defaults.baseURL.slice(0, -4);
let socket, selectedChatCompare;

interface TaskChatProps {
  task: {
    _id: string;
    taskName: string;
    dueDate: string;
  };
}

export default function TaskChat({ task }: TaskChatProps) {
  const [typing, setTyping] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [document, setDocument] = useState<any[]>([]);
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const [socketConnected, setSocketConnected] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<OutputFileEntry<'success'>[]>([]);
  const ctxProviderRef = useRef<InstanceType<UC.UploadCtxProvider>>(null);
  const router = useRouter();
  const [displayedComments, setDisplayedComments] = useState<any[]>([]);
  const [maxComments, setMaxComments] = useState(50);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollTop = commentsEndRef.current.scrollHeight;
    }
  }, [displayedComments?.length]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
  }, [user]);

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditedContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent('');
    reset({ content: '' });
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editedContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const response = await axiosInstance.patch(`/comment/${commentId}`, {
        content: editedContent
      });

      if (response.data.success) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, content: editedContent }
              : comment
          )
        );
        setDisplayedComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, content: editedContent }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditedContent('');
        reset({ content: '' });
        toast.success('Comment updated successfully');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const updateLastReadMessage = async (taskId, userId, messageId) => {
    try {
      const body = {
        taskId,
        userId,
        messageId
      };
      const response = await axiosInstance.post(`/task/readcomment`, body);
      if (!response.data.success) {
        console.error(
          'Failed to update last read message:',
          response.data.message
        );
      }
    } catch (error) {
      console.error('Error updating last read message:', error);
    }
  };

  const fetchComments = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/comment/${task?._id}`);
      socket.emit('join chat', task?._id);
      setComments(response.data.data);
      const fetchedComments = response.data.data;
      const lastComment = fetchedComments[fetchedComments.length - 1];
      await updateLastReadMessage(task?._id, user?._id, lastComment._id);
      setDisplayedComments(response.data.data.slice(-maxComments));
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [task?._id, maxComments]);

  useEffect(() => {
    fetchComments();
    selectedChatCompare = comments;
  }, [fetchComments, task?._id]);

  useEffect(() => {
    if (files.length > 0) {
      handleFileSubmit();
    }
  }, [files]);

  useEffect(() => {
    const messageReceivedHandler = async (newMessageReceived) => {
      const response = newMessageReceived?.data?.data;
      const newComment = {
        authorId: {
          _id: response?.authorId,
          name: response?.authorName
        },
        content: response?.content,
        isFile: response?.isFile,
        taskId: response?.taskId,
        _id: response?._id || Math.random().toString(36).substring(7)
      };

      if (task?._id !== newComment?.taskId) {
        toast(`Task: ${response?.taskName || 'new message arrived'}`, {
          description: `Message: ${response?.content}`
        });
      } else {
        setComments((prevComments) => {
          if (!prevComments.some((comment) => comment._id === newComment._id)) {
            return [...prevComments, newComment];
          }
          return prevComments;
        });
        setDisplayedComments((prevComments) => {
          if (!prevComments.some((comment) => comment._id === newComment._id)) {
            return [...prevComments, newComment];
          }
          return prevComments;
        });
        await updateLastReadMessage(
          newComment?.taskId,
          user?._id,
          newComment._id
        );
      }
    };

    socket.on('message received', messageReceivedHandler);

    return () => {
      socket.off('message received', messageReceivedHandler);
    };
  }, [task?._id]);

  useEffect(() => {
    const ctxProvider = ctxProviderRef.current;
    if (!ctxProvider) return;

    const handleChangeEvent = async (e: UC.EventMap['change']) => {
      setFiles(
        e.detail.allEntries
          .filter((f) => f.status === 'success')
          .map((f) => f as OutputFileEntry<'success'>)
      );
    };

    ctxProvider.addEventListener('change', handleChangeEvent);

    return () => {
      ctxProvider.removeEventListener('change', handleChangeEvent);
    };
  }, [files, ctxProviderRef.current]);

  const handleCommentSubmit = async (data) => {
    if (!data.content) {
      console.error(data, 'Content is required to submit a comment.');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
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
          content: data?.content,
          isFile: data?.isFile,
          taskId: task?._id,
          _id:
            response?.data?.data?._id || Math.random().toString(36).substring(7)
        };
        setComments([...comments, newComment]);
        setDisplayedComments((prevComments) => [...prevComments, newComment]);
        await updateLastReadMessage(
          newComment?.taskId,
          user?._id,
          newComment._id
        );
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
      setIsSubmitting(false);
    }
  };

  const typingHandler = () => {
    if (!socketConnected) return;
    if (!typing) {
      socket.emit('typing', task._id);
    }
    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', task._id);
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

  const calculateScrollPosition = () => {
    if (commentsEndRef.current) {
      return (
        commentsEndRef.current.scrollHeight - commentsEndRef.current.scrollTop
      );
    }
    return 0;
  };

  const saveFileToDb = async () => {};

  const applyScrollPosition = (scrollPosition) => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollTop =
        commentsEndRef.current.scrollHeight - scrollPosition;
    }
  };

  const handleLoadMoreComments = () => {
    const scrollPosition = calculateScrollPosition();
    setMaxComments((prevMaxComments) => prevMaxComments + 50);
    setDisplayedComments(comments.slice(-maxComments - 50));
    setTimeout(() => {
      applyScrollPosition(scrollPosition);
    }, 0);
  };

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="bg-white flex flex-row items-center justify-start p-2">
      <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={task?.assigned?.image}  />
              <AvatarFallback>
                {task?.assigned?.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold">{task?.assigned?.name}</h2>
          </div>
      </div>
      <div className="basis-6/7 flex w-full flex-col -mt-24">
        <ScrollArea className="h-[calc(100vh-270px)] p-6">
          <div ref={commentsEndRef} className="space-y-4">
            {comments.length > displayedComments.length && (
              <div className="text-center">
                {/* <Button onClick={handleLoadMoreComments} variant={'ghost'}>
                  Load More Comments <ArrowUp className="ml-2 h-4 w-4" />
                </Button> */}

                <Loader />
              </div>
            )}
            {displayedComments?.map((comment: any) => {
              const isFile = comment.isFile;
              let parsedContent = comment.content;

              if (isFile) {
                try {
                  // Check if the content starts with `{` or `[`, which are valid JSON structures
                  if (
                    comment.content.trim().startsWith('{') ||
                    comment.content.trim().startsWith('[')
                  ) {
                    parsedContent = JSON.parse(comment.content);
                  } else {
                    parsedContent = comment.content; // or any other appropriate handling
                  }
                } catch (error) {
                  console.error('Failed to parse file content:', error);
                }
              }

              return (
                <div
                  key={comment._id}
                  className={`group mb-4 flex w-full flex-row gap-1 ${
                    comment.authorId._id === user?._id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div className="relative flex flex-col items-end justify-end">
                    {/* Edit button that appears on hover */}
                    {comment.authorId?._id === user?._id && !comment.isFile && (
                      <div className="absolute -left-8 top-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button
                          onClick={() =>
                            handleEditComment(comment._id, comment.content)
                          }
                          className="rounded-full bg-gray-100 p-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
                          aria-label="Edit message"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`relative flex min-w-[120px] max-w-[320px] flex-col ${
                        comment.authorId._id === user?._id
                          ? 'rounded-tr-none bg-[#002055] text-white'
                          : 'rounded-tl-none bg-[#9333ea] text-white'
                      } rounded-2xl p-3 transition-all duration-200 group-hover:shadow-md`}
                      style={{
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'break-word'
                      }}
                    >
                      {/* Author name */}
                      <div className="mb-1 flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {comment?.authorId?.name}
                        </span>
                      </div>

                      {/* Message content */}
                      <div className="max-w-full">
                        {comment.isFile ? (
                          <div
                            className={`flex items-center space-x-2 rounded-lg p-2 ${
                              comment.authorId._id === user?._id
                                ? 'bg-blue-500/15'
                                : 'bg-green-300/80'
                            }`}
                          >
                            {(() => {
                              let parsedContent;
                              try {
                                parsedContent = JSON.parse(comment.content);
                              } catch (error) {
                                parsedContent = comment.content;
                              }

                              return (
                                <div className="flex items-start space-x-1">
                                  <img
                                    src={parsedContent}
                                    alt={'File'}
                                    className="max-h-32 max-w-full rounded shadow-sm"
                                  />

                                  <span className="overflow-hidden text-ellipsis">
                                    {typeof parsedContent === 'object'
                                      ? parsedContent.originalFilename
                                      : ''}
                                  </span>

                                  <a
                                    href={
                                      typeof parsedContent === 'object'
                                        ? parsedContent.url
                                        : parsedContent
                                    }
                                    download={
                                      typeof parsedContent === 'object'
                                        ? parsedContent.originalFilename
                                        : 'file'
                                    }
                                    className="text-gray-900 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ArrowUpRightFromSquare className="h-5 w-5 text-gray-500 hover:text-gray-200" />
                                  </a>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <Linkify
                            componentDecorator={(
                              decoratedHref,
                              decoratedText,
                              key
                            ) => (
                              <a
                                href={decoratedHref}
                                key={key}
                                className="text-blue-300 underline transition-colors hover:text-blue-200"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {decoratedText}
                              </a>
                            )}
                          >
                            {comment.content}
                          </Linkify>
                        )}
                      </div>
                    </div>

                    {/* Message metadata */}
                    <div
                      className={`mt-1 flex w-full flex-row items-center gap-1 ${
                        comment.authorId._id !== user?._id
                          ? 'justify-end'
                          : 'justify-between'
                      }`}
                    >
                      {comment.authorId._id === user?._id && (
                        <p className="text-xs text-gray-500">
                          {comment.seenBy?.length > 1 ? 'Seen' : 'Delivered'}
                        </p>
                      )}

                      <div className="flex items-center gap-1">
                        {comment.editedAt && (
                          <span className="text-[10px] italic text-gray-400">
                            edited
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500">
                          {moment(comment?.createdAt).isSame(moment(), 'day')
                            ? moment(comment?.createdAt).format('h:mm A')
                            : moment(comment?.createdAt).format('MMM D')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
      <div className="basis-1/7 sticky bottom-0 border-t border-gray-200 bg-gray-50 p-6">
        {editingCommentId && (
          <div className="mb-2 flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-sm">
            <span>Editing message</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingCommentId) {
              handleSaveEdit(editingCommentId);
            } else {
              // Get the form data and pass it to handleCommentSubmit
              const formData = new FormData(e.currentTarget);
              const content = formData.get('content') as string;
              handleCommentSubmit({ content });
            }
          }}
          className="grid gap-2"
        >
          <Label htmlFor="comment" className="sr-only">
            Add Comment
          </Label>
          {files?.length === 0 && (
            <Textarea
              id="comment"
              name="content" // Add name attribute for FormData
              {...(!editingCommentId
                ? register('content', { required: true })
                : {})}
              value={editingCommentId ? editedContent : undefined}
              onChange={(e) => {
                if (editingCommentId) {
                  setEditedContent(e.target.value);
                }
              }}
              placeholder={
                editingCommentId
                  ? 'Edit your message...'
                  : 'Type your comment here...'
              }
              className="resize-none"
              rows={3}
              onKeyDown={(e) => {
                typingHandler();
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (editingCommentId) {
                    handleSaveEdit(editingCommentId);
                  } else {
                    const formData = new FormData(e.currentTarget.form);
                    const content = formData.get('content') as string;
                    handleCommentSubmit({ content });
                  }
                }
              }}
              disabled={isSubmitting}
            />
          )}
          <div className="flex flex-row items-center justify-center gap-2">
            {!editingCommentId && (
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => setIsImageUploaderOpen(true)}
              >
                <Paperclip className="mr-2 h-4 w-4" /> Upload
              </Button>
            )}
            <Button type="submit" className="w-full" variant={'outline'}>
              {editingCommentId ? 'Update' : 'Submit'}
            </Button>
          </div>
        </form>

        {/* Image Uploader Component */}
        <ImageUploader
          open={isImageUploaderOpen}
          onOpenChange={setIsImageUploaderOpen}
          multiple={false}
          onUploadComplete={(uploadedFiles) => {
            handleCommentSubmit({
              content: uploadedFiles.data.fileUrl,
              isFile: true
            });
          }}
          className="uc-light"
        />
      </div>
    </div>
  );
}
