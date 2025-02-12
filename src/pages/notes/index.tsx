import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Star
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
  useUpdateNoteMutation
} from '@/redux/features/noteSlice';
import {
  TagSlice,
  useAddNewTagMutation,
  useFetchTagsQuery
} from '@/redux/features/tagSlice';

import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { fetchCompanyUsers } from '@/redux/features/userSlice';
import {
  AsyncThunkAction,
  ThunkDispatch,
  UnknownAction
} from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  isArchive: boolean;
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
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [tags, setTags] = useState([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareRecipients, setShareRecipients] = useState<User[]>([]);
  const [isTagManagementOpen, setIsTagManagementOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteName, setNoteName] = useState('');
  const { user } = useSelector((state: any) => state.auth);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

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
    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, dispatch]);

  // useEffect(() => {
  //   if (user && Array.isArray(user)) {
  //     setShareRecipients(user.colleagues);
  //   }
  // }, []);

  const [addNewNoteData] = useAddNewNoteMutation();
  const [addNewTagData] = useAddNewTagMutation();
  const { data: noteData = [] } = useFetchNotesQuery(user._id, {
    pollingInterval: 5000,
    skip: !user?._id
  });

  const { data: tagsData = [] } = useFetchTagsQuery(user?._id, {
    pollingInterval: 5000,
    skip: !user?._id
  });

  const handleChange = (selectedOptions) => {
    setShareRecipients(selectedOptions || []);
  };

  const getNotesFn = NoteSlice.usePrefetch('fetchNotes');
  const getTagsFn = TagSlice.usePrefetch('fetchTags');

  const [deleteNote] = useDeleteNoteMutation();
  const [updateNote] = useUpdateNoteMutation();

  useEffect(() => {
    getNotesFn;
    getTagsFn;
  }, []);

  const openUpdateModal = (note) => {
    setSelectedNote(note);
    setOpenUpdate(true);
  };

  const closeUpdateModal = () => {
    setOpenUpdate(false);
    setSelectedNote(selectedNote);
  };

  const filteredUsers = demoUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const userOptions = filteredUsers.map((user) => ({
    value: user.id,
    label: `${user.name} (${user.email})`
  }));

  // useEffect(() => {
  //   async function fetchNotes() {
  //     if (!user?._id) return; // Don't fetch if user is not available

  //     try {
  //       const response = await axiosInstance.get(`/notes/${user._id}`);
  //       const notesData = response.data?.data?.result || []; // Ensure it's always an array

  //       if (!Array.isArray(notesData)) {
  //         console.error("Unexpected response format", response.data);
  //         setNotes([]); // Reset notes to an empty array
  //         return;
  //       }

  //       setNotes(notesData);
  //       if (notesData.length > 0) {
  //         setSelectedNote(notesData[0]); // Select the first note by default
  //       } else {
  //         setSelectedNote(null); // No notes available
  //       }
  //     } catch (error) {
  //       console.error("Error fetching notes:", error);
  //       setNotes([]); // Reset notes in case of an error
  //       setSelectedNote(null);
  //     }
  //   }

  //   fetchNotes();
  // }, [user?._id]); // Depend on user?._id to refetch when it changes

  // Filter tags based on search term

  useEffect(() => {
    if (noteData.length > 0) {
      setNotes(noteData);
      setSelectedNote(noteData[0]);
    } else {
      setSelectedNote(null);
    }
  }, [noteData]);

  const filteredTags = tags.filter((tag) =>
    tag?.name?.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  // useEffect(() => {
  //   async function fetchTags() {
  //     if (!user?._id) return; // Don't fetch if user is not available

  //     try {
  //       const response = await axiosInstance.get(`/tags/user/${user._id}`);
  //       const tagsData = response.data?.data?.result || []; // Ensure it's always an array

  //       if (!Array.isArray(tagsData)) {
  //         console.error('Unexpected response format');
  //         setTags([]); // Reset tags to an empty array
  //         return;
  //       }

  //       setTags(tagsData);
  //     } catch (error) {
  //       console.error('Error fetching tags:', error);
  //       setTags([]); // Reset tags in case of an error
  //     }
  //   }

  //   fetchTags();
  // }, [user?._id]); // Re-fetch when user._id changes

  useEffect(() => {
    if (tagsData.length > 0) {
      setTags(tagsData);
    } else {
      setTags([]);
    }
  }, []);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleTagClick = (tagName: string) => {
    setSearchTerm(tagName);
  };

  const addNewNote = async () => {
    try {
      const newNoteData = {
        title: noteName,
        content: '',
        tags: [],
        author: user._id
      };

      // const response = await axiosInstance.post("/notes/", newNoteData);
      await addNewNoteData(newNoteData);

      setIsDialogOpen(false);
      setNoteName('');
    } catch (error) {
      console.error('Error creating note:', error);
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

  const handleShare = () => {
    console.log(`Sharing note: ${selectedNote?.title} with:`, shareRecipients);
    setIsShareDialogOpen(false);
    setShareRecipients([]);
  };

  const toggleRecipient = (user: User) => {
    setShareRecipients((prev) =>
      prev.some((r) => r.id === user.id)
        ? prev.filter((r) => r.id !== user.id)
        : [...prev, user]
    );
  };

  const addNewTag = async () => {
    try {
      const data = {
        name: newTag,
        author: user._id
      };

      // const response = await axiosInstance.post('/tags/', data);
      await addNewTagData(data);

      setTags([data, ...tags]);
      setNewTag('');
    } catch (error) {
      console.error('Error creating tag:', error);
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

      if (action === 'archive') {
        try {
          // Toggle favorite status
          const updatedNote = {
            ...selectedNote,
            isArchive: !selectedNote.isArchive
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
                ? { ...note, isArchive: updatedNote.isArchive }
                : note
            )
          );
          setSelectedNote(updatedNote);
          // Show toast message
          toast({
            title: `Note ${updatedNote.isArchive ? 'added to' : 'removed from'} archive!`
          });
        } catch (error) {
          console.error('Error Updating note:', error);
        } finally {
          setLoading(false);
        }
      }
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
            className="w-full justify-center border border-gray-400 text-gray-700 hover:bg-gray-300"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Note
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogTitle>Enter Note Title</DialogTitle>
              <Input
                value={noteName}
                onChange={(e) => setNoteName(e.target.value)}
                placeholder="Note Title"
              />
              <DialogFooter>
                <Button onClick={addNewNote}>Create Note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <div
                        key={tag._id}
                        onClick={() => handleTagClick(tag.name)}
                        className="cursor-pointer p-2 hover:bg-gray-200"
                      >
                        {tag.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No tags found.</div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
          <Tabs defaultValue="my-notes" className="w-full ">
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
                          className="rounded bg-gray-300 px-1 text-xs text-gray-700"
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
              <div className="flex flex-col gap-2 overflow-y-auto p-2">
                {/* {sharedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="cursor-pointer rounded-md border border-gray-200 p-4 hover:bg-gray-400 bg-gray-100"
                    onClick={() => setSelectedNote(note)}
                  >
                    <h3 className="truncate font-semibold">{note.title}</h3>
                    <p className="w-full truncate text-sm text-gray-600">
                      {note.content.length > 40 ? note.content.substring(0, 40) + '...' : note.content}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span key={tag._id} className="rounded bg-gray-300 px-1 text-xs text-gray-700">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))} */}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* <div className="flex flex-col gap-2 overflow-y-auto p-2 ">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`cursor-pointer rounded-md border border-gray-200 p-4  hover:bg-gray-400 ${note?.favorite === true ? 'bg-orange-200' : 'bg-white'}`}
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
                    className="rounded bg-gray-300 px-1 text-xs text-gray-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {selectedNote ? (
          <>
            <header className="flex items-center justify-between border-b border-gray-300 bg-gray-200 p-4">
              <div
                className="flex items-center"
                onClick={() => {
                  openUpdateModal(selectedNote);
                }}
              >
                <h2 className="font-semibold">{selectedNote.title}</h2>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-600" />
              </div>
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
                              {tag.name}
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
                    <DropdownMenuItem
                      onClick={() => handleNoteAction('archive')}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      {selectedNote.isArchive
                        ? 'Unarchive Note'
                        : 'Archive Note'}
                    </DropdownMenuItem>
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
            </header>
            <main className="flex-1 bg-white p-6">
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedNote.tags.map((tag) => (
                  <span
                    key={tag._id}
                    className="flex items-center rounded-full bg-gray-200 px-2 py-1 text-sm text-gray-700"
                  >
                    {tag.name}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <textarea
                disabled={selectedNote.isArchive}
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
                        id={`user-${user.id}`}
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
                  value={shareRecipients}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Select users..."
                />
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
              />
              <Button onClick={addNewTag}>Add</Button>
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
function dispatch(
  arg0: AsyncThunkAction<
    any,
    string,
    {
      state?: unknown;
      dispatch?: ThunkDispatch<unknown, unknown, UnknownAction>;
      extra?: unknown;
      rejectValue?: unknown;
      serializedErrorType?: unknown;
      pendingMeta?: unknown;
      fulfilledMeta?: unknown;
      rejectedMeta?: unknown;
    }
  >
) {
  throw new Error('Function not implemented.');
}
