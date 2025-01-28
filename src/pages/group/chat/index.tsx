/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import axiosInstance from '../../../lib/axios';
import { io } from 'socket.io-client';
import Linkify from 'react-linkify';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  UserMinus,
  Send,
  Paperclip,
  X,
  Loader,
  DownloadIcon,
  ArrowUpRightFromSquare,
  Settings,
  Settings2,
  ArrowUp,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useRouter } from '@/routes/hooks';
import { useParams } from 'react-router-dom';
import { set } from 'date-fns';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import * as UC from '@uploadcare/file-uploader';
import { OutputFileEntry } from '@uploadcare/file-uploader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ImageUploader } from '@/components/shared/image-uploader';

// Mock data
const ENDPOINT = axiosInstance.defaults.baseURL.slice(0, -4);
let socket, selectedChatCompare;

interface Member {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface Comment {
  id: number;
  memberId: number;
  content: string;
  createdAt: Date;
}

interface Notification {
  id: number;
  content: string;
  isRead: boolean;
}

const getRandomColor = () => {
  const colors = [
    'red-500', // Medium red
    'blue-500', // Medium blue
    'green-500', // Medium green
    'yellow-500', // Medium yellow
    'purple-500', // Medium purple
    'pink-500', // Medium pink
    'orange-500', // Medium orange
    'teal-500' // Medium teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function GroupChat() {
  const router = useRouter();
  const [socketConnected, setSocketConnected] = useState(false);
  const currentPath = router?.location?.pathname?.split('/')[3] || 'null';
  const { groupId } = useParams<{ groupId: string }>();
  const [groupDetails, setGroupDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<OutputFileEntry<'success'>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const limit = 50;
  const [initialMembers, setInitialMembers] = useState<Member[]>([]);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);

  const [groupMembers, setGroupMembers] = useState(
    initialMembers?.map((member) => ({
      ...member,
      color: getRandomColor()
    }))
  );
  const ctxProviderRef = useRef<InstanceType<UC.UploadCtxProvider>>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember2, setSelectedMember2] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const buttonRef = useRef(null);
  const goDown = () => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollTop = commentsEndRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    goDown();
  }, [comments.length]);
  // Filter members based on search input
  const filteredMembers = initialMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const groupName = groupDetails?.groupName || 'Group Name';

  const { user } = useSelector((state: any) => state.auth);

  const fetchMembers = async () => {
    try {
      const response = await axiosInstance.get(`/users/company/${user?._id}`);

      return response.data.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  };

  const handleMemberDialog = () => {
    setIsAddMemberOpen(true);
    // fetch members
    const loadMembers = async () => {
      const fetchedMembers = await fetchMembers();
      const currentMemberIds =
        groupDetails?.members?.map((member: any) => member._id) || [];
      const nonGroupMembers = fetchedMembers.filter(
        (member: any) => !currentMemberIds.includes(member._id)
      );
      setInitialMembers(
        nonGroupMembers.map((member: any) => ({
          id: member._id,
          name: member.name,
          email: member.email,
          avatar: member.avatarUrl || 'https://i.pravatar.cc/150?img=1'
        }))
      );
    };

    loadMembers();
  };
  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/group/single/${currentPath}`);
      setGroupDetails(response?.data?.data);
      setError(null);
      if (response?.status !== 200) {
        throw new Error('Failed to fetch group details');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);
  // message receive start

  useEffect(() => {
    // Connect the socket and join the room only once or when the currentPath changes
    if (!socket) {
      socket = io(ENDPOINT);
      socket.emit('setup', user);
      socket.on('connected', () => setSocketConnected(true));
      socket.on('stop typing', (typer) => {
        const room = typer?.room;
        const roomuser = typer?.user;
        if (currentPath === room && roomuser !== user?._id) {
          setTyping(false);
        }
      });
      socket.on('typing', (typer) => {
        const room = typer?.room;
        const roomuser = typer?.user;
        if (currentPath === room && roomuser !== user?._id) {
          setTyping(true);
        }
        const lastTypingTime = new Date().getTime();
        const timerLength = 3000;
        setTimeout(() => {
          const timeNow = new Date().getTime();
          const timeDiff = timeNow - lastTypingTime;
          if (timeDiff >= timerLength && typing) {
            const typer = {
              room: currentPath,
              user: user?._id
            };
            socket.emit('stop typing', typer);
            setTyping(false);
          }
        }, timerLength);
      });
    }

    // Emit join chat when the path changes
    if (currentPath) {
      socket.emit('join chat', currentPath);
    }

    // Cleanup function to leave the chat when the component unmounts or path changes
    return () => {
      if (currentPath) {
        socket.emit('leave chat', currentPath);
      }
    };
  }, [user, currentPath]);
  // Utility function to append a new comment to the comments state
  // Function to update the last read message
  const updateLastReadMessage = async (groupId, userId, messageId) => {
    try {
      const body = {
        groupId,
        userId,
        messageId
      };
      const response = await axiosInstance.post(
        `/group/updatereadmessage`,
        body
      );
    } catch (error) {
      console.error('Error updating last read message:', error);
    }
  };

  // Append a new comment and update the last read message
  const appendComment = (newComment) => {
    const newWork = async () => {
      await setComments((prevComments) => {
        // Check if a comment with the same `_id` already exists
        if (!prevComments.some((comment) => comment._id === newComment._id)) {
          // Update the last read message
          updateLastReadMessage(newComment.taskId, user?._id, newComment._id);
          return [...prevComments, newComment];
        }
        return prevComments; // Return the current state if duplicate is found
      });
    };
    try {
      newWork();
    } catch (error) {
      console.error(error);
    } finally {
      goDown();
    }
  };

  // Fetch comments and update the last read message for the latest one
  const fetchComments = useCallback(
    async (pageNumber, limit) => {
      try {
        const response = await axiosInstance.get(
          `/groupMessage/${currentPath}`,
          {
            params: {
              page: pageNumber,
              limit: limit
            }
          }
        );
        const fetchedComments = response.data.data;
        setComments((prevComments) => {
          const newComments = fetchedComments.filter(
            (newComment) =>
              !prevComments.some((comment) => comment._id === newComment._id)
          );
          if (newComments.length === 0 && pageNumber !== 1) {
            toast(`all messages already fetched`);
          }
          return [...newComments, ...prevComments];
        });

        if (pageNumber === 1) {
          goDown();
        }

        // Update the last read message if there are any comments
        if (fetchedComments.length > 0 && pageNumber === 1) {
          const lastComment = fetchedComments[fetchedComments.length - 1];
          updateLastReadMessage(currentPath, user?._id, lastComment._id);
        }
        return fetchedComments;
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error(`error occured!`, {
          description: `Message: ${error?.response?.data?.message}`
        });
      }
    },
    [currentPath]
  );

  const calculateScrollPosition = () => {
    if (commentsEndRef.current) {
      return (
        commentsEndRef.current.scrollHeight - commentsEndRef.current.scrollTop
      );
    }
    return 0;
  };

  const applyScrollPosition = (scrollPosition) => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollTop =
        commentsEndRef.current.scrollHeight - scrollPosition;
    }
  };
  const loadMoreComments = async () => {
    // event.preventDefault();
    const scrollPosition = calculateScrollPosition();

    const newPageNumber = pageNumber + 1;
    const newComments = await fetchComments(newPageNumber, limit);

    if (newComments?.length > 0) {
      // Append new comments to the existing state
      setPageNumber(newPageNumber);

      // Wait for the DOM to update, then apply the scroll position
      setTimeout(() => {
        applyScrollPosition(scrollPosition);
      }, 0);
    }
  };

  // const remainingMessages = groupDetails?.messageCount;
  // calculate the remaining messages based on the page number and limit

  const remainingMessages = groupDetails?.messageCount - comments.length;

  useEffect(() => {
    fetchComments(pageNumber, limit);
  }, []);

  useEffect(() => {
    const messageReceivedHandler = (newMessageReceived) => {
      const response = newMessageReceived?.data?.data;
      const newComment = {
        authorId: {
          _id: response?.authorId,
          name: response?.authorName
        },
        content: response?.content,
        isFile: response?.isFile,
        taskId: response?.taskId,
        createdAt: response?.createdAt,
        _id: response?._id || Math.random().toString(36).substring(7)
      };

      if (currentPath !== newComment?.taskId) {
        toast(`Group: ${response?.taskName || 'new message arrived'}`, {
          description: `Message: ${response?.content}`,
          action: {
            label: 'View',
            onClick: () => {
              router.push(`/dashboard/group/${newComment?.taskId}`);
            }
          }
        });
      } else {
        appendComment(newComment);
      }
    };

    socket.on('message received', messageReceivedHandler);

    return () => {
      socket.off('message received', messageReceivedHandler);
    };
  }, [currentPath, router]);

  const handleCommentSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true); // Set submission flag

    if (!data.content) {
      console.error(data, 'Content is required to submit a comment.');
      return;
    }
    try {
      // setIsLoading(true);
      const typer = {
        room: currentPath,
        user: user?._id
      };
      socket.emit('stop typing', typer);
      data.taskId = currentPath;
      data.authorId = user?._id;
      const response = await axiosInstance.post(`/groupMessage`, data);
      if (response.data.success) {
        const newComment = {
          authorId: {
            _id: user?._id,
            name: user?.name
          },
          content: data?.content,
          isFile: data?.isFile,
          taskId: currentPath,
          createdAt: response?.data?.data?.createdAt,
          _id:
            response?.data?.data?._id || Math.random().toString(36).substring(7) // math random is temporary
        };
        socket.emit('new message', response);
        appendComment(newComment); // Use the new utility function

        reset();
      } else {
        console.error('Failed to add comment:', response.data.message);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(`error occured!`, {
        description: `Message: ${error?.response?.data?.message}`
      });
      const typer = {
        room: currentPath,
        user: user?._id
      };
      socket.emit('stop typing', typer);
    } finally {
      setIsSubmitting(false); // Reset submission flag
    }
  };

  const handleGroupDescriptionUpdate = async (e) => {
    e.preventDefault();
    const name = e.target.groupName.value;
    const groupDescription = e.target.groupDescription.value;
    const isActive = e.target.isActive.checked;

    const data = {
      groupName: name,
      description: groupDescription,
      status: isActive ? 'archived' : 'active'
    };

    try {
      const response = await axiosInstance.patch(
        `/group/single/${currentPath}`,
        data
      );
      if (response.data.success) {
        toast(`Success!`, {
          description: `Message: ${response?.data?.message}`
        });
      }
      fetchGroupDetails();
    } catch (error) {
      console.error(error);
      toast(`err: something went wrong`, {
        description: `Message: ${error?.response?.data?.message || error?.message}`
      });
    } finally {
      setIsSettingsOpen(false);
    }
  };

  const handleAddMember = async () => {
    const member = initialMembers.find((m) => m.id === selectedMember2);
    const data = {
      groupId: currentPath,
      userId: member?.id
    };
    try {
      const response = await axiosInstance.post(`/group/addmember`, data);
      if (response.data.success) {
        toast(`Success!`, {
          description: `Message: ${response?.data?.message}`
        });
      }
      fetchGroupDetails();
    } catch (error) {
      console.error(error);
      toast(`err: something went wrong`, {
        description: `Message: ${error?.response?.data?.message || error?.message}`
      });
    }
  };

  const handleRemoveMember = async (id: string) => {
    const data = {
      groupId: currentPath,
      userId: id
    };
    try {
      const response = await axiosInstance.post(`/group/removemember`, data);
      if (response.data.success) {
        toast(`Success!`, {
          description: `Message: ${response?.data?.message}`
        });
      }
      fetchGroupDetails();
      if (id === user?._id) {
        toast(`you left the chat`);
        router.push('/dashboard/group');
      }
    } catch (error) {
      console.error(error);
      toast(`err: something went wrong`, {
        description: `Message: ${error?.response?.data?.message || error?.message}`
      });
    }
  };
  const handleChangeRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const data = {
      groupId: currentPath,
      userId: id,
      role: newRole
    };
    try {
      const response = await axiosInstance.post(`/group/updateuserrole`, data);
      if (response.data.success) {
        toast(`Success!`, {
          description: `Message: ${response?.data?.message}`
        });
      }
      fetchGroupDetails();
      if (id === user?._id) {
        toast(`you role has been changed`);
      }
    } catch (error) {
      console.error(error);
      toast(`err: something went wrong`, {
        description: `Message: ${error?.response?.data?.message || error?.message}`
      });
    }
  };
  // useEffect with a trigger
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

    // Add the event listener
    ctxProvider.addEventListener('change', handleChangeEvent);

    // Cleanup function to remove the event listener
    return () => {
      ctxProvider.removeEventListener('change', handleChangeEvent);
    };
  }, [ctxProviderRef.current]); // Removed files as a dependency

  // Add a trigger to watch file updates
  useEffect(() => {
    if (files.length === 0) {
      // Perform any action here if needed after files are reset
    }
  }, [files]);

  // Function to handle file submission
  const handleFileSubmit = async () => {
    if (files.length === 0) return;

    // Iterate through files and submit each
    for (const file of files) {
      const stringyFiedContent = JSON.stringify(file?.fileInfo);
      const data = {
        content: stringyFiedContent,
        taskId: currentPath,
        authorId: user?._id,
        isFile: true
      };
      await handleCommentSubmit(data);
    }

    // Access the ctxProvider reference
    // const ctxProvider = ctxProviderRef.current;

    // if (ctxProvider) {
    //   // Clear the file collection in ctxProvider if available
    //   if (typeof ctxProvider.clearFiles === 'function') {
    //     ctxProvider.clearFiles();
    //   } else {
    //     console.warn('ctxProvider.clearFiles() method is not available.');
    //   }
    // }

    // Clear the files array
    setFiles([]); // This will trigger the useEffect that watches `files`
  };

  // const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setAttachedFile(file);
  //   }
  // };
  const typingHandler = () => {
    if (!socketConnected) return;
    if (!typing) {
      // setTyping(true);
      const typer = {
        room: currentPath,
        user: user?._id
      };
      socket.emit('typing', typer);
    }
    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        const typer = {
          room: currentPath,
          user: user?._id
        };
        socket.emit('stop typing', typer);
        // setTyping(false);
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
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [isAccessible, isIsAccessible] = useState(true);
  useEffect(() => {
    if (groupDetails?.members) {
      const currentUser = groupDetails?.members.find(
        (member) => member._id === user?._id
      );
      if (currentUser?.role === 'admin') {
        setIsCurrentUserAdmin(true);
      }
    }
  }, [groupDetails?.members, user?._id]);
  useEffect(() => {
    if (groupDetails?.members) {
      const currentUser = groupDetails?.members.find(
        (member) => member._id === user?._id
      );
      if (currentUser?.role !== 'admin' && groupDetails?.status !== 'active') {
        isIsAccessible(false);
      }
    }
  }, [groupDetails?.members, groupDetails?.status, user?._id]);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSideGroupVisible, setIsSideGroupVisible] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the button, act like ArrowLeft (hide the sidebar)
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsSidebarVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="mx-auto flex h-full max-w-full  ">
      {/* Sidebar with group members */}
      <Button
        variant="default"
        size="icon"
        className="fixed  left-4 top-16 z-50 rounded-full md:hidden"
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        ref={buttonRef}
      >
        {isSidebarVisible ? (
          <ArrowLeft className="h-6 w-6 " />
        ) : (
          <ArrowRight className="h-6 w-6 " />
        )}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed z-20 w-80 space-y-3 rounded-md bg-white p-4  transition-transform duration-300 ease-in-out max-md:border md:relative', // Sidebar base styles
          isSidebarVisible ? 'block' : 'hidden', // Control visibility on small screens
          'md:block'
        )}
        // style={{ display: isSideGroupVisible ?   "hidden": "block" }}
      >
        {/* Sidebar content */}
        <div className="flex w-full items-start justify-between gap-2">
          <h2 className="text-lg font-bold">
            {groupName.substring(0, 15)}
            {groupName.length > 15 && '...'}
          </h2>
          <div>
            {groupDetails?.members?.map((member) => {
              if (member._id === user?._id && isCurrentUserAdmin) {
                return (
                  <Button
                    onClick={() => setIsSettingsOpen(true)}
                    variant={'secondary'}
                    size={'sm'}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                );
              }
            })}
          </div>
        </div>
        <div className="flex flex-row items-end justify-between">
          <h3 className="font-semibold">Group Members</h3>
          <div className="flex items-center justify-between gap-2">
            <Button
              variant={'outline'}
              size={'sm'}
              className=""
              onClick={handleMemberDialog}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="xs:h-[calc(100%-10rem)] h-[calc(100%-11rem)] sm:h-[calc(100%-8rem)]">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="text-red-500">Failed to load members: {error}</div>
          ) : (
            groupDetails?.members?.map((member) => (
              <div
                key={member?._id}
                className="border-s- mb-3 flex items-center justify-between space-x-2 border-b border-gray-300"
              >
                <div className="mb-1 ml-1 flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {member?.name
                        ?.split(' ')
                        ?.map((n) => n[0])
                        ?.join('') || 'User'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm">{member.name}</span>
                    {groupDetails?.creator === member?._id ? (
                      <span
                        className={`${member?.role === 'admin' && 'w-fit max-w-prose bg-purple-600 px-1 text-white'} text-[9px]`}
                      >
                        owner
                      </span>
                    ) : (
                      <span
                        className={`${member?.role === 'admin' && 'w-fit max-w-prose bg-red-600 px-1 text-white'} text-[9px]`}
                      >
                        {member.role}
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  {isCurrentUserAdmin && (
                    <DropdownMenuTrigger>
                      <Button
                        className={`${groupDetails?.creator === member?._id ? 'hidden' : ''}`}
                        variant={'ghost'}
                        size={'icon'}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  )}
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <>
                      <DropdownMenuItem
                        onClick={() =>
                          handleChangeRole(member?._id, member?.role)
                        }
                      >
                        Make {member.role === 'admin' ? 'member' : 'admin'}
                      </DropdownMenuItem>
                      {member?.role !== 'admin' && (
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member._id)}
                          className="flex justify-between"
                        >
                          <span>Remove</span>
                          <UserMinus className="h-4 w-4" />
                        </DropdownMenuItem>
                      )}
                    </>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </ScrollArea>
        <div className="flex flex-row gap-2">
          <Button
            variant="default"
            className="w-full text-gray-700"
            size="sm"
            onClick={() => router.push('/dashboard/group')}
          >
            Return
          </Button>
        </div>
      </div>

      {/* Main chat area */}
      {/* Chat messages */}
      <div className="flex w-full flex-1  flex-col ">
        <div ref={commentsEndRef} className="flex-grow overflow-y-auto">
          <div className="flex w-full justify-center ">
            {remainingMessages >= limit && (
              <Button
                onClick={loadMoreComments}
                variant={'link'}
                className="flex flex-row justify-center gap-2 text-blue-600"
              >
                Load more
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="p-4">
            {comments.map((comment: any) => {
              const isFile = comment.isFile;
              let parsedContent = comment.content;

              // Parse file content if the message contains a file
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
                  className={`mb-4 flex w-full flex-row ${
                    comment.authorId._id === user?._id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div className="flex flex-col items-end justify-end">
                    <div
                      className={`inline-block max-w-prose ${
                        comment.authorId._id === user?._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200'
                      } rounded-lg p-3`}
                      style={{
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'break-word'
                      }}
                    >
                      {/* Header Section: Avatar and Name */}
                      <div className="mb-1 flex items-center space-x-2">
                        {/* <Avatar className="h-6 w-6 ">
                        <AvatarFallback
                          className="text-[8px]"
                          style={{
                            backgroundColor:
                              groupMembers.find(
                                (m) => m.name === comment?.authorId?.name
                              )?.color || 'gray'
                          }}
                        >
                          {comment?.authorId.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('') || 'U'}
                        </AvatarFallback>
                      </Avatar> */}
                        <span
                          className="md:text-md text-xs md:font-semibold"
                          style={{
                            color: groupMembers.find(
                              (m) => m.name === comment.sender
                            )?.color
                          }}
                        >
                          {comment?.authorId?.name}
                        </span>
                      </div>

                      {/* Message Content Section */}
                      <div className="max-w-full">
                        {isFile ? (
                          <div
                            className={`flex items-center space-x-2 rounded-lg p-2 ${
                              comment.authorId._id === user?._id
                                ? 'bg-blue-500/15'
                                : 'bg-gray-200/15'
                            }`}
                          >
                            {/* Display File (Image or Non-Image) */}
                            {parsedContent.mimeType?.startsWith('image/') ? (
                              <div className="flex items-end space-x-2">
                                <img
                                  src={parsedContent.cdnUrl}
                                  alt={
                                    parsedContent.originalFilename || 'Preview'
                                  }
                                  className="max-h-32 max-w-full rounded shadow-sm"
                                />
                                <a
                                  href={parsedContent.cdnUrl}
                                  download={parsedContent.originalFilename}
                                  className="justify-between text-gray-900  hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ArrowUpRightFromSquare className="h-5 w-5" />
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between space-x-2">
                                <span>
                                  {parsedContent.originalFilename || 'File'}
                                </span>
                                <a
                                  href={parsedContent.cdnUrl}
                                  download={parsedContent.originalFilename}
                                  className="text-gray-900 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <DownloadIcon className="h-5 w-5" />
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
                    </div>
                    <div className="flex w-full flex-row-reverse items-center justify-between py-1">
                      <span className="text-xs opacity-70">
                        {new Date(comment?.createdAt).toLocaleDateString() ===
                        new Date().toLocaleDateString()
                          ? new Date(comment?.createdAt).toLocaleTimeString()
                          : new Date(comment?.createdAt).toLocaleDateString()}
                      </span>

                      <span className="text-xs opacity-70">
                        <p>Seen</p>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message input */}
        {typing && (
          <div className="relative bottom-2 flex h-[5px] items-center space-x-2 pl-3 text-[10px]">
            <span>Typing</span>
            <div className="h-1 w-1 animate-ping rounded-full bg-gray-400"></div>
            <div className="h-1 w-1 animate-ping rounded-full bg-gray-400"></div>
            <div className="h-1 w-1 animate-ping rounded-full bg-gray-400"></div>
          </div>
        )}
        <div className="border-t border-gray-300 p-4">
          {isAccessible && (
            <form
              onSubmit={handleSubmit(handleCommentSubmit)}
              className="flex flex-col space-y-2"
            >
              {attachedFile && (
                <div className="flex items-center space-x-2 rounded bg-gray-100 p-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm">{attachedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAttachedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex space-x-2">
                <Textarea
                  id="comment"
                  {...register('content', { required: true })}
                  placeholder="Type your comment here..."
                  rows={1}
                  className="flex-1 resize-none"
                  onKeyDown={handleKeyDown}
                />
                <div className="flex max-w-full flex-col-reverse items-center gap-1">
                  {/* <uc-config
                    ctx-name="my-uploader-3"
                    pubkey="48a797785d228ebb9033"
                    sourceList="local, url, camera, dropbox"
                    multiple="false"
                  ></uc-config>

                  <uc-file-uploader-regular
                    class="uc-light"
                    ctx-name="my-uploader-3"
                  ></uc-file-uploader-regular>

                  <uc-upload-ctx-provider
                    ctx-name="my-uploader-3"
                    ref={ctxProviderRef}
                  ></uc-upload-ctx-provider> */}

                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() => setIsImageUploaderOpen(true)}
                  >
                    <Paperclip className="mr-2 h-4 w-4" /> Upload
                  </Button>

                  {files.length > 0 ? (
                    <Button
                      className="w-full"
                      type="button"
                      variant="outline"
                      size="default"
                      // onClick={() => fileInputRef.current?.click()}
                      onClick={handleFileSubmit}
                    ></Button>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      <Send className=" h-4 w-4" />
                      Send
                    </Button>
                  )}
                </div>
              </div>
            </form>
          )}
          <ImageUploader
            open={isImageUploaderOpen}
            onOpenChange={setIsImageUploaderOpen}
            multiple={false}
            onUploadComplete={(uploadedFiles) => {
              console.log('Uploaded files:', uploadedFiles);
              setFiles(uploadedFiles);
            }}
            className="uc-light"
          />
        </div>
      </div>
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Member</Label>
              <Input
                placeholder="Search User"
                className="mb-2"
                value={searchQuery} // Bind the input value to searchQuery state
                onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery on input change
              />
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="mb-2 flex items-center space-x-2"
                    >
                      <input
                        type="radio"
                        id={`member-${member.id}`}
                        name="member-selection" // Ensure only one selection is possible
                        checked={selectedMember2 === member.id} // Check if this member is selected
                        onChange={() => setSelectedMember2(member.id)} // Set selected member on change
                      />
                      <Label
                        htmlFor={`member-${member.id}`}
                        className="flex items-center space-x-2"
                      >
                        <Avatar className="inline-block">
                          <AvatarFallback>
                            {member?.name
                              ?.split(' ')
                              ?.map((n) => n[0])
                              ?.join('') || 'User'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No members found.</p>
                )}
              </ScrollArea>
            </div>
          </div>
          {selectedMember2 !== null && (
            <DialogFooter>
              {/* clear selected member */}
              <Button
                variant="default"
                onClick={() => setSelectedMember2(null)}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleAddMember();
                  setIsAddMemberOpen(false);
                }}
              >
                {' '}
                Add Member
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Group Info</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGroupDescriptionUpdate}>
            <div className="space-t-4">
              <div>
                <Label>Select Member</Label>
                <Input
                  placeholder="Group Name"
                  className="mb-2"
                  name="groupName"
                  required
                  defaultValue={groupDetails?.groupName}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Group Description"
                  className="mb-2"
                  name="groupDescription"
                  defaultValue={groupDetails?.description}
                />
              </div>
              <div className="mt-3 flex flex-row items-center justify-center gap-3">
                <Label>Admin Only Message</Label>
                <Input
                  className="h-5 w-5"
                  name="isActive"
                  type="checkbox"
                  defaultChecked={groupDetails?.status !== 'active'}
                />
              </div>
            </div>
            <DialogFooter>
              {/* clear selected member */}
              <Button
                variant="outline"
                type="submit"
                onClick={() => {
                  setIsAddMemberOpen(false);
                }}
              >
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
