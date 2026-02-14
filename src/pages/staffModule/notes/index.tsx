import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import 'react-quill/dist/quill.snow.css';
import TagManagementDialog from './components/tag-management-dialog';
import ShareDialog from './components/share-dialog';
import CreateNoteDialog from './components/create-note-dialog';
import NotesContent from './components/notes-contain';
import NotesSidebar from './components/notes-sidebar';
import moment from 'moment';
import UpdateNote from '@/components/shared/update-note';

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: any[];
  favorite: boolean;
  isArchive: boolean;
  sharedWith: string[];
  author: string | { _id: string; name: string; email?: string; role?: string };
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  _id: string;
  name: string;
  author: string;
}

export default function StaffNotesPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.users);

  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareRecipients, setShareRecipients] = useState<any[]>([]);
  const [isTagManagementOpen, setIsTagManagementOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sharedWith, setSharedWith] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('my-notes');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTagSubmitting, setIsTagSubmitting] = useState(false);

  // --- API Fetching & Polling ---
  const fetchNotesAndTags = useCallback(async () => {
    if (!user?._id) return;
    try {
      const [notesRes, sharedNotesRes, tagsRes] = await Promise.all([
        axiosInstance.get(`/notes/${user._id}`),
        axiosInstance.get(`/notes/sharednote/${user._id}`),
        axiosInstance.get(`/tags/user/${user._id}`)
      ]);

      // FIX: Access the deeply nested `result` array from the API response
      const fetchedNotes = notesRes.data?.data?.result || notesRes.data?.data || [];
      const fetchedSharedNotes = sharedNotesRes.data?.data?.result || sharedNotesRes.data?.data || [];
      
      // Merge unique notes to avoid duplicates if they overlap
      const allNotesMap = new Map();
      [...fetchedNotes, ...fetchedSharedNotes].forEach((note: Note) => {
        allNotesMap.set(note._id, note);
      });

      setNotes(Array.from(allNotesMap.values()));
      
      // Handle tags which may or may not be paginated the same way
      const fetchedTags = tagsRes.data?.data?.result || tagsRes.data?.data || [];
      setTags(fetchedTags);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchNotesAndTags();

    // Poll every 1 minute (60000 ms) for seamless updates
    const interval = setInterval(() => {
      fetchNotesAndTags();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNotesAndTags]);

  useEffect(() => {
    if (users && Array.isArray(users) && shareRecipients.length === 0) {
      setShareRecipients(users);
    }
  }, [users, shareRecipients]);

  const openUpdateModal = (note: Note) => {
    setSelectedNote(note);
    setOpenUpdate(true);
  };

  const closeUpdateModal = () => {
    setOpenUpdate(false);
  };

  const handleChange = (selectedOptions: any[]) => {
    setSharedWith(selectedOptions);
  };

  const userOptions = useMemo(() => {
    return (shareRecipients || []).map((u) => ({
      value: u?._id,
      label: `${u.name} (${u.email})`
    }));
  }, [shareRecipients]);

  const filteredTags = useMemo(() => {
    return tags.filter((tag) => {
      if (searchTerm) {
        return tag?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [tags, searchTerm]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note: Note) => {
        const authorId = typeof note?.author === 'string' ? note?.author : note?.author?._id;
        const currentUserId = user?._id;

        if (selectedTab === 'my-notes' && authorId !== currentUserId) return false;
        if (
          selectedTab === 'shared-notes' &&
          !note?.sharedWith?.some((userId: string) => userId === currentUserId)
        )
          return false;

        if (showFavorites && !note.favorite) return false;

        if (tagSearchTerm) {
          return note.tags?.some((tag: any) =>
            tag.name?.toLowerCase().includes(tagSearchTerm.toLowerCase())
          );
        }

        return (
          note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => moment(b.updatedAt).diff(moment(a.updatedAt)));
  }, [notes, user?._id, selectedTab, showFavorites, tagSearchTerm, searchTerm]);

  const filterSharedNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (!note?.sharedWith?.some((userId: string) => userId === user?._id)) return false;

        return (
          note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags?.some((tag: any) => tag.name?.toLowerCase().includes(tagSearchTerm.toLowerCase()))
        );
      })
      .sort((a, b) => moment(b.updatedAt).diff(moment(a.updatedAt)));
  }, [notes, user?._id, searchTerm, tagSearchTerm]);

  const handleTagClick = (tagName: string) => {
    if (tagName === 'All') {
      setTagSearchTerm('');
      setShowFavorites(false);
    } else if (tagName === 'Favorites') {
      setTagSearchTerm('');
      setShowFavorites(true);
    } else {
      setTagSearchTerm(tagName);
      setShowFavorites(false);
    }
    setSearchTerm('');
  };

  // Centralised API update wrapper to keep local state in sync
  const updateNoteApi = async (noteId: string, noteData: Partial<Note>) => {
    try {
      // Optimistic update
      setNotes((prev) => prev.map((n) => (n._id === noteId ? { ...n, ...noteData } : n)));
      if (selectedNote?._id === noteId) {
        setSelectedNote((prev) => ({ ...prev!, ...noteData }));
      }
      await axiosInstance.patch(`/notes/singlenote/${noteId}`, noteData);
    } catch (error) {
      console.error('Failed to update note', error);
      toast({ title: 'Failed to update note', variant: 'destructive' });
      fetchNotesAndTags(); // Rollback to actual server state on error
    }
  };

const addNewNote = async (data: { title: string }) => {
    if (!user || isSubmitting) return;

    const optimisticNoteId = `opt-${Date.now()}`;
    const optimisticNote: Note = {
      _id: optimisticNoteId,
      title: data.title,
      content: '',
      tags: [],
      favorite: false,
      isArchive: false,
      sharedWith: [],
      author: { _id: user._id, name: user.name, email: user.email },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      setIsSubmitting(true);
      
      // 1. Instantly show in UI
      setNotes((prev) => [optimisticNote, ...prev]);
      setSelectedNote(optimisticNote);
      setIsDialogOpen(false);

      // 2. Call API
      const response = await axiosInstance.post('/notes', {
        title: data.title,
        content: '',
        tags: [],
        author: user._id
      });

      // 3. Robustly extract the returned note (handling if it's nested in 'result' or an array)
      let serverData = response.data?.data?.result || response.data?.data;
      if (Array.isArray(serverData)) serverData = serverData[0]; 

      // 4. Merge the server response with our optimistic note. 
      // This prevents it from disappearing if the server omits arrays like 'tags' or 'sharedWith'
      const fullyPopulatedNote = { 
        ...optimisticNote, 
        ...(serverData || {}) 
      };

      // 5. Replace temporary note with the real one
      setNotes((prev) =>
        prev.map((n) => (n._id === optimisticNoteId ? fullyPopulatedNote : n))
      );
      
      setSelectedNote((current) => 
        current?._id === optimisticNoteId ? fullyPopulatedNote : current
      );

      // 6. Run a background sync immediately to guarantee flawless state
      fetchNotesAndTags();

      toast({ title: 'Note created successfully!' });
    } catch (error) {
      console.error('Error creating note:', error);
      setNotes((prev) => prev.filter((n) => n._id !== optimisticNoteId));
      setSelectedNote((current) => current?._id === optimisticNoteId ? null : current);
      toast({ title: 'Failed to create note', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateConfirm = async (noteData: Partial<Note>) => {
    if (!selectedNote) return;
    setLoading(true);
    await updateNoteApi(selectedNote._id, noteData);
    setLoading(false);
    setOpenUpdate(false);
    toast({ title: 'Note updated successfully!' });
  };

  const addTag = async (tag: { _id: string; name: string }) => {
    if (selectedNote && !selectedNote.tags.some((t: any) => t._id === tag._id)) {
      const updatedTags = [...selectedNote.tags, tag];
      await updateNoteApi(selectedNote._id, { tags: updatedTags });
      toast({ title: 'Tag added successfully!' });
    }
  };

  const removeTag = async (tagToRemove: string) => {
    if (selectedNote) {
      const updatedTags = selectedNote.tags.filter((tag: any) => tag?._id !== tagToRemove);
      await updateNoteApi(selectedNote._id, { tags: updatedTags });
      toast({ title: 'Tag removed successfully!' });
    }
  };

  const shareNote = () => setIsShareDialogOpen(true);

  const handleShare = async () => {
    if (!selectedNote) return;
    const existingSharedWith = Array.isArray(selectedNote.sharedWith) ? selectedNote.sharedWith : [];
    const newSharedWith = Array.isArray(sharedWith) ? sharedWith.map((r) => r.value) : [];
    const updatedSharedWith = [...new Set([...existingSharedWith, ...newSharedWith])];

    await updateNoteApi(selectedNote._id, { sharedWith: updatedSharedWith });
    setSharedWith([]);
    setIsShareDialogOpen(false);
    toast({ title: 'Note shared successfully!' });
  };

  const removeShareUser = async (userToRemove: any) => {
    if (selectedNote) {
      const updatedSharedWith = selectedNote.sharedWith.filter((id) => id !== userToRemove.value);
      await updateNoteApi(selectedNote._id, { sharedWith: updatedSharedWith });
      toast({ title: 'User removed successfully!' });
    }
  };

  const handleAddNewTag = async () => {
    if (isTagSubmitting || !newTag.trim() || !user?._id) return;

    const optimisticTagId = `opt-tag-${Date.now()}`;
    const optimisticTag: Tag = { _id: optimisticTagId, name: newTag.trim(), author: user._id };

    try {
      setIsTagSubmitting(true);
      setTags((prev) => [optimisticTag, ...prev]);

      const response = await axiosInstance.post('/tags', {
        name: newTag.trim(),
        author: user._id
      });

      let serverData = response.data?.data?.result || response.data?.data;
      if (Array.isArray(serverData)) serverData = serverData[0];

      const fullyPopulatedTag = {
        ...optimisticTag,
        ...(serverData || {})
      };

      setTags((prev) => prev.map((t) => (t._id === optimisticTagId ? fullyPopulatedTag : t)));
      setNewTag('');
      
      // Background sync
      fetchNotesAndTags();

      toast({ title: 'Tag created successfully!' });
    } catch (error) {
      console.error('Error creating tag:', error);
      setTags((prev) => prev.filter((t) => t._id !== optimisticTagId));
      toast({ title: 'Failed to create tag', variant: 'destructive' });
    } finally {
      setIsTagSubmitting(false);
    }
  };

  const removeExistingTag = async (tag: Tag) => {
    try {
      setTags((prev) => prev.filter((t) => t._id !== tag._id));
      await axiosInstance.delete(`/tags/${tag._id}`);
      toast({ title: 'Tag deleted successfully!' });
    } catch (error) {
      console.error('Error deleting tag:', error);
      fetchNotesAndTags();
      toast({ title: 'Failed to delete tag', variant: 'destructive' });
    }
  };

  const handleNoteAction = async (action: string) => {
    if (!selectedNote) return;

    try {
      if (action === 'delete') {
        const idToDelete = selectedNote._id;
        setSelectedNote(null);
        setNotes((prev) => prev.filter((n) => n._id !== idToDelete));
        await axiosInstance.delete(`/notes/singlenote/${idToDelete}`);
        toast({ title: 'Note deleted successfully!' });
      } else if (action === 'update') {
        await updateNoteApi(selectedNote._id, selectedNote);
        toast({ title: 'Note saved successfully!' });
      } else if (action === 'favorite') {
        const newFavoriteState = !selectedNote.favorite;
        await updateNoteApi(selectedNote._id, { favorite: newFavoriteState });
        toast({ title: `Note ${newFavoriteState ? 'added to' : 'removed from'} favorites!` });
      }
    } catch (error) {
      console.error(`Error ${action} note:`, error);
      toast({ title: `Failed to ${action} note`, variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (selectedTab !== 'my-notes') {
      setSelectedNote(null);
    }
  }, [selectedTab]);

  useEffect(() => {
    setUserSearchTerm('');
  }, [isShareDialogOpen]);

  return (
    <div className="flex h-full bg-white text-black ">
      <NotesSidebar
        notes={filteredNotes}
        sharedNotes={filterSharedNotes}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        setSelectedNote={setSelectedNote}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isTagManagementOpen={isTagManagementOpen}
        setIsTagManagementOpen={setIsTagManagementOpen}
        filteredTags={filteredTags}
        tagSearchTerm={tagSearchTerm}
        showFavorites={showFavorites}
        handleTagClick={handleTagClick}
        selectedNoteId={selectedNote?._id}
      />

      <NotesContent
        selectedNote={selectedNote}
        selectedTab={selectedTab}
        openUpdateModal={openUpdateModal}
        handleNoteAction={handleNoteAction}
        shareNote={shareNote}
        addTag={addTag}
        removeTag={removeTag}
        filteredTags={filteredTags}
        tagSearchTerm={tagSearchTerm}
        setTagSearchTerm={setTagSearchTerm}
        notes={filteredNotes}
        setSelectedNote={setSelectedNote}
        updateNoteApi={updateNoteApi}
      />

      <CreateNoteDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        addNewNote={addNewNote}
        isSubmitting={isSubmitting}
      />

      <UpdateNote
        selectNote={selectedNote}
        isOpen={openUpdate}
        onClose={closeUpdateModal}
        onConfirm={onUpdateConfirm}
        loading={loading}
        title="Update"
        description="Edit the Note Title."
      />
      <ShareDialog
        isShareDialogOpen={isShareDialogOpen}
        setIsShareDialogOpen={setIsShareDialogOpen}
        selectedNote={selectedNote}
        userOptions={userOptions}
        sharedWith={sharedWith}
        handleChange={handleChange}
        removeShareUser={removeShareUser}
        handleShare={handleShare}
      />

      <TagManagementDialog
        isTagManagementOpen={isTagManagementOpen}
        setIsTagManagementOpen={setIsTagManagementOpen}
        newTag={newTag}
        setNewTag={setNewTag}
        addNewTag={handleAddNewTag}
        isTagSubmitting={isTagSubmitting}
        tags={tags}
        removeExistingTag={removeExistingTag}
      />
    </div>
  );
}