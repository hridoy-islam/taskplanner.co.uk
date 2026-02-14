'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { io } from 'socket.io-client';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
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
import { RightSidebar } from './components/RightSidebar';

const ENDPOINT = axiosInstance.defaults.baseURL.slice(0, -4);
let socket, selectedChatCompare;

export default function CompanyGroupChat() {
  const router = useRouter();
  const [socketConnected, setSocketConnected] = useState(false);
  const currentPath = router?.location?.pathname?.split('/')[3] || 'null';
  const { id, gid: groupId } = useParams();
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
  const [draggedFile, setDraggedFile] = useState<File | null>(null);

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
      const response = await axiosInstance.get(`/group/single/${groupId}`);
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
    if (!socket) {
      socket = io(ENDPOINT);
      socket.emit('setup', user);
      socket.on('connected', () => setSocketConnected(true));
      socket.on('stop typing', (typer) => {
        const room = typer?.room;
        const roomuser = typer?.user;
        if (id === room && roomuser !== user?._id) {
          setTyping(false);
        }
      });
      socket.on('typing', (typer) => {
        const room = typer?.room;
        const roomuser = typer?.user;
        if (id === room && roomuser !== user?._id) {
          setTyping(true);
        }
        const lastTypingTime = new Date().getTime();
        const timerLength = 3000;
        setTimeout(() => {
          const timeNow = new Date().getTime();
          const timeDiff = timeNow - lastTypingTime;
          if (timeDiff >= timerLength && typing) {
            const typer = {
              room: id,
              user: user?._id
            };
            socket.emit('stop typing', typer);
            setTyping(false);
          }
        }, timerLength);
      });
    }

    if (id) {
      socket.emit('join chat', id);
    }

    return () => {
      if (id) {
        socket.emit('leave chat', id);
      }
    };
  }, [user, id]);

  const updateLastReadMessage = async (groupId, userId, messageId) => {
    try {
      const body = {
        groupId,
        userId,
        messageId
      };
      await axiosInstance.post(`/group/updatereadmessage`, body);
    } catch (error) {
      console.error('Error updating last read message:', error);
    }
  };

  const appendComment = (newComment) => {
    const newWork = async () => {
      await setComments((prevComments) => {
        if (!prevComments.some((comment) => comment._id === newComment._id)) {
          updateLastReadMessage(groupId, user?._id, newComment._id);
          return [...prevComments, newComment];
        }
        return prevComments;
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
      const response = await axiosInstance.get(`/groupMessage/${groupId}`, {
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
          toast({ title: `all messages already fetched` });
        }
        return [...newComments, ...prevComments];
      });

      if (pageNumber === 1) {
        goDown();
      }

      if (fetchedComments.length > 0 && pageNumber === 1) {
        const lastComment = fetchedComments[fetchedComments.length - 1];
        updateLastReadMessage(groupId, user?._id, lastComment._id);
      }
      return fetchedComments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({ title: `error occured!`, variant: 'destructive' });
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
      setPageNumber(newPageNumber);
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

      if (id !== newComment?.taskId) {
        toast({
          title: `Group: ${response?.taskName || 'New message arrived'}`,
          description: `Message: ${response?.content}`
        });
      } else {
        appendComment(newComment);
      }
    };

    socket.on('message received', messageReceivedHandler);

    return () => {
      socket.off('message received', messageReceivedHandler);
    };
  }, [id, router]);

const handleCommentSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!data.content) {
      setIsSubmitting(false);
      return;
    }

    // 1. DYNAMICALLY RECALCULATE MENTIONS
    // This runs for both new messages and edits. It only keeps users who are STILL mentioned in the text.
    const mentionedIds: string[] = [];
    groupDetails?.members?.forEach((member: any) => {
      if (member._id !== user?._id && data.content.includes(`@${member.name}`)) {
        mentionedIds.push(member._id);
      }
    });
    data.mentionBy = mentionedIds;

    try {
      const typer = {
        room: id,
        user: user?._id
      };
      socket.emit('stop typing', typer);

      if (editingMessage) {
        // --- EDIT MESSAGE LOGIC ---
        const response = await axiosInstance.patch(`/groupMessage/${editingMessage.id}`, {
          content: data.content,
          mentionBy: mentionedIds // Sends the newly calculated mentions (overwrites old ones)
        });

        if (response.data.success) {
          // Get the full member objects for the UI
          const updatedMentionObjects = groupDetails?.members?.filter((m: any) => 
            mentionedIds.includes(m._id)
          );

          setComments(
            comments.map((comment) =>
              comment._id === editingMessage.id 
                ? { ...comment, content: data.content, mentionBy: updatedMentionObjects } 
                : comment
            )
          );
          setEditingMessage(null);
          toast({ title: 'Message updated successfully' });
        }
      } else {
        // --- NEW MESSAGE LOGIC ---
        data.taskId = groupId;
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
            taskId: id,
            mentionBy: mentionedIds,
            createdAt: response?.data?.data?.createdAt,
            _id: response?.data?.data?._id || Math.random().toString(36).substring(7)
          };
          socket.emit('new message', response);
          appendComment(newComment);
        }
      }
      
      // Force the input to empty out completely
      setValue("content", "");
      reset({ content: "" });
      
    } catch (error) {
      console.error('Error posting comment:', error);
      socket.emit('stop typing', { room: groupId, user: user?._id });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setValue("content", "");
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
      const response = await axiosInstance.patch(`/group/single/${groupId}`, data);
      fetchGroupDetails();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSettingsOpen(false);
    }
  };

const handleAddMember = async () => {
  // Ensure selectedMember2 is treated as an array
  const selectedIds = Array.isArray(selectedMember2) ? selectedMember2 : [selectedMember2];

  try {
    // Map over all selected user IDs and create an API request for each one
    const addRequests = selectedIds.map((userId) => {
      return axiosInstance.post(`/group/addmember`, {
        groupId: groupId,
        userId: userId // The ID is directly taken from the array
      });
    });

    // Wait for all the API calls to finish successfully
    await Promise.all(addRequests);
    
    // Refresh your group details
    fetchGroupDetails();
  } catch (error) {
    console.error("Failed to add members:", error);
  }
};

  const handleRemoveMember = async (id: string) => {
    const data = {
      groupId: groupId,
      userId: id
    };
    try {
      const response = await axiosInstance.post(`/group/removemember`, data);
      fetchGroupDetails();
      if (id === user?._id) {
        toast({ title: `you left the chat` });
        router.push('/dashboard/group');
      }
    } catch (error) {
      console.error(error);
      toast({ title: `something went wrong` });
    }
  };

  const handleChangeRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const data = {
      groupId: groupId,
      userId: id,
      role: newRole
    };
    try {
      await axiosInstance.post(`/group/updateuserrole`, data);
      fetchGroupDetails();
      if (id === user?._id) {
        toast({ title: `you role has been changed` });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileSubmit = async () => {
    if (files.length === 0) return;

    for (const file of files) {
      const stringyFiedContent = JSON.stringify(file?.fileInfo);
      const data = {
        content: stringyFiedContent,
        taskId: groupId,
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
        room: groupId,
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
          room: groupId,
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

  // Auto-upload file function
  const autoUploadFile = async (file: File) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('entityId', groupId);
    formData.append('file_type', 'groupDoc');
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/documents', formData);

      if (response.data) {
        const fileUrl =
          response.data?.data?.fileUrl || response.data?.url || response.data?.data?.url;

        await handleCommentSubmit({
          content: fileUrl,
          isFile: true
        });
        toast({ title: 'File uploaded successfully' });
        setDraggedFile(null);
      }
    } catch (error) {
      console.error('Auto-upload failed', error);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendDraggedFile = () => {
    if (draggedFile) {
      autoUploadFile(draggedFile);
    }
  };

  const handleRemoveDraggedFile = () => {
    setDraggedFile(null);
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
    <div className="relative mx-auto flex h-full max-w-full">
      {/* 70% Main chat area */}
      <div className="flex w-[70%] flex-col">
        <GroupBar
          groupDetails={groupDetails}
          loading={loading}
          error={error}
          user={user}
          router={router}
        />

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
          handleEditSubmit={handleCommentSubmit}
          draggedFile={draggedFile}
          setDraggedFile={setDraggedFile}
          handleSendDraggedFile={handleSendDraggedFile}
          handleRemoveDraggedFile={handleRemoveDraggedFile}
          toast={toast}
          user={user}
        />
      </div>

      {/* 30% Right Sidebar */}
      <div className="hidden w-[30%] border-l border-gray-200 md:block">
        <RightSidebar
          groupDetails={groupDetails}
          user={user}
          isCurrentUserAdmin={isCurrentUserAdmin}
          handleMemberDialog={handleMemberDialog}
          handleRemoveMember={handleRemoveMember}
          handleChangeRole={handleChangeRole}
          setUploadOpen={setUploadOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          comments={comments}
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