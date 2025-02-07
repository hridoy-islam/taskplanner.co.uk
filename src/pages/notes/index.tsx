'use client';

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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command';
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
import axiosInstance from "@/lib/axios"
import { useParams } from 'react-router-dom';

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
}

interface User {
  id: number;
  name: string;
  email: string;
}







const initialNotes: Note[] = [
  {
    id: 1,
    title: 'Welcome to Notes',
    content: 'This is your first note!',
    tags: ['Personal']
  },

];

const initialTags = [
  'Personal',
  'Work',
  'Ideas',
  'To-Do',
  'Important',
  'Project A',
  'Project B'
];

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
  const [tags, setTags] = useState(initialTags);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareRecipients, setShareRecipients] = useState<User[]>([]);
  const [isTagManagementOpen, setIsTagManagementOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const {userId} = useParams();

 useEffect(() => {
  async function fetchNotes() {
    try {
      const response = await axiosInstance.get(`/notes/${userId}`);
      const notesData = response.data?.data?.result;
      if (Array.isArray(notesData)) {
        setNotes(notesData);
        if (notesData.length > 0) {
          setSelectedNote(notesData[0]);
        }
      } else {
        console.error("Unexpected response format", response.data);
        setNotes([]); // Ensure it's always an array
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]); // Handle error by resetting to an empty array
    }
  }
  fetchNotes();
}, []);



  // useEffect(() => {
  //   async function fetchNotes() {
  //     try {
  //       const response = await axiosInstance.get("/notes");
  //       if (Array.isArray(response.data)) {
  //         setNotes(response.data);
  //       } else {
  //         console.error("Fetched notes are not an array:", response.data);
  //         setNotes([]); 
  //       }
  //     } catch (error) {
  //       console.error("Error fetching notes:", error);
  //       setNotes([]); 
  //     }
  //   }
  
  //   fetchNotes();
  // }, []);
  
  

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const filteredUsers = demoUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const addNewNote = async () => {
    try {
      
      const newNoteData = { 
        title: taskName, 
        content: "", 
        tags: [],
        userId: userId  
      };
  
      const response = await axiosInstance.post("/notes/", newNoteData);
  
      if (response.status === 201) {
        setIsDialogOpen(false);
        setTaskName("");
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const addTag = (tag: string) => {
    if (selectedNote && !selectedNote.tags.includes(tag)) {
      const updatedNote = {
        ...selectedNote,
        tags: [...selectedNote.tags, tag]
      };
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      );
      setNotes(updatedNotes);
      setSelectedNote(updatedNote);
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (selectedNote) {
      const updatedNote = {
        ...selectedNote,
        tags: selectedNote.tags.filter((tag) => tag !== tagToRemove)
      };
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      );
      setNotes(updatedNotes);
      setSelectedNote(updatedNote);
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

  const addNewTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeExistingTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    setNotes(
      notes.map((note) => ({
        ...note,
        tags: note.tags.filter((tag) => tag !== tagToRemove)
      }))
    );
    if (selectedNote) {
      setSelectedNote({
        ...selectedNote,
        tags: selectedNote.tags.filter((tag) => tag !== tagToRemove)
      });
    }
  };

  const handleNoteAction = async (action: string) => {
    if (selectedNote) {
      console.log(
        `Performing action: ${action} on note: ${selectedNote.title}`
      );
      if (action === "delete") {
        try {
          // Send DELETE request to API
          await axiosInstance.delete(`/note/${selectedNote.id}`);

          setNotes((prevNotes) => prevNotes.filter((note) => note.id !== selectedNote.id));

          setSelectedNote(null);
          console.log("Note deleted successfully!");
        } catch (error) {
          console.error("Error deleting note:", error);
        }
      }
    }
  };

  useEffect(() => {
    setUserSearchTerm('');
  }, [isShareDialogOpen]);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-300 bg-gray-200">
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-300"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Note
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogTitle>Enter Note Name</DialogTitle>
              <Input
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Task Name"
              />
              <DialogFooter>
                <Button onClick={addNewNote}>Create Note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search"
              className="border-none bg-gray-300 pl-10 focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-130px)]">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`cursor-pointer p-4 ${selectedNote?.id === note.id ? 'bg-white' : 'hover:bg-gray-300'}`}
              onClick={() => setSelectedNote(note)}
            >
              <h3 className="truncate font-semibold">{note.title}</h3>
              <p className="truncate text-sm text-gray-600">{note.content}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {/* {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-gray-300 px-1 text-xs text-gray-700"
                  >
                    {tag}
                  </span>
                ))} */}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {selectedNote ? (
          <>
            <header className="flex items-center justify-between border-b border-gray-300 bg-gray-200 p-4">
              <div className="flex items-center">
                <h2 className="font-semibold">{selectedNote.title}</h2>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-600" />
              </div>
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-dashed"
                    >
                      <Hash className="mr-2 h-4 w-4" />
                      Add tag
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0">
                    <Command>
                      <CommandInput placeholder="Search tags..." />
                      <CommandEmpty>No tags found.</CommandEmpty>
                      <CommandGroup>
                        {tags.map((tag) => (
                          <CommandItem key={tag} onSelect={() => addTag(tag)}>
                            {tag}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsTagManagementOpen(true)}
                    >
                      Manage Tags
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Actions</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
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
                          Archive Note
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleNoteAction('favorite')}
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Favorite Note
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="flex-1 bg-white p-6">
              <div className="mb-4 flex flex-wrap gap-2">
                {/* {selectedNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center rounded-full bg-gray-200 px-2 py-1 text-sm text-gray-700"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))} */}
              </div>
              <textarea
                className="h-[calc(100%-2rem)] w-full resize-none border-none focus:outline-none"
                value={selectedNote.content}
                onChange={(e) => {
                  const updatedNotes = notes.map((note) =>
                    note.id === selectedNote.id
                      ? { ...note, content: e.target.value }
                      : note
                  );
                  setNotes(updatedNotes);
                  setSelectedNote({ ...selectedNote, content: e.target.value });
                }}
                placeholder="Type your note here..."
              />
            </main>
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <div className="space-y-4">
                <div className="relative">
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
                </div>
                <ScrollArea className="h-[200px]">
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
                </ScrollArea>
              </div>
            </TabsContent>
            <TabsContent value="tags">
              <ScrollArea className="h-[200px]">
                {/* {tags.map((tag) => (
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
                ))} */}
              </ScrollArea>
            </TabsContent>
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
              {/* {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between py-2"
                >
                  <span>{tag}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExistingTag(tag)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))} */}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
