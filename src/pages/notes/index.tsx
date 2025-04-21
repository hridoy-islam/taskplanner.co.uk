import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCompanyUsers } from '@/redux/features/userSlice';
import {
  createNewNote,
  updateNote,
  deleteNote,
  addOptimisticNote,
  removeOptimisticNote
} from '@/redux/features/allNoteSlice';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import 'react-quill/dist/quill.snow.css';
import TagManagementDialog from './components/tag-management-dialog';
import ShareDialog from './components/share-dialog';
import UpdateNoteDialog from './components/update-note-dialog';
import CreateNoteDialog from './components/create-note-dialog';
import NotesContent from './components/notes-contain';
import NotesSidebar from './components/notes-sidebar';
import moment from 'moment';
import { addNewTag, deleteTag, fetchTags } from '@/redux/features/tagSlice';
import usePollTags from '@/hooks/usePolltag';
import usePollNotes from '@/hooks/usePollNote';
interface Note {
  _id: string;
  title: string;
  content: string;
  tags: any[];
  favorite: boolean;
  isArchive: boolean;
  sharedWith: string[];
  author: string | { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  _id: string;
  name: string;
  author: string;
}

export default function NotesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.users);
  const { notes: reduxNotes, loading: notesLoading } = useSelector(
    (state: RootState) => state.allnotes
  );

  const { tags: reduxTags } = useSelector((state: RootState) => state.tags);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
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

  usePollTags(user?._id);
  usePollNotes(user?._id);
  useEffect(() => {
    if (reduxTags) {
      setTags(reduxTags);
    }
  }, [reduxTags]);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchCompanyUsers(user._id));
    }
  }, [user?._id, dispatch]);

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

  const userOptions = (shareRecipients || []).map((user) => ({
    value: user?._id,
    label: `${user.name} (${user.email})`
  }));

  const filteredTags = tags.filter((tag) => {
    if (searchTerm) {
      return tag?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  useEffect(() => {
    if (users && Array.isArray(users) && shareRecipients.length === 0) {
      setShareRecipients(users);
    }
  }, [users, shareRecipients]);

  const filteredNotes = useMemo(() => {
    return (reduxNotes || [])
      .filter((note: Note) => {
        // Handle both string and object author formats
        const authorId =
          typeof note?.author === 'string' ? note?.author : note?.author?._id;
        const currentUserId = user?._id;

        // Only include notes authored by the current user
        if (selectedTab === 'my-notes' && authorId !== currentUserId)
          return false;
        if (
          selectedTab === 'shared-notes' &&
          !note?.sharedWith?.some((userId: string) => userId === currentUserId)
        )
          return false;

        if (showFavorites) {
          return note.favorite;
        }

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
      .sort((a, b) => {
        const dateA = moment(a.updatedAt);
        const dateB = moment(b.updatedAt);
        return dateB.diff(dateA);
      });
  }, [
    reduxNotes,
    user?._id,
    selectedTab,
    showFavorites,
    tagSearchTerm,
    searchTerm
  ]);

  const filterSharedNotes = (reduxNotes || [])
    .filter((note) => {
      if (!note?.sharedWith?.some((userId: string) => userId === user?._id))
        return false;

      // Apply search filters
      return (
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags?.some((tag: any) =>
          tag.name?.toLowerCase().includes(tagSearchTerm.toLowerCase())
        )
      );
    })
    .sort((a, b) => {
      const dateA = moment(a.updatedAt);
      const dateB = moment(b.updatedAt);
      return dateB.diff(dateA); // Sort by newest updated
    });

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

  const addNewNote = async (data: { title: string }) => {
    if (!user || isSubmitting) return;

    let optimisticNoteId: string; // Store the optimistic note ID

    try {
      setIsSubmitting(true);

      // Generate a unique ID for the optimistic note
      optimisticNoteId = `opt-${data.title}-${Date.now()}`;

      const optimisticNote = {
        _id: optimisticNoteId, // Use the generated ID
        title: data.title,
        content: '',
        tags: [],
        favorite: false,
        isArchive: false,
        sharedWith: [],
        author: user._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __optimistic: true
      };

      // Dispatch the optimistic note
      dispatch(addOptimisticNote(optimisticNote));

      const newNoteData = {
        title: data.title,
        content: '',
        tags: [],
        author: user._id
      };

      // Create the note in the backend
      await dispatch(createNewNote(newNoteData)).unwrap();

      // Close the dialog after the note is successfully created
      setIsDialogOpen(false);
      toast({ title: 'Note created successfully!' });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({ title: 'Failed to create note', variant: 'destructive' });

      // Rollback the optimistic note if there's an error
      if (optimisticNoteId) {
        dispatch(removeOptimisticNote(optimisticNoteId));
      }
    } finally {
      // Reset the submitting state
      setIsSubmitting(false);
    }
  };

  const onUpdateConfirm = async (noteData: Partial<Note>) => {
    if (!selectedNote) return;

    // Optimistically update the UI
    const previousNote = { ...selectedNote }; // Store the current state of the note
    setSelectedNote({ ...selectedNote, ...noteData }); // Update the note locally

    try {
      setLoading(true);

      // Dispatch the update to the backend
      await dispatch(
        updateNote({
          noteId: selectedNote._id,
          noteData
        })
      ).unwrap();

      // Success toast
      toast({ title: 'Note updated successfully!' });
    } catch (error) {
      console.error('Error updating note:', error);

      // Rollback the optimistic update on failure
      setSelectedNote(previousNote); // Revert to the previous state
      toast({ title: 'Failed to update note', variant: 'destructive' });
    } finally {
      setLoading(false);
      setOpenUpdate(false);
    }
  };

  const addTag = async (tag: { _id: string; name: string }) => {
    if (
      selectedNote &&
      !selectedNote.tags.some((t: any) => t._id === tag._id)
    ) {
      try {
        const updatedTags = [...selectedNote.tags, tag];
        const updatedNote = {
          ...selectedNote,
          tags: updatedTags
        };

        await dispatch(
          updateNote({
            noteId: selectedNote?._id,
            noteData: { tags: updatedTags.map((t) => t?._id) }
          })
        ).unwrap();

        setSelectedNote(updatedNote);
        toast({ title: 'Tag added successfully!' });
      } catch (error) {
        console.error('Error adding tag:', error);
        toast({ title: 'Failed to add tag', variant: 'destructive' });
      }
    }
  };

  const removeTag = async (tagToRemove: string) => {
    if (selectedNote) {
      try {
        const updatedTags = selectedNote.tags.filter(
          (tag: any) => tag?._id !== tagToRemove
        );
        const updatedNote = {
          ...selectedNote,
          tags: updatedTags
        };

        await dispatch(
          updateNote({
            noteId: selectedNote._id,
            noteData: { tags: updatedTags.map((t) => t?._id) }
          })
        ).unwrap();

        setSelectedNote(updatedNote);
        toast({ title: 'Tag removed successfully!' });
      } catch (error) {
        console.error('Error removing tag:', error);
        toast({ title: 'Failed to remove tag', variant: 'destructive' });
      }
    }
  };

  const shareNote = () => {
    setIsShareDialogOpen(true);
  };

  const handleShare = async () => {
    if (!selectedNote) return;

    try {
      const existingSharedWith = Array.isArray(selectedNote.sharedWith)
        ? selectedNote.sharedWith
        : [];
      const newSharedWith = Array.isArray(sharedWith)
        ? sharedWith.map((recipient) => recipient.value)
        : [];

      const updatedSharedWith = [
        ...new Set([...existingSharedWith, ...newSharedWith])
      ];

      await dispatch(
        updateNote({
          noteId: selectedNote?._id,
          noteData: { sharedWith: updatedSharedWith }
        })
      ).unwrap();

      setSelectedNote({
        ...selectedNote,
        sharedWith: updatedSharedWith
      });
      setSharedWith([]);
      setIsShareDialogOpen(false);
      toast({ title: 'Note shared successfully!' });
    } catch (error) {
      console.error('Error sharing note:', error);
      toast({ title: 'Failed to share note', variant: 'destructive' });
    }
  };

  const removeShareUser = async (userToRemove: any) => {
    if (selectedNote) {
      try {
        const updatedSharedWith = selectedNote.sharedWith.filter(
          (sharedUser) => sharedUser !== userToRemove.value
        );

        await dispatch(
          updateNote({
            noteId: selectedNote?._id,
            noteData: { sharedWith: updatedSharedWith }
          })
        ).unwrap();

        setSelectedNote({
          ...selectedNote,
          sharedWith: updatedSharedWith
        });
        toast({ title: 'User removed successfully!' });
      } catch (error) {
        console.error('Error removing user:', error);
        toast({ title: 'Failed to remove user', variant: 'destructive' });
      }
    }
  };

  const addNewTag = async () => {
    if (isTagSubmitting || !newTag.trim() || !user?._id) return;

    let optimisticTagId: string; // Store the optimistic tag ID

    try {
      setIsTagSubmitting(true);

      // Generate a unique ID for the optimistic tag
      optimisticTagId = `opt-${newTag.trim()}-${Date.now()}`;

      const optimisticTag = {
        _id: optimisticTagId, // Use the generated ID
        name: newTag.trim(),
        author: user._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __optimistic: true
      };

      // Dispatch the optimistic tag
      dispatch(addOptimisticNote(optimisticTag)); // You may want to create a specific `addOptimisticTag` if needed in the slice

      // Send the tag creation request to the backend
      const response = await axiosInstance.post('/tags/', {
        name: newTag.trim(),
        author: user._id
      });

      // Update tags state after successful creation
      setTags([response.data.data, ...tags]);
      setNewTag('');

      toast({ title: 'Tag created successfully!' });
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({ title: 'Failed to create tag', variant: 'destructive' });

      // Rollback the optimistic tag if there's an error
      if (optimisticTagId) {
        dispatch(removeOptimisticNote(optimisticTagId)); // You may want to create a specific `removeOptimisticTag` if needed in the slice
      }
    } finally {
      // Reset the submitting state
      setIsTagSubmitting(false);
    }
  };

  const removeExistingTag = async (tag: Tag) => {
    try {
      await dispatch(deleteTag(tag._id)).unwrap();

      toast({ title: 'Tag deleted successfully!' });
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({ title: 'Failed to delete tag', variant: 'destructive' });
    }
  };

  const handleNoteAction = async (action: string) => {
    if (!selectedNote) return;

    try {
      if (action === 'delete') {
        await dispatch(deleteNote(selectedNote?._id)).unwrap();
        setSelectedNote(null);
        toast({ title: 'Note deleted successfully!' });
      } else if (action === 'update') {
        await dispatch(
          updateNote({
            noteId: selectedNote?._id,
            noteData: selectedNote
          })
        ).unwrap();
        toast({ title: 'Note saved successfully!' });
      } else if (action === 'favorite') {
        const updatedNote = {
          ...selectedNote,
          favorite: !selectedNote.favorite
        };
        await dispatch(
          updateNote({
            noteId: selectedNote?._id,
            noteData: { favorite: updatedNote.favorite }
          })
        ).unwrap();
        setSelectedNote(updatedNote);
        toast({
          title: `Note ${updatedNote.favorite ? 'added to' : 'removed from'} favorites!`
        });
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
    <div className="flex h-full bg-gray-100 text-gray-800">
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
      />

      <CreateNoteDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        addNewNote={addNewNote}
        isSubmitting={isSubmitting}
      />

      <UpdateNoteDialog
        selectedNote={selectedNote}
        isOpen={openUpdate}
        onClose={closeUpdateModal}
        onConfirm={onUpdateConfirm}
        loading={loading}
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
        addNewTag={addNewTag}
        isTagSubmitting={isTagSubmitting}
        tags={tags}
        removeExistingTag={removeExistingTag}
      />
    </div>
  );
}
