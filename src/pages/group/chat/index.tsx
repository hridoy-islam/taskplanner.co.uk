'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { io } from 'socket.io-client';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from '@/routes/hooks';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';

import { useForm } from 'react-hook-form';

import { GroupSidebar } from './components/group-sidebar';
import { MessageList } from './components/message-list';
import { MessageInput } from './components/message-input';
import { AddMemberDialog } from './components/add-member-dialog';
import { GroupSettingsDialog } from './components/group-settings-dialog';
import { ImageUploader } from './components/image-uploader';
import { FileUploader } from './components/file-uploader';
import GroupBar from './components/group-bar';

const ENDPOINT = axiosInstance.defaults.baseURL.slice(0, -4);
let socket, selectedChatCompare;

export default function GroupChat() {
  const router = useRouter();
  const [socketConnected, setSocketConnected] = useState(false);
  const currentPath = router?.location?.pathname?.split('/')[3] || 'null';
  const { id: groupId } = useParams<{ groupId: string }>();
  const [groupDetails, setGroupDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, setValue } = useForm();
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const limit = 50;
  const [initialMembers, setInitialMembers] = useState<any[]>([]);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember2, setSelectedMember2] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buttonRef = useRef(null);

  const { user } = useSelector((state: any) => state.auth);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [isAccessible, setIsAccessible] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSideGroupVisible, setIsSideGroupVisible] = useState(false);
  const { toast } = useToast();

  const goDown = () => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollTop = commentsEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    goDown();
  }, [comments.length]);

  const filteredMembers = initialMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleUploadComplete = (data) => {
    setUploadOpen(false);
    fetchGroupDetails();
  };

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

  const fetchComments = async (pageNumber, limit) => {
    try {
      const response = await axiosInstance.get(`/groupMessage/${currentPath}`, {
        params: {
          page: pageNumber,
          limit: limit
        }
      });
      const fetchedComments = response.data.data;
      setComments((prevComments) => {
        const newComments = fetchedComments.filter(
          (newComment) =>
            !prevComments.some((comment) => comment._id === newComment._id)
        );
        if (newComments.length === 0 && pageNumber !== 1) {
          toast({title:`all messages already fetched`});
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
      toast({title:`error occured!`, variant:'destructive', 
      });
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

  const applyScrollPosition = (scrollPosition) => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollTop =
        commentsEndRef.current.scrollHeight - scrollPosition;
    }
  };

  const loadMoreComments = async () => {
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

  const remainingMessages = groupDetails?.messageCount - comments.length;

  useEffect(() => {
    fetchComments(pageNumber, limit);
  }, []);

  useEffect(() => {
    const messageReceivedHandler = (newMessageReceived) => {
      const response = newMessageReceived?.data?.data;

      console.log(response)
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
        toast({
          title: `Group: ${response?.taskName || 'New message arrived'}`,
          description: `Message: ${response?.content}`,
          
          
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
    if (isSubmitting) return
    setIsSubmitting(true) // Set submission flag

    if (!data.content) {
      console.error(data, "Content is required to submit a comment.")
      setIsSubmitting(false)
      return
    }

    try {
      const typer = {
        room: currentPath,
        user: user?._id,
      }
      socket.emit("stop typing", typer)

      // If we're editing a message, update it instead of creating a new one
      if (editingMessage) {
        const response = await axiosInstance.patch(`/groupMessage/${editingMessage.id}`, {
          content: data.content,
        })

        if (response.data.success) {
          // Update the message in the comments array
          setComments(
            comments.map((comment) =>
              comment._id === editingMessage.id ? { ...comment, content: data.content } : comment,
            ),
          )

          // Clear editing state
          setEditingMessage(null)
          toast({title:"Message updated successfully"})
        }
      } else {
        // Create a new message
        data.taskId = currentPath
        data.authorId = user?._id
        const response = await axiosInstance.post(`/groupMessage`, data)

        if (response.data.success) {
          const newComment = {
            authorId: {
              _id: user?._id,
              name: user?.name,
            },
            content: data?.content,
            isFile: data?.isFile,
            taskId: currentPath,
            createdAt: response?.data?.data?.createdAt,
            _id: response?.data?.data?._id || Math.random().toString(36).substring(7), // math random is temporary
          }
          socket.emit("new message", response)
          appendComment(newComment) // Use the new utility function
        } else {
          console.error("Failed to add comment:", response.data.message)
        }
      }

      reset()
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({title:`error occured!`
      })
      const typer = {
        room: currentPath,
        user: user?._id,
      }
      socket.emit("stop typing", typer)
    } finally {
      setIsSubmitting(false) // Reset submission flag
    }
  }

  // const handleCommentSubmit = async (data) => {
  //   if (isSubmitting) return;
  //   setIsSubmitting(true);

  //   // Validate content
  //   if (!data.content && (!data.isFile || !files.length)) {
  //     console.error('Content or file is required to submit a message.');
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   try {
  //     const typer = {
  //       room: currentPath,
  //       user: user?._id
  //     };
  //     socket.emit('stop typing', typer);

  //     if (editingMessage?.id) {
  //       // Handle message update
  //       const response = await axiosInstance.patch(
  //         `/groupMessage/${editingMessage.id}`,
  //         {
  //           content: data.content
  //         }
  //       );

  //       if (response.data.success) {
  //         // Update the message in state
  //         setComments((prevComments) =>
  //           prevComments.map((comment) =>
  //             comment._id === editingMessage.id
  //               ? {
  //                   ...comment,
  //                   content: data.content,
  //                   updatedAt: new Date().toISOString()
  //                 }
  //               : comment
  //           )
  //         );

  //         // Clear editing state
  //         setEditingMessage(null);
  //         reset(); // Reset the form
  //         toast.success('Message updated successfully');
  //       } else {
  //         throw new Error(response.data.message || 'Failed to update message');
  //       }
  //     } else {
  //       // Handle new message creation
  //       const payload = {
  //         ...data,
  //         taskId: currentPath,
  //         authorId: user?._id,
  //         groupId: groupId // Added groupId if needed
  //       };

  //       const response = await axiosInstance.post(`/groupMessage`, payload);

  //       if (response.data.success) {
  //         const newComment = {
  //           ...response.data.data,
  //           authorId: {
  //             _id: user?._id,
  //             name: user?.name
  //           },
  //           content: data?.content,
  //           isFile: data?.isFile,
  //           taskId: currentPath,
  //           createdAt: response?.data?.data?.createdAt,
  //           _id:
  //             response?.data?.data?._id ||
  //             Math.random().toString(36).substring(7) // math random is temporary
  //         };

  //         // Emit socket event and update state
  //         socket.emit('new message', {
  //           message: newComment,
  //           room: currentPath
  //         });

  //         // Update comments state
  //         setComments((prevComments) => [...prevComments, newComment]);
  //         reset(); 

  //         commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //       } else {
  //         throw new Error(response.data.message || 'Failed to send message');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error processing message:', error);
  //     toast.error(
  //       error?.response?.data?.message ||
  //         'An error occurred while processing your message'
  //     );

  //     // Re-enable the form if editing
  //     if (editingMessage?.id) {
  //       setValue('content', editingMessage.content);
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const cancelEdit = () => {
    setEditingMessage(null);
    reset({ content: '' });
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
       
      }
      fetchGroupDetails();
    } catch (error) {
      console.error(error);
     
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
     
      fetchGroupDetails();
    } catch (error) {
      console.error(error);
   
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
      
      }
      fetchGroupDetails();
      if (id === user?._id) {
        toast({title:`you left the chat`});
        router.push('/dashboard/group');
      }
    } catch (error) {
      console.error(error);
      toast({title:`something went wrong`
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
      
      fetchGroupDetails();
      if (id === user?._id) {
        toast({title:`you role has been changed`});
      }
    } catch (error) {
      console.error(error);
      
    }
  };

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

    setFiles([]);
  };

  const typingHandler = () => {
    if (!socketConnected) return;
    if (!typing) {
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
        setIsAccessible(false);
      }
    }
  }, [groupDetails?.members, groupDetails?.status, user?._id]);
  return (
    <div className="mx-auto flex h-full max-w-full">
      {/* Toggle sidebar button for mobile */}
      {/* <Button
        variant="default"
        size="icon"
        className="fixed left-4 top-16 z-50 rounded-full md:hidden"
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        ref={buttonRef}
      >
        {isSidebarVisible ? (
          <ArrowLeft className="h-6 w-6" />
        ) : (
          <ArrowRight className="h-6 w-6" />
        )}
      </Button> */}

      {/* Sidebar */}
      {/* <GroupSidebar
        isSidebarVisible={isSidebarVisible}
        groupDetails={groupDetails}
        loading={loading}
        error={error}
        user={user}
        isCurrentUserAdmin={isCurrentUserAdmin}
        handleMemberDialog={handleMemberDialog}
        handleRemoveMember={handleRemoveMember}
        handleChangeRole={handleChangeRole}
        setUploadOpen={setUploadOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        router={router}
      /> */}

      {/* Main chat area */}
      <div className="flex w-full flex-1 flex-col">
        <GroupBar
        groupDetails={groupDetails}
        loading={loading}
        error={error}
        user={user}
        isCurrentUserAdmin={isCurrentUserAdmin}
        handleMemberDialog={handleMemberDialog}
        handleRemoveMember={handleRemoveMember}
        handleChangeRole={handleChangeRole}
        setUploadOpen={setUploadOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        comments={comments}
        router={router}/>

        <MessageList
          commentsEndRef={commentsEndRef}
          remainingMessages={remainingMessages}
          loadMoreComments={loadMoreComments}
          comments={comments}
          user={user}
          groupDetails={groupDetails}
          limit={limit}
          setEditingMessage={setEditingMessage}
        />

        <MessageInput
          isAccessible={isAccessible}
          groupDetails={groupDetails}
          handleSubmit={handleSubmit}
          handleCommentSubmit={handleCommentSubmit}
          register={register}
          handleKeyDown={handleKeyDown}
          isSubmitting={isSubmitting}
          setIsImageUploaderOpen={setIsImageUploaderOpen}
          files={files}
          handleFileSubmit={handleFileSubmit}
          groupId={groupId}
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
          cancelEdit={cancelEdit}
          setValue={setValue}
        />
      </div>

      {/* Dialogs */}
      <AddMemberDialog
        isAddMemberOpen={isAddMemberOpen}
        setIsAddMemberOpen={setIsAddMemberOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredMembers={filteredMembers}
        selectedMember2={selectedMember2}
        setSelectedMember2={setSelectedMember2}
        handleAddMember={handleAddMember}
      />

      <GroupSettingsDialog
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        groupDetails={groupDetails}
        handleGroupDescriptionUpdate={handleGroupDescriptionUpdate}
      />

      <ImageUploader
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={handleUploadComplete}
        entityId={groupId}
      />

      <FileUploader
        open={isImageUploaderOpen}
        onOpenChange={setIsImageUploaderOpen}
        multiple={false}
        onUploadComplete={(uploadedFiles) => {
          handleCommentSubmit({
            content: uploadedFiles.data.fileUrl,
            isFile: true
          });
        }}
        entityId={groupId}
        className="uc-light"
      />
    </div>
  );
}
