/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
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
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { io } from 'socket.io-client';
import Linkify from 'react-linkify';
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
  X,
  DotIcon,
  DotSquareIcon,
  EyeIcon,
  AlignJustify
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import axios from 'axios';
import { ScrollArea } from '@/components/ui/scroll-area';
import Loader from '@/components/shared/loader';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { FileUploader } from './file-uploader';
import { cn } from '@/lib/utils';
UC.defineComponents(UC);
const ENDPOINT = axiosInstance.defaults.baseURL
  ? axiosInstance.defaults.baseURL.slice(0, -4)
  : '';
let socket, selectedChatCompare;

interface TaskChatProps {
  task: {
    _id: string;
    taskName: string;
    dueDate: string;
    assigned?: {
      name: string;
      image?: string;
    };
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
  const [maxComments, setMaxComments] = useState(500);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (!ENDPOINT) return;
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));

    // Cleanup socket on unmount
    return () => {
      socket.disconnect();
    };
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
      toast({ title: 'Comment cannot be empty', variant: 'destructive' });
      return;
    }

    try {
      const response = await axiosInstance.patch(`/comment/${commentId}`, {
        content: editedContent
      });

      if (response.data.success) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment?._id === commentId
              ? { ...comment, content: editedContent }
              : comment
          )
        );
        setDisplayedComments((prevComments) =>
          prevComments.map((comment) =>
            comment?._id === commentId
              ? { ...comment, content: editedContent }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditedContent('');
        reset({ content: '' });
        toast({ title: 'Comment updated successfully' });
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({ title: 'Failed to update comment', varient: 'destructive' });
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
    if (!task?._id) return;
    try {
      const response = await axiosInstance.get(`/comment/${task?._id}`);
      if (socket) socket.emit('join chat', task?._id);
      setComments(response.data.data);
      const fetchedComments = response.data.data;
      const lastComment = fetchedComments[fetchedComments.length - 1];
      if (lastComment) {
        await updateLastReadMessage(task?._id, user?._id, lastComment?._id);
      }
      setDisplayedComments(response.data.data.slice(-maxComments));
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [task?._id, maxComments, user?._id]);

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
    if (!socket) return;
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
        toast({
          title: `Task: ${response?.taskName || 'New message arrived'}`,
          description: `Message: ${response?.content}`,
          variant: 'success'
        });
      } else {
        setComments((prevComments) => {
          if (
            !prevComments.some((comment) => comment?._id === newComment._id)
          ) {
            return [...prevComments, newComment];
          }
          return prevComments;
        });
        setDisplayedComments((prevComments) => {
          if (
            !prevComments.some((comment) => comment?._id === newComment._id)
          ) {
            return [...prevComments, newComment];
          }
          return prevComments;
        });
        await updateLastReadMessage(
          newComment?.taskId,
          user?._id,
          newComment?._id
        );
      }
    };

    socket.on('message received', messageReceivedHandler);

    return () => {
      socket.off('message received', messageReceivedHandler);
    };
  }, [task?._id, user?._id]);

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
      if (socket) socket.emit('stop typing', task._id);
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
        if (socket) socket.emit('new message', response);
        reset();
      } else {
        console.error('Failed to add comment:', response.data.message);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      if (socket) socket.emit('stop typing', task._id);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const typingHandler = () => {
    if (!socketConnected || !socket) return;
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

  const handleLoadMoreComments = () => {
    const scrollPosition = calculateScrollPosition();
    setMaxComments((prevMaxComments) => prevMaxComments + 50);
    setDisplayedComments(comments.slice(-maxComments - 50));
    setTimeout(() => {
      // applyScrollPosition(scrollPosition); // this function was missing in original code, commented out to prevent error
    }, 0);
  };

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [displayedComments, comments, task?._id, isLoading]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [displayedComments, comments]);

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  const handleGlobalDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const droppedFile = e.dataTransfer.files?.[0];
      if (!droppedFile) return;

      // Validate size (5MB example)
      if (droppedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Max 5MB allowed',
          variant: 'destructive'
        });
        return;
      }

      autoUploadFile(droppedFile);
    },
    [task._id, user._id]
  );

  // 2. The Auto-Upload Logic
  const autoUploadFile = async (file: File) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('entityId', task._id);
    formData.append('file_type', 'taskDoc');
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/documents', formData);

      if (response.data) {
        // Once uploaded to the document server, send it as a chat message
        // Note: adjust the path (response.data.fileUrl) to match your API response
        handleCommentSubmit({
          content: response.data.data.fileUrl || response.data.url,
          isFile: true
        });
        toast({ title: 'File uploaded successfully' });
      }
    } catch (error) {
      console.error('Auto-upload failed', error);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="flex h-full w-full flex-col justify-between rounded-xl scrollbar-hide">
      {/* Header Section (Fixed) */}
      <div className="sticky top-0 z-10 flex w-full items-center justify-between rounded-t-xl bg-gray-200 p-4">
        {/* Left side content */}
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={task?.assigned?.image} />
            <AvatarFallback>
              {/* FIX: Safe check before splitting */}
              {(task?.assigned?.name || 'Unassigned')
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold">
            {task?.assigned?.name || 'Unassigned'}
          </h2>
        </div>

        {/* Right side content: 3-dot menu */}
        <div className="ml-auto flex items-center">
          {/* ShadCN DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-2 hover:bg-gray-300">
                <AlignJustify size={20} /> {/* Using Lucid 3-dot icon */}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 -translate-x-4 rounded-md bg-white shadow-lg">
              <ul className="">
                <DropdownMenuItem
                  onClick={handleOpenDialog}
                  className="w-full p-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  Files
                </DropdownMenuItem>
              </ul>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ShadCN Dialog for 'Files' */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger />
          <DialogContent className="mx-auto max-w-2xl rounded-md bg-white p-4 shadow-lg">
            <DialogTitle className="text-xl font-semibold">Files</DialogTitle>
            <DialogDescription className="mt-2">
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 gap-4">
                  {comments
                    .filter((comment) => comment.isFile)
                    .map((comment) => {
                      let fileContent;
                      try {
                        fileContent = JSON.parse(comment.content);
                      } catch (error) {
                        fileContent = comment.content;
                      }

                      const fileUrl =
                        typeof fileContent === 'object'
                          ? fileContent.url
                          : fileContent;

                      return (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                          key={comment._id} // move key here
                        >
                          <Card className="cursor-pointer border border-gray-200 p-4 shadow-md hover:bg-gray-100">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {typeof fileContent === 'object' &&
                                fileContent.mimeType?.startsWith('image/') ? (
                                  <img
                                    src={fileContent.url}
                                    alt={fileContent.originalFilename}
                                    className="h-16 w-16 rounded object-cover"
                                  />
                                ) : (
                                  <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100">
                                    <Paperclip className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">
                                    {typeof fileContent === 'object'
                                      ? fileContent.originalFilename
                                      : 'File'}
                                  </h3>
                                  <EyeIcon className="h-5 w-5 text-blue-500" />
                                </div>
                                <p className="text-sm text-gray-500">
                                  Uploaded by {comment.authorId?.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {moment(comment.createdAt).format(
                                    'MMM D, YYYY h:mm A'
                                  )}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </a>
                      );
                    })}
                </div>

                {comments.filter((comment) => comment.isFile).length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center py-8 text-gray-500">
                    <Paperclip className="h-12 w-12" />
                    <p className="mt-2">No files shared yet</p>
                  </div>
                )}
              </ScrollArea>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto p-6 ">
        <div ref={scrollContainerRef} className="space-y-4">
          {comments.length > displayedComments.length && (
            <div className="text-center">
              <Loader />
            </div>
          )}
          {displayedComments?.map((comment: any) => {
            const isFile = comment.isFile;
            let parsedContent = comment.content;
            if (isFile) {
              try {
                if (
                  comment.content.trim().startsWith('{') ||
                  comment.content.trim().startsWith('[')
                ) {
                  parsedContent = JSON.parse(comment.content);
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
                  <div
                    className={`relative flex min-w-[120px] max-w-[320px] flex-col rounded-2xl p-3 transition-all duration-200 group-hover:shadow-md ${
                      comment.authorId._id === user?._id
                        ? 'rounded-tr-none bg-[#002055] text-white'
                        : 'rounded-tl-none bg-[#9333ea] text-white'
                    }`}
                    style={{
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word'
                    }}
                  >
                    <div className="mb-1 flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {comment?.authorId?.name}
                      </span>
                    </div>
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
                          : moment(comment?.createdAt).format('MMM D,YYYY')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={commentsEndRef} />
        </div>
      </ScrollArea>

      {/* Comment Input Section (Sticky) */}
      <div className="basis-1/7 sticky bottom-0 border-t border-gray-200 bg-gray-50 p-4">
  {/* Editing Message Indicator - Now integrated as a tab */}
  {editingCommentId && (
    <div className="mx-auto mb-[-1px] flex max-w-4xl items-center justify-between rounded-t-lg border border-b-0 border-amber-200 bg-amber-50 px-3 py-1.5 text-xs shadow-sm">
      <span className="flex items-center gap-2 font-medium text-amber-700">
        <Edit className="h-3 w-3" />
        Editing message
      </span>
      <button 
        onClick={handleCancelEdit}
        className="text-amber-500 hover:text-amber-700 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )}

  <form
    onSubmit={async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      if (pendingFile) {
        setIsSubmitting(true);
        try {
          const formData = new FormData();
          formData.append('entityId', task?._id);
          formData.append('file_type', 'taskDoc');
          formData.append('file', pendingFile);

          const response = await axiosInstance.post('/documents', formData);
          if (response.data) {
            await handleCommentSubmit({
              content: response.data.data.fileUrl,
              isFile: true
            });
            setPendingFile(null);
            toast({ title: 'File sent successfully' });
          }
        } catch (err) {
          toast({ title: 'Upload failed', variant: 'destructive' });
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      const formData = new FormData(e.currentTarget);
      const content = formData.get('content') as string;
      if (content?.trim()) {
        if (editingCommentId) {
          handleSaveEdit(editingCommentId);
        } else {
          handleCommentSubmit({ content });
          e.currentTarget.reset(); // Clear form after submit
        }
      }
    }}
    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
    onDragLeave={() => setDragActive(false)}
    onDrop={(e) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) setPendingFile(file);
    }}
    className={`mx-auto max-w-4xl overflow-hidden rounded-xl border bg-white transition-all shadow-sm ${
      dragActive ? 'ring-2 ring-taskplanner border-taskplanner bg-blue-50/50' : 'border-gray-300 focus-within:border-taskplanner focus-within:ring-1 focus-within:ring-taskplanner'
    }`}
  >
    {/* Uploading Loader Overlay */}
    {/* {isSubmitting && (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
        <Loader className="h-5 w-5 animate-spin text-taskplanner" />
      </div>
    )} */}

    {/* PENDING FILE ATTACHMENT */}
    {pendingFile && (
      <div className="flex items-center gap-3 border-b bg-gray-50/50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm">
          <Paperclip className="h-5 w-5 text-taskplanner" /> 
        </div>
        <div className="flex-1 overflow-hidden text-left">
          <p className="truncate text-sm font-medium text-gray-900">{pendingFile.name}</p>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            {(pendingFile.size / 1024 / 1024).toFixed(2)} MB • Ready to send
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPendingFile(null)}
          className="rounded-full p-1 hover:bg-gray-200 text-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )}

    <div className="relative flex flex-col">
      <Textarea
        id="comment"
        name="content"
        {...(!editingCommentId ? register('content', { required: !pendingFile }) : {})}
        value={editingCommentId ? editedContent : undefined}
        onChange={(e) => editingCommentId && setEditedContent(e.target.value)}
        placeholder={dragActive ? "Drop file to upload" : "Write a message..."}
        className={`min-h-[44px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm focus-visible:ring-0 disabled:opacity-50 ${pendingFile ? 'hidden' : 'block'}`}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        disabled={isSubmitting}
      />

      {/* Action Toolbar */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-white px-2 py-2">
        <div className="flex items-center">
          {!editingCommentId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className=" text-white bg-taskplanner hover:text-white hover:bg-taskplanner/90"
              onClick={() => setIsImageUploaderOpen(true)}
              disabled={isSubmitting}
            >
              <Paperclip className="h-4 w-4 mr-2" /> Attachment
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pendingFile && (
             <span className="text-[10px] font-bold text-taskplanner uppercase mr-2">File Attachment</span>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-8 rounded-lg bg-taskplanner px-4 text-xs font-semibold text-white hover:bg-taskplanner/90"
          >
            {editingCommentId ? 'Update' : pendingFile ? 'Send File' : 'Send'}
            <ArrowUp className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  </form>

  <FileUploader
    open={isImageUploaderOpen}
    onOpenChange={setIsImageUploaderOpen}
    onUploadComplete={(uploadedFiles) => {
      handleCommentSubmit({
        content: uploadedFiles.data.fileUrl,
        isFile: true
      });
    }}
  />
</div>
    </Card>
  );
}
