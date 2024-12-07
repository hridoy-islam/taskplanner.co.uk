import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axiosInstance from '../../lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
}

interface Tags {
  author: {
    name: string;
  };
  name: string;
  _id: string;
}

export default function NotesPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [notes, setNotes] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [editedTagName, setEditedTagName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [newSharedUser, setNewSharedUser] = useState('');
  const [activeTab, setActiveTab] = useState('my-notes');
  const [tagToDelete, setTagToDelete] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember2, setSelectedMember2] = useState<number | null>(null);
  const [initialMembers, setInitialMembers] = useState([]);

  const fetchTags = async () => {
    const res = await axiosInstance.get(`/tags?author=${user?._id}`);
    setAllTags(res.data.data.result);
  };
  const fetchNotes = async () => {
    const res = await axiosInstance.get(`/notes?author=${user?._id}`);
    setNotes(res.data.data.result);
  };

  const fetchMembers = async () => {
    const response = await axiosInstance.get(`/users/company/${user?._id}`);
    setInitialMembers(response.data.data);
  };

  useEffect(() => {
    fetchTags();
    fetchNotes();
    fetchMembers();
  }, [user]);

  const filteredNotes = notes
    .filter((note) =>
      activeTab === 'shared-notes' ? note.isSharedWithMe : !note.isSharedWithMe
    )
    .filter((note) => (filter ? note.tags.includes(filter) : true))
    .filter(
      (note) =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        return sortOrder === 'asc'
          ? a._id.localeCompare(b._id)
          : b._id.localeCompare(a._id);
      }
    });

  const addTag = async () => {
    if (newTag.trim() && !allTags.some((tag) => tag.name === newTag)) {
      const data = { author: user?._id, name: newTag };
      const res = await axiosInstance.post('/tags', data);
      if (res.data.success) {
        setAllTags([
          ...allTags,
          { _id: res.data.data._id, name: newTag, author: { name: user.name } }
        ]);
        toast({ title: 'Tag Added Successfully!', description: 'Thank You' });
        setNewTag('');
      }
    }
  };

  const addSharedUser = () => {
    // Demo function to simulate adding a shared user
    if (newSharedUser.trim() && editingNote) {
      const updatedNote = {
        ...editingNote,
        sharedUsers: [
          ...editingNote.sharedUsers,
          {
            _id: `u${editingNote.sharedUsers.length + 1}`,
            name: newSharedUser,
            email: `${newSharedUser.toLowerCase()}@example.com`
          }
        ]
      };
      setEditingNote(updatedNote);
      setNewSharedUser('');
    }
  };

  const removeSharedUser = (userId) => {
    // Demo function to simulate removing a shared user
    if (editingNote) {
      const updatedNote = {
        ...editingNote,
        sharedUsers: editingNote.sharedUsers.filter(
          (user) => user._id !== userId
        )
      };
      setEditingNote(updatedNote);
    }
  };

  const startEditingTag = (tag) => {
    setEditingTag(tag);
    setEditedTagName(tag.name);
  };

  const saveEditedTag = async () => {
    if (
      editingTag &&
      editedTagName.trim() &&
      !allTags.some((tag) => tag.name === editedTagName)
    ) {
      const data = { name: editedTagName };
      const res = await axiosInstance.patch(`/tags/${editingTag._id}`, data);
      if (res.data.success) {
        setAllTags(
          allTags.map((tag) =>
            tag._id === editingTag._id ? { ...tag, name: editedTagName } : tag
          )
        );
        setEditingTag(null);
        setEditedTagName('');
        toast({ title: 'Tag Updated Successfully' });
      }
    }
  };

  const confirmDeleteTag = (tag) => {
    setTagToDelete(tag);
  };

  const deleteTag = async () => {
    if (tagToDelete) {
      try {
        const res = await axiosInstance.delete(`/tags/${tagToDelete._id}`);
        if (res.data.success) {
          // Remove tag from the tag list
          setAllTags(allTags.filter((tag) => tag._id !== tagToDelete._id));

          // Remove the deleted tag from all notes
          setNotes((prevNotes) =>
            prevNotes.map((note) => ({
              ...note,
              tags: note.tags.filter((tag) => tag !== tagToDelete.name)
            }))
          );

          // Clear the `tagToDelete` state
          setTagToDelete(null);

          toast({ title: 'Tag Deleted Successfully!' });
        } else {
          throw new Error(res.data.message || 'Failed to delete tag.');
        }
      } catch (error) {
        console.error('Error deleting tag:', error);
        toast({
          title: 'Error Deleting Tag',
          description: error.message || 'An unknown error occurred.',
          variant: 'destructive'
        });
      }
    }
  };

  const addOrUpdateNote = async () => {
    console.log('Function triggered', title, content);
    if (title && content) {
      if (editingNote) {
        // Update existing note
        const updatedNote = {
          ...editingNote,
          title,
          content,
          tags: selectedTags
        };
        await axiosInstance.put(`/notes/${editingNote._id}`, updatedNote);
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === editingNote._id ? updatedNote : note
          )
        );
      } else {
        // Add new note
        const newNote = { id: Date.now(), title, content, tags: selectedTags };
        await axiosInstance.post('/notes', newNote);
        setNotes((prevNotes) => [...prevNotes, newNote]);
      }
      resetNoteForm();
    }
  };

  const resetNoteForm = () => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setEditingNote(null);
    setIsNoteModalOpen(false);
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSelectedTags(note.tags);
    setIsNoteModalOpen(true);
  };

  const deleteNote = async (noteId: string) => {
    await axiosInstance.delete(`/notes/${noteId}`);
    setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
    toast({ title: 'Note Deleted Successfully!' });
  };

  const filteredMembers = initialMembers.filter((member) =>
    member?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="id">Date</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
          <Button
            variant={'outline'}
            onClick={() => {
              setEditingNote({
                title: '',
                content: '',
                tags: [],
                sharedUsers: []
              });
              setIsNoteDialogOpen(true);
            }}
          >
            Add Note
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-2">
              {allTags.map((tag, idx) => (
                <Badge
                  key={idx}
                  //variant={filter === tag ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  // onClick={() => setFilter(filter === tag ? null : tag)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <Button variant="outline" onClick={() => setIsTagModalOpen(true)}>
              Manage Tags
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mt-2 grid w-full grid-cols-2">
                <TabsTrigger value="my-notes" className="bg-gray-200">
                  My Notes
                </TabsTrigger>
                <TabsTrigger value="shared-notes" className="bg-gray-200">
                  Shared Notes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="my-notes">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Shared With</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotes.map((note) => (
                      <TableRow key={note._id}>
                        <TableCell>{note.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {note.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {note.sharedUsers.map((user) => (
                              <Avatar
                                key={user._id}
                                className="h-6 w-6 border-2 border-background"
                              >
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingNote(note);
                                setIsNoteDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteNote(note._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="shared-notes">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Shared By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotes.map((note) => (
                      <TableRow key={note._id}>
                        <TableCell>{note.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {note.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {note.sharedUsers[0]?.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{note.sharedUsers[0]?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingNote(note);
                              setIsNoteDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingNote?._id ? 'Edit Note' : 'Add New Note'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 space-y-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Note Title"
                  value={editingNote?.title || ''}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Note Content"
                  value={editingNote?.content || ''}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, content: e.target.value })
                  }
                  className="min-h-[300px]"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Tags</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <div key={tag._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag._id}
                        checked={editingNote?.tags?.includes(tag.name)}
                        onCheckedChange={(checked) => {
                          const updatedTags = checked
                            ? [...(editingNote?.tags || []), tag.name]
                            : (editingNote?.tags || []).filter(
                                (t) => t !== tag.name
                              );
                          setEditingNote({ ...editingNote, tags: updatedTags });
                        }}
                      />
                      <Label htmlFor={tag._id}>{tag.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              {!editingNote?.isSharedWithMe && (
                <div>
                  <Label>Shared Users</Label>
                  <div className="mt-2 space-y-2">
                    {editingNote?.sharedUsers?.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSharedUser(user._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

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
                          <p className="text-sm text-gray-500">
                            No members found.
                          </p>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addOrUpdateNote}>
              {editingNote?._id ? 'Update' : 'Add'} Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTag();
                  }
                }}
              />
              <Button variant="outline" onClick={addTag}>
                Add Tag
              </Button>
            </div>
            <div className="space-y-2">
              {allTags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {editingTag?._id === tag._id ? (
                    <>
                      <Input
                        value={editedTagName}
                        onChange={(e) => setEditedTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveEditedTag(); // Call the add tag function on Enter
                          }
                        }}
                      />
                      <Button variant={'outline'} onClick={saveEditedTag}>
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge>{tag?.name}</Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditingTag(tag)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => confirmDeleteTag(tag)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!tagToDelete}
        onOpenChange={() => setTagToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription className="text-primary">
              Are you sure you want to delete the tag{' '}
              <strong>{tagToDelete?.name}</strong>? This action cannot be
              undone, and all notes using this tag will be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTagToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={deleteTag}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
