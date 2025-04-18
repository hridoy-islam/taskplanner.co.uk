/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Paperclip
} from 'lucide-react';
import { ImageUploader } from '@/components/shared/image-uploader';
import axios from 'axios';

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
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://core.qualitees.co.uk/api/documents?where=entity_id,${task?._id}&exclude=file_type,document`,
        {
          headers: {
            'x-company-token': 'taskplanner-520480935547'
          }
        }
      );
      console.log(response?.data);
    } catch (error) {
      console.error('error Fetching Document', error);
    }
  };

  useEffect(() => {
    if (task?._id) {
      fetchData();
    }
  }, [task?._id]);

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
    return <div>Loading...</div>;
  }
  return (
    <div className='flex flex-col justify-between h-full '>
      <div className="flex basis-6/7 w-full overflow-y-auto flex-col py-4 ">
        <div ref={commentsEndRef} className=" flex-1 overflow-y-auto  p-6">
          <div className="space-y-4">
            {comments.length > displayedComments.length && (
              <div className="text-center">
                <Button onClick={handleLoadMoreComments} variant={'ghost'}>
                  Load More Comments <ArrowUp className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
            {displayedComments?.map((comment: any) => {
              const isFile = comment.isFile;
              let parsedContent = comment.content;

              if (isFile) {
                try {
                  parsedContent = JSON.parse(comment.content);
                } catch (error) {
                  console.error('Failed to parse file content:', error);
                }
              }

              return (
                <div
                  key={comment._id}
                  className={`flex w-full flex-row ${
                    comment.authorId._id === user?._id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex max-w-80 flex-col items-end justify-end xl:max-w-60 ${
                      comment.authorId._id === user?._id
                        ? 'flex-row-reverse'
                        : 'flex-row'
                    } items-center space-x-2`}
                    style={{
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word'
                    }}
                  >
                    <div
                      className={`max-w-[90%] ${
                        comment.authorId?._id === user?._id ? 'mr-2' : 'ml-2'
                      }`}
                    >
                      <div
                        className={`flex min-w-[150px] flex-col rounded-lg ${
                          isFile
                            ? comment.authorId?._id === user?._id
                              ? 'bg-[#002055] p-2 text-white ' // For the current user
                              : 'bg-[#9333ea]  p-2 text-white ' // For others
                            : comment.authorId?._id === user?._id
                              ? 'bg-[#002055] p-2 text-white'
                              : 'bg-[#9333ea]  p-2 text-white'
                        }`}
                        style={{
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'break-word'
                        }}
                      >
                        <span className="inline-block items-center overflow-hidden text-ellipsis whitespace-nowrap pb-1 text-xs md:text-xs md:font-semibold">
                          {comment?.authorId?.name}
                        </span>
                        {isFile ? (
                          <div
                            className={`flex items-center space-x-2 rounded-lg ${
                              comment.authorId?._id === user?._id
                                ? 'bg-gray-600 p-2'
                                : 'bg-gray-600 p-2'
                            }`}
                          >
                            {parsedContent.mimeType?.startsWith('image/') ? (
                              <div className="flex items-end space-x-2">
                                <img
                                  src={parsedContent}
                                  alt={parsedContent || 'Preview'}
                                  className="max-h-32 max-w-full rounded shadow-sm"
                                />
                                <a
                                  href={parsedContent}
                                  download={parsedContent}
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ArrowUpRightFromSquare className="h-4 w-4 font-extralight" />
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-end space-x-2 overflow-hidden text-ellipsis whitespace-pre-wrap break-words">
                                <span className="overflow-hidden">
                                  {parsedContent.originalFilename || 'File'}
                                </span>
                                <a
                                  href={parsedContent}
                                  download={parsedContent}
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <DownloadIcon className="h-4 w-4" />
                                </a>
                              </div>
                            )}
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
                        )}
                      </div>
                      <div className="flex flex-row items-center justify-between gap-2 p-1">
                        <div className="flex flex-row items-center gap-1">
                          {comment.authorId?._id === user?._id && (
                            <p className="text-xs text-gray-500">
                              {comment.seenBy?.length > 1
                                ? 'Seen'
                                : 'Delivered'}
                            </p>
                          )}

                          {comment.authorId?._id === user?._id && (
                            <img
                              src={
                                comment.seenBy?.length > 1 ? seen : delivered
                              }
                              alt={
                                comment.seenBy?.length > 1
                                  ? 'seen'
                                  : 'delivered'
                              }
                              className="h-2.5 w-2.5"
                            />
                          )}
                        </div>

                        <span className="text-[10px] opacity-70">
                          {moment(comment?.createdAt).isSame(moment(), 'day')
                            ? moment(comment?.createdAt).format('hh:mm A')
                            : moment(comment?.createdAt).format('DD/MM/YYYY')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className=" sticky basis-1/7 bottom-0 border-t border-gray-200 bg-gray-50 p-6">
        {/* {typing && (
            <div className="relative bottom-5 flex h-[5px] items-center space-x-2 p-2 text-xs">
              <div className="h-1 w-1 animate-ping rounded-full bg-gray-400"></div>
              <div className="h-1 w-1 animate-ping rounded-full bg-gray-400"></div>
              <div className="h-1 w-1 animate-ping rounded-full bg-gray-400"></div>
              <span>Typing...</span>
            </div>
          )} */}
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
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setIsImageUploaderOpen(true)}
            >
              <Paperclip className="mr-2 h-4 w-4" /> Upload
            </Button>

            <Button type="submit" className="w-full" variant={'outline'}>
              Submit
            </Button>
          </div>
        </form>
        <ImageUploader
          open={isImageUploaderOpen}
          onOpenChange={setIsImageUploaderOpen}
          multiple={false}
          onUploadComplete={(uploadedFiles) => {
            // if (uploadedFiles?.file_url) {

            handleCommentSubmit({
              content: uploadedFiles.data.file_url,
              isFile: true
            });

            // }
          }}
          className="uc-light"
        />
      </div>
    </div>
  );
}
