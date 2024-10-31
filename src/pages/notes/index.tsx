// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader
// } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Plus } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useForm, SubmitHandler } from 'react-hook-form';
// import { useSelector } from 'react-redux';
// import axiosInstance from '../../lib/axios';
// import { useToast } from '@/components/ui/use-toast';
// import { CellAction } from '@/components/shared/CellAction';

// type Inputs = {
//   title: string;
//   content: string;
//   author?: string;
// };

// const noteFields = [
//   { name: 'title', type: 'text', placeholder: 'Note Title' },
//   { name: 'content', type: 'textarea', placeholder: 'Note Content' }
// ];

// export default function NotesPage() {
//   const { toast } = useToast();
//   const { register, handleSubmit, reset } = useForm<Inputs>();
//   const [notes, setNotes] = useState([]);
//   const { user } = useSelector((state: any) => state.auth);

//   const fetchNotes = async () => {
//     const response = await axiosInstance.get(`/notes?author=${user?._id}`);
//     setNotes(response.data.data.result);
//   };

//   useEffect(() => {
//     fetchNotes();
//   }, [user]);

//   const onSubmit: SubmitHandler<Inputs> = async (data) => {
//     data.author = user?._id;
//     const response = await axiosInstance.post('/notes', data);
//     if (response.data.success) {
//       reset(),
//         toast({
//           title: 'Note Created Successfully'
//         });
//       fetchNotes();
//     } else {
//       toast({
//         title: 'Something Went Wrong',
//         variant: 'destructive'
//       });
//     }
//   };
//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="mb-4 text-2xl font-bold">My Notes</h1>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Card className="mb-4">
//           <CardHeader>
//             <Input
//               placeholder="Title"
//               {...register('title', { required: true })}
//               className="mb-2"
//             />
//           </CardHeader>
//           <CardContent>
//             <Textarea
//               placeholder="Take a note..."
//               {...register('content', { required: true })}
//               rows={3}
//             />
//           </CardContent>
//           <CardFooter>
//             <Button type="submit" variant={'outline'}>
//               <Plus className="mr-2 h-4 w-4" /> Add Note
//             </Button>
//           </CardFooter>
//         </Card>
//       </form>
//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//         {notes.map((note: any) => (
//           <Card key={note._id}>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <h2 className="font-semibold">{note?.title}</h2>
//               <CellAction
//                 data={note}
//                 endpoint="/notes"
//                 entityName="Note"
//                 onDelete={fetchNotes}
//                 fields={noteFields}
//               />
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm">{note.content}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Pencil, Trash2 } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newTag, setNewTag] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editedTagName, setEditedTagName] = useState('');
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  const pageSize = 5;

  const addOrUpdateNote = () => {
    if (title && content) {
      if (editingNote) {
        const updatedNotes = notes.map((note) =>
          note.id === editingNote.id
            ? { ...note, title, content, tags: selectedTags }
            : note
        );
        setNotes(updatedNotes);
      } else {
        const newNote: Note = {
          id: Date.now(),
          title,
          content,
          tags: selectedTags
        };
        setNotes([...notes, newNote]);
      }
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setEditingNote(null);
      setIsNoteModalOpen(false);
    }
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSelectedTags(note.tags);
    setIsNoteModalOpen(true);
  };

  const addTag = () => {
    if (newTag && !allTags.includes(newTag)) {
      setAllTags([...allTags, newTag]);
      setNewTag('');
    }
  };

  const startEditingTag = (tag: string) => {
    setEditingTag(tag);
    setEditedTagName(tag);
  };

  const saveEditedTag = () => {
    if (editingTag && editedTagName && !allTags.includes(editedTagName)) {
      setAllTags(
        allTags.map((tag) => (tag === editingTag ? editedTagName : tag))
      );
      setNotes(
        notes.map((note) => ({
          ...note,
          tags: note.tags.map((tag) =>
            tag === editingTag ? editedTagName : tag
          )
        }))
      );
      setEditingTag(null);
    }
  };

  const confirmDeleteTag = (tag: string) => {
    setTagToDelete(tag);
  };

  const deleteTag = () => {
    if (tagToDelete) {
      setAllTags(allTags.filter((tag) => tag !== tagToDelete));
      setNotes(notes.filter((note) => !note.tags.includes(tagToDelete)));
      setTagToDelete(null);
    }
  };

  const filteredNotes = notes
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
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
      }
    });

  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pageCount = Math.ceil(filteredNotes.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, sortBy, sortOrder]);

  return (
    <div className="container mx-auto flex p-4">
      <aside className="w-64 pr-4">
        <h2 className="mb-2 text-xl font-semibold">Tags</h2>
        <div className="mb-4 flex flex-col gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={filter === tag ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setFilter(filter === tag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <Button variant={'outline'} onClick={() => setIsTagModalOpen(true)}>
          Manage Tags
        </Button>
      </aside>

      <main className="flex-1">
        <h1 className="mb-4 text-2xl font-bold">Note</h1>

        <div className="mb-4 flex justify-between gap-2">
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-3xl"
          />
          <Select
            value={sortBy}
            onValueChange={(value: 'title' | 'id') => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="id">Date</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={'outline'}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
          <Button variant={'outline'} onClick={() => setIsNoteModalOpen(true)}>
            Add Note
          </Button>
        </div>

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell>{note.title}</TableCell>
                    <TableCell>{note.content.substring(0, 50)}...</TableCell>
                    <TableCell>
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="mr-1">
                          {tag}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" onClick={() => editNote(note)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>

        <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Note Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div>
                <Label>Tags</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          setSelectedTags(
                            checked
                              ? [...selectedTags, tag]
                              : selectedTags.filter((t) => t !== tag)
                          );
                        }}
                      />
                      <Label htmlFor={tag}>{tag}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addOrUpdateNote}>
                {editingNote ? 'Update' : 'Add'} Note
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
                />
                <Button onClick={addTag}>Add Tag</Button>
              </div>
              <div className="space-y-2">
                {allTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2">
                    {editingTag === tag ? (
                      <>
                        <Input
                          value={editedTagName}
                          onChange={(e) => setEditedTagName(e.target.value)}
                        />
                        <Button onClick={saveEditedTag}>Save</Button>
                      </>
                    ) : (
                      <>
                        <Badge variant="outline">{tag}</Badge>
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
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the tag "{tagToDelete}" and all
                notes associated with it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteTag}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
