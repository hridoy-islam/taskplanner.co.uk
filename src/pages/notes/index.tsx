import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import {
  PlusCircle,
  Search,
  ChevronDown,
  MoreVertical,
  Hash,
  Share2,
  X,
  Trash,
  Archive,
  Star,
  Pen
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { toast } from '@/components/ui/use-toast';
import UpdateNote from '@/components/shared/update-note';
import {
  NoteSlice,
  useAddNewNoteMutation,
  useDeleteNoteMutation,
  useFetchNotesQuery,
  useFetchShareNotesQuery,
  useUpdateNoteMutation
} from '@/redux/features/noteSlice';
import {
  TagSlice,
  useAddNewTagMutation,
  useFetchTagsQuery
} from '@/redux/features/tagSlice';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import pen from 'lucide-react';

import Select from 'react-select';
import { fetchCompanyUsers } from '@/redux/features/userSlice';

import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  isArchive: boolean;
  sharedWith: string[];
}

interface Tag {
  id: string;
  name: string;
  author: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const demoUsers: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com' }
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>();
  const [searchTerm, setSearchTerm] = useState('');
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [tags, setTags] = useState([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareRecipients, setShareRecipients] = useState<any[]>([]);
  const [isTagManagementOpen, setIsTagManagementOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteName, setNoteName] = useState('');
  const { user } = useSelector((state: any) => state.auth);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const { users } = useSelector((state: RootState) => state.users);
  const [sharedWith, setSharedWith] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('my-notes');
  const [showFavorites, setShowFavorites] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { register, handleSubmit, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTagSubmitting, setIsTagSubmitting] = useState(false);

  // useEffect(() => {
  //   if (user && Array.isArray(user)) {
  //     setShareRecipients(user);
  //   }
  // }, []);


 

  const [addNewNoteData] = useAddNewNoteMutation();
  const [addNewTagData] = useAddNewTagMutation();
  const { data: noteData = [] } = useFetchNotesQuery(user._id, {
    pollingInterval: 10000,
    skip: !user?._id
  });
  const { data: sharedNoteData = [] } = useFetchShareNotesQuery(user._id, {
    pollingInterval: 10000,
    skip: !user?._id
  });

  const { data: tagsData = [] } = useFetchTagsQuery(user?._id, {
    pollingInterval: 10000,
    skip: !user?._id
  });

  console.log(tags)

  const getNotesFn = NoteSlice.usePrefetch('fetchNotes');
  const getTagsFn = TagSlice.usePrefetch('fetchTags');
  const getShareNotesFn = NoteSlice.usePrefetch('fetchShareNotes');

  const [deleteNote] = useDeleteNoteMutation();
  const [updateNote] = useUpdateNoteMutation();

  useEffect(() => {
    getNotesFn;
    getTagsFn;
    getShareNotesFn;
  }, [noteData, tagsData]);

  const openUpdateModal = (note) => {
    setSelectedNote(note);
    setOpenUpdate(true);
  };

  const closeUpdateModal = () => {
    setOpenUpdate(false);
    setSelectedNote(selectedNote);
  };

  const fetchData = async () => {
    try {
      if (user?._id) {
        await dispatch(fetchCompanyUsers(user._id));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [noteData]);

  useEffect(() => {
    if (users && Array.isArray(users) && shareRecipients.length === 0) {
      setShareRecipients(users); // This will only set users if shareRecipients is empty
    }
  }, [users]);

  const handleChange = (selectedOptions) => {
    setSharedWith(selectedOptions || []);
  };

  const userOptions = shareRecipients.map((user) => ({
    value: user._id,
    label: `${user.name} (${user.email}) `
  }));

  useEffect(() => {
    if (selectedTab !== 'my-notes') {
      setSelectedNote(null);
    }
  }, [selectedTab]);

  useEffect(() => {
    if (noteData.length > 0) {
      setNotes(noteData);
      // setSelectedNote(noteData[0]);
    } else {
      setSelectedNote(null);
    }
  }, [noteData]);

  useEffect(() => {
    if (sharedNoteData.length > 0) {
      setSharedNotes(sharedNoteData);
    } else {
      setSelectedNote(null);
    }
  }, [sharedNoteData]);

  const filteredTags = tags.filter((tag) => {
    if (searchTerm) {
      return tag.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true; // Keep all tags visible if filtering by tag
  });

  useEffect(() => {
    if (tagsData.length > 0) {
      setTags(tagsData);
    } else {
      setTags([]);
    }
  }, []);

  const filteredNotes = notes
    .filter((note) => {
      if (showFavorites) {
        return note.favorite; // Show only favorite notes
      }
      if (tagSearchTerm) {
        return note.tags.some((tag) =>
          tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
        );
      }

      return (
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return dateB.getTime() - dateA.getTime();
    });

  const filterSharedNotes = sharedNoteData.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleTagClick = (tagName: string) => {
    if (tagName === 'All') {
      setTagSearchTerm(''); // Reset tag filter
      setShowFavorites(false);
    } else if (tagName === 'Favorites') {
      setTagSearchTerm(''); // Clear tag filter
      setShowFavorites(true);
    } else {
      setTagSearchTerm(tagName);
      setShowFavorites(false);
    }
    setSearchTerm(''); // Clear text search when filtering by tag
  };

  const addNewNote = async (data) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const newNoteData = {
        title: data.title,
        content: '',
        tags: [],
        author: user._id
      };

      // const response = await axiosInstance.post("/notes/", newNoteData);
      await addNewNoteData(newNoteData);
      setNotes((prevNotes) => [newNoteData, ...prevNotes]);
       reset();

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }
  };

  const onUpdateConfirm = async (selectedNote) => {
    try {
      const updatedNote = {
        ...selectedNote
      };

      // await axiosInstance.patch(
      //   `/notes/singlenote/${selectedNote._id}`,
      //   updatedNote
      // );
      await updateNote({
        noteId: selectedNote._id,
        updatedData: updatedNote
      });

      setLoading(true);
      setSelectedNote(updatedNote);

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === selectedNote._id ? { ...note, ...updatedNote } : note
        )
      );

      toast({ title: 'Note saved successfully!' });
    } catch (error) {
      console.error('Error Updating note:', error);
    }
    setLoading(false);
  };

  const addTag = async (tag: { _id: string; name: string }) => {
    if (selectedNote && !selectedNote.tags.some((t) => t._id === tag._id)) {
      try {
        const updatedTags = [...selectedNote.tags, tag]; // Add new tag to existing tags

        // Send PATCH request to update the note in the backend
        const response = await axiosInstance.patch(
          `/notes/singlenote/${selectedNote._id}`,
          {
            tags: updatedTags.map((t) => t._id) // Send only tag IDs to the backend
          }
        );

        if (response.status === 200) {
          setNotes((prevNotes: any) =>
            prevNotes.map((note) =>
              note._id === selectedNote._id
                ? { ...note, tags: updatedTags } // Update tags locally
                : note
            )
          );

          setSelectedNote((prevNote) => ({
            ...prevNote!,
            tags: updatedTags
          }));

          toast({ title: 'Tag added successfully!' });
        }
      } catch (error) {
        console.error('Error adding tag:', error);
        toast({ title: 'Failed to add tag', variant: 'destructive' });
      }
    }
  };

  const removeShareUser = async (userToRemove) => {
    if (selectedNote) {
      try {
        // Remove the tag from the selectedNote
        const updatedNote = {
          ...selectedNote,
          sharedWith: selectedNote.sharedWith.filter(
            (sharedUser) => sharedUser !== userToRemove.value
          )
          //there sould be sharedWith
        };

        // Send the updated tags to the backend using a PATCH request
        const response = await axiosInstance.patch(
          `/notes/singlenote/${selectedNote._id}`, // Assuming the correct endpoint
          { sharedWith: updatedNote.sharedWith }
        );

        if (response.status === 200) {
          // Update the local state with the updated note
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note._id === selectedNote._id ? updatedNote : note
            )
          );
          setSelectedNote(updatedNote); // Update the selected note
          toast({ title: 'User removed successfully!' });
        }
      } catch (error) {
        console.error('Error removing tag:', error);
        toast({ title: 'Failed to remove user', variant: 'destructive' });
      }
    }
  };

  const removeTag = async (tagToRemove: string) => {
    if (selectedNote) {
      try {
        // Remove the tag from the selectedNote
        const updatedNote = {
          ...selectedNote,
          tags: selectedNote.tags.filter((tag) => tag !== tagToRemove)
        };

        // Send the updated tags to the backend using a PATCH request
        const response = await axiosInstance.patch(
          `/notes/singlenote/${selectedNote._id}`, // Assuming the correct endpoint
          { tags: updatedNote.tags } // Send only the updated tags
        );

        if (response.status === 200) {
          // Update the local state with the updated note
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note._id === selectedNote._id ? updatedNote : note
            )
          );
          setSelectedNote(updatedNote); // Update the selected note
          toast({ title: 'Tag removed successfully!' });
        }
      } catch (error) {
        console.error('Error removing tag:', error);
        toast({ title: 'Failed to remove tag', variant: 'destructive' });
      }
    }
  };

  const shareNote = () => {
    setIsShareDialogOpen(true);
  };

  // const handleShare = () => {
  //   console.log(`Sharing note: ${selectedNote?.title} with:`, sharedWith);
  //   setIsShareDialogOpen(false);
  //   setShareRecipients([]);
  // };

  const handleShare = async () => {
    if (!selectedNote) return;

    // Ensure sharedWith is always an array before merging
    const existingSharedWith = Array.isArray(selectedNote.sharedWith)
      ? selectedNote.sharedWith
      : [];
    const newSharedWith = Array.isArray(sharedWith)
      ? sharedWith.map((recipient) => recipient.value)
      : [];

    // Merge old and new sharedWith values (removing duplicates)
    const updatedSharedWith = [
      ...new Set([...existingSharedWith, ...newSharedWith])
    ];

    // Prepare the data to be sent to the backend
    const data = {
      noteId: selectedNote._id,
      updatedData: { sharedWith: updatedSharedWith } // Merged list
    };

    try {
      const updatedNote = await updateNote(data);

      // Ensure updatedNote.sharedWith is an array before using spread
      const updatedSharedList = Array.isArray(updatedNote?.sharedWith)
        ? updatedNote.sharedWith
        : [];

      setNotes((prevNotes: any) =>
        prevNotes.map((note) =>
          note._id === selectedNote._id
            ? {
                ...note,
                sharedWith: [
                  ...new Set([...existingSharedWith, ...updatedSharedList])
                ]
              }
            : note
        )
      );

      setSelectedNote((prevNote) => ({
        ...prevNote!,
        sharedWith: [
          ...new Set([...(prevNote?.sharedWith ?? []), ...updatedSharedList])
        ]
      }));

      setIsShareDialogOpen(false);
      setSharedWith(updatedSharedList);

      toast({ title: 'Note shared successfully!' });
    } catch (error) {
      console.error('Error sharing note:', error);
      toast({ title: 'Failed to share note', variant: 'destructive' });
    }
  };

  const toggleRecipient = (user: User) => {
    setShareRecipients((prev) =>
      prev.some((r) => r.id === user.id)
        ? prev.filter((r) => r.id !== user.id)
        : [...prev, user]
    );
  };

  const addNewTag = async () => {
    if (isTagSubmitting || !newTag.trim()) return; // Prevent multiple submissions & empty tags

    try {
      setIsTagSubmitting(true); // Disable submission while processing

      const data = {
        name: newTag.trim(), // Trim whitespace
        author: user._id
      };

      await addNewTagData(data);

      setTags([data, ...tags]); // Update state with new tag
      setNewTag(''); // Clear input after submission
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsTagSubmitting(false); // Re-enable submission after request completes
    }
  };

  const removeExistingTag = async (tag: string) => {
    try {
      // Send DELETE request to API to remove the tag by its ID
      await axiosInstance.delete(`/tags/${tag._id}`);

      // console.log(tag._id)

      // Update local state after successful deletion
      setTags((prevTags) => prevTags.filter((t) => t._id !== tag._id));
      setNotes(
        notes.map((note) => ({
          ...note,
          tags: note.tags.filter((t) => t._id !== tag._id)
        }))
      );

      if (selectedNote) {
        setSelectedNote({
          ...selectedNote,
          tags: selectedNote.tags.filter((t) => t._id !== tag._id)
        });
      }

      console.log('Tag deleted successfully!');
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleNoteAction = async (action: string) => {
    if (selectedNote) {
      console.log(
        `Performing action: ${action} on note: ${selectedNote.title}`
      );

      if (action === 'delete') {
        try {
          // Send DELETE request to API
          // await axiosInstance.delete(`/notes/singlenote/${selectedNote._id}`);
          await deleteNote(selectedNote._id);
          // Update the local state by removing the deleted note based on _id
          setNotes((prevNotes) =>
            prevNotes.filter((note) => note._id !== selectedNote._id)
          );

          setSelectedNote(null);
          console.log('Note deleted successfully!');
        } catch (error) {
          console.error('Error deleting note:', error);
        }
      }
      if (action === 'update') {
        try {
          const updatedNote = {
            ...selectedNote
          };

          // Send PUT request to update the note
          // await axiosInstance.patch(`/notes/singlenote/${selectedNote._id}`, updatedNote);
          await updateNote({
            noteId: selectedNote._id,
            updatedData: updatedNote
          });
          // Update the local state with the updated note
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note._id === selectedNote._id ? { ...note, ...updatedNote } : note
            )
          );

          setSelectedNote(updatedNote);
          toast({ title: 'Note saved successfully!' });
        } catch (error) {
          console.error('Error Updating note:', error);
        }
      }

      if (action === 'favorite') {
        try {
          // Toggle favorite status
          const updatedNote = {
            ...selectedNote,
            favorite: !selectedNote.favorite
          };

          setLoading(true);

          // Send the PATCH request
          // await axiosInstance.patch(`/notes/singlenote/${selectedNote._id}`, updatedNote);
          await updateNote({
            noteId: selectedNote._id,
            updatedData: updatedNote
          });
          // Update local state (notes list)
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note._id === selectedNote._id
                ? { ...note, favorite: updatedNote.favorite }
                : note
            )
          );

          setSelectedNote(updatedNote);
          // Show toast message
          toast({
            title: `Note ${updatedNote.favorite ? 'added to' : 'removed from'} favorites!`
          });
        } catch (error) {
          console.error('Error Updating note:', error);
        } finally {
          setLoading(false);
        }
      }

      // if (action === 'archive') {
      //   try {
      //     // Toggle favorite status
      //     const updatedNote = {
      //       ...selectedNote,
      //       isArchive: !selectedNote.isArchive
      //     };

      //     setLoading(true);

      //     // Send the PATCH request
      //     // await axiosInstance.patch(`/notes/singlenote/${selectedNote._id}`, updatedNote);
      //     await updateNote({
      //       noteId: selectedNote._id,
      //       updatedData: updatedNote
      //     });
      //     // Update local state (notes list)
      //     setNotes((prevNotes) =>
      //       prevNotes.map((note) =>
      //         note._id === selectedNote._id
      //           ? { ...note, isArchive: updatedNote.isArchive }
      //           : note
      //       )
      //     );
      //     setSelectedNote(updatedNote);
      //     // Show toast message
      //     toast({
      //       title: `Note ${updatedNote.isArchive ? 'added to' : 'removed from'} archive!`
      //     });
      //   } catch (error) {
      //     console.error('Error Updating note:', error);
      //   } finally {
      //     setLoading(false);
      //   }
      // }
    }
  };

  useEffect(() => {
    setUserSearchTerm('');
  }, [isShareDialogOpen]);

  return (
    <div className="flex h-full bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <div className="w-80 overflow-y-auto border-r border-gray-300 bg-gray-200">
        <div className="overflow-hidden px-2 py-4">
          <Button
            variant="ghost"
            className="w-full justify-center border border-gray-400 text-gray-700 hover:bg-black"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Note
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogTitle>Enter Note Title</DialogTitle>

              <form
                onSubmit={handleSubmit((data) => addNewNote(data))} // Pass form data to addNewNote
              >
                <Input
                  {...register('title', { required: true })}
                  placeholder="Note Title"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent default form submission behavior
                      handleSubmit((data) => addNewNote(data))(); // Corrected function execution
                    }
                  }}
                />

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Note'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {selectedTab === 'my-notes' && (
          <div className="flex flex-row items-center justify-between px-2">
            <Button onClick={() => setIsTagManagementOpen(true)}>
              <Hash className="mr-2 h-4 w-4" />
              Manage Tags
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 ">
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 border-none bg-white p-0 text-black">
                <div className="flex flex-col overflow-y-auto">
                  <div className="max-h-48 overflow-y-auto">
                    <div>
                      {/* All Tasks */}
                      <div
                        onClick={() => handleTagClick('All')}
                        className={`cursor-pointer p-2 hover:bg-gray-200 ${
                          !tagSearchTerm && !showFavorites ? 'font-bold' : ''
                        }`}
                      >
                        All
                      </div>

                      {/* Favorite Tasks */}
                      <div
                        onClick={() => handleTagClick('Favorites')}
                        className={`cursor-pointer p-2 hover:bg-gray-200 ${
                          showFavorites ? 'font-bold' : ''
                        }`}
                      >
                        Favorites
                      </div>

                      {filteredTags.length > 0 ? (
                        filteredTags.map((tag) => (
                          <div
                            key={tag._id}
                            onClick={() => handleTagClick(tag.name)}
                            className={`cursor-pointer p-2 hover:bg-gray-200 ${
                              tagSearchTerm === tag.name ? 'font-bold' : ''
                            }`}
                          >
                            {tag.name}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No tags found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
        <div className="p-2 ">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-600"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search"
              className="border border-gray-400  pl-10 focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-2 ">
          <Tabs
            value={selectedTab}
            defaultValue="my-notes"
            onValueChange={(value) => {
              setSelectedTab(value);
              setSelectedNote(null); // Reset selected note when switching tabs
            }}
            
            className="w-full "
          >
            <TabsList className="grid w-full  grid-cols-2 ">
              <TabsTrigger value="my-notes">My Notes</TabsTrigger>
              <TabsTrigger value="shared-notes">Shared Notes</TabsTrigger>
            </TabsList>

            {/* My Notes Tab */}
            <TabsContent value="my-notes">
              <div className="flex flex-col gap-2 overflow-y-auto">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`cursor-pointer rounded-md border border-gray-200 p-4 hover:bg-gray-400 ${note?.favorite ? 'bg-orange-200' : 'bg-white'}`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <h3 className="truncate font-semibold">{note.title}</h3>
                    <p className="w-full truncate text-sm text-gray-600">
                      {note.content.length > 40
                        ? note.content.substring(0, 40) + '...'
                        : note.content}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag._id}
                          className="rounded-full bg-violet-600 p-1 text-[10px] text-white"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Shared Notes Tab */}
            <TabsContent value="shared-notes">
              <div className="flex flex-col gap-2 overflow-y-auto ">
                {filterSharedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="cursor-pointer rounded-md border border-gray-200 bg-gray-100 p-4 hover:bg-gray-400"
                    onClick={() => setSelectedNote(note)}
                  >
                    <h3 className="truncate font-semibold">{note.title}</h3>
                    <p className="w-full truncate text-sm text-gray-600">
                      {note.content.length > 40
                        ? note.content.substring(0, 40) + '...'
                        : note.content}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {selectedNote ? (
          <>
            <header className="flex  items-center justify-between border-b border-gray-300 bg-gray-200 p-4">
              <div
                className="flex items-center p-2"
                onClick={() => {
                  if (selectedTab === 'my-notes') {
                    openUpdateModal(selectedNote);
                  }
                }}
              >
                <h2 className="font-semibold">{selectedNote.title}</h2>
                {selectedTab === 'my-notes' && (
                  <Pen className="ml-2 h-4 w-4 text-gray-600" />
                )}
              </div>
              {selectedTab === 'my-notes' && (
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 ">
                        <Hash className="mr-2 h-4 w-4" />
                        Add tag
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 border-none bg-white p-0 text-black">
                      <div className="flex flex-col overflow-y-auto">
                        {/* Search Input */}
                        <input
                          type="text"
                          placeholder="Search tags..."
                          value={tagSearchTerm}
                          onChange={(e) => setTagSearchTerm(e.target.value)}
                          className="border-b border-gray-200 p-2 focus:outline-none"
                        />

                        {/* Tag List */}
                        <div className="max-h-48 overflow-y-auto">
                          {filteredTags.length > 0 ? (
                            filteredTags.map((tag) => (
                              <div
                                key={tag._id}
                                onClick={() => addTag(tag)}
                                className="cursor-pointer p-2 hover:bg-gray-200"
                              >
                                {tag?.name}
                              </div>
                            ))
                          ) : (
                            <div className="p-2 text-gray-500">
                              No tags found.
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    onClick={() => handleNoteAction('update')}
                    size="sm"
                    className="h-8"
                  >
                    Save
                  </Button>

                  <Button variant="ghost" size="icon" onClick={shareNote}>
                    <Share2 className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {/* <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator /> */}
                      {/* <DropdownMenuItem
                      onClick={() => setIsTagManagementOpen(true)}
                    >
                      <Hash className="mr-2 h-4 w-4" />
                      Manage Tags
                    </DropdownMenuItem> */}

                      <DropdownMenuItem
                        onClick={() => handleNoteAction('delete')}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Note
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem
                      onClick={() => handleNoteAction('archive')}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      {selectedNote.isArchive
                        ? 'Unarchive Note'
                        : 'Archive Note'}
                    </DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={() => handleNoteAction('favorite')}
                      >
                        <Star
                          className={`mr-2 h-4 w-4  ${selectedNote.favorite === true ? 'text-orange-200' : ''}`}
                        />
                        <p
                          className={` ${selectedNote.favorite === true ? 'text-orange-200' : ''}`}
                        >
                          Favorite Note
                        </p>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </header>
            <main className="flex-1 bg-white p-6">
              {selectedTab === 'my-notes' && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag?._id}
                      className="flex items-center rounded-full  bg-violet-600  px-2 py-1 text-sm text-white"
                    >
                      {tag?.name}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <textarea
                disabled={selectedTab !== 'my-notes' || selectedNote.isArchive}
                className="h-[calc(100%-2rem)] w-full resize-none border-none bg-white focus:outline-none"
                value={selectedNote.content}
                onChange={(e) => {
                  const updatedNotes = notes.map((note) =>
                    note._id === selectedNote._id
                      ? { ...note, content: e.target.value }
                      : note
                  );
                  setNotes(updatedNotes);
                  setSelectedNote({ ...selectedNote, content: e.target.value });
                }}
                placeholder="Type your note here..."
              />
            </main>
            <UpdateNote
              selectNote={selectedNote}
              isOpen={openUpdate}
              onClose={closeUpdateModal}
              onConfirm={onUpdateConfirm}
              loading={loading}
              title="Update"
              description="Edit the Note Title."
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            Select a note or create a new one
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Note</DialogTitle>
            <DialogDescription>
              Choose users to share this note with and assign tags.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="users" className="w-full">
            <TabsContent value="users">
              <div className="space-y-4">
                {/* <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                    size={18}
                  />
                  <Input
                    type="text"
                    placeholder="Search users"
                    className="pl-10"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                </div> */}

                {/* <ScrollArea className="h-[200px]">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="mb-2 flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`user-${user._id}`}
                        checked={shareRecipients.some((r) => r.id === user.id)}
                        onChange={() => toggleRecipient(user)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`user-${user.id}`} className="flex-1">
                        {user.name} ({user.email})
                      </label>
                    </div>
                  ))}
                </ScrollArea> */}
                <Select
                  options={userOptions}
                  isMulti
                  value={sharedWith}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Select users..."
                />
                <ScrollArea className="h-[200px]">
                  {(selectedNote?.sharedWith || []).map((userId) => {
                    // Find the user from userOptions based on the userId
                    const user = userOptions.find(
                      (user) => user.value === userId
                    );

                    // If user exists, render their name and email
                    if (user) {
                      return (
                        <div
                          key={user.value}
                          className="mb-2 flex items-center space-x-2"
                        >
                          <label
                            htmlFor={`user-${user.value}`}
                            className="flex-1"
                          >
                            {user.label}{' '}
                            {/* Assuming label is in the format of "name (email)" */}
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeShareUser(user)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    }
                    return null; // Return null if no user is found
                  })}
                </ScrollArea>
              </div>
            </TabsContent>
            {/* <TabsContent value="tags">
              <ScrollArea className="h-[200px]">
                {tags.map((tag) => (
                  <div key={tag} className="mb-2 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tag-${tag}`}
                      checked={selectedNote?.tags.includes(tag)}
                      onChange={() =>
                        selectedNote?.tags.includes(tag)
                          ? removeTag(tag)
                          : addTag(tag)
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`tag-${tag}`} className="flex-1">
                      {tag}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent> */}
          </Tabs>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsShareDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleShare}>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Management Dialog */}
      <Dialog open={isTagManagementOpen} onOpenChange={setIsTagManagementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="New tag name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent default behavior
                    addNewTag(); // Call function
                  }
                }}
              />
              <Button onClick={addNewTag} disabled={isTagSubmitting}>
                {isTagSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </div>

            <ScrollArea className="h-[200px]">
              {tags.map((tag) => (
                <div
                  key={tag._id} // Use _id as the key (unique identifier for each tag)
                  className="flex items-center justify-between py-2"
                >
                  <span>{tag.name}</span> {/* Display the tag name */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExistingTag(tag)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
