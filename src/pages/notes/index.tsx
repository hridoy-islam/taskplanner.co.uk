// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import axiosInstance from '../../lib/axios'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter
// } from '@/components/ui/dialog';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Label } from '@/components/ui/label';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle
// } from '@/components/ui/alert-dialog';
// import { Pencil, Trash2 } from 'lucide-react';
// import { useSelector } from 'react-redux';
// import { toast } from '@/components/ui/use-toast';

// interface Note {
//   _id: string;
//   title: string;
//   content: string;
//   tags: string[];
// }

// interface Tags {
//   author:{
//     name : string
//   }
//   name: string
//   _id: string
// }

// export default function NotesPage() {
//   const { user } = useSelector((state: any) => state.auth);
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [selectedTags, setSelectedTags] = useState<string[]>([]);
//   const [filter, setFilter] = useState<string | null>(null);
//   const [search, setSearch] = useState('');
//   const [sortBy, setSortBy] = useState<'title' | 'id'>('id');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
//   const [isTagModalOpen, setIsTagModalOpen] = useState(false);
//   const [editingNote, setEditingNote] = useState<Note | null>(null);
//   const [newTag, setNewTag] = useState('');
//   const [allTags, setAllTags] = useState<Tags[]>([]);
//   const [editingTag, setEditingTag] = useState<Tags | null>(null);
//   const [editedTagName, setEditedTagName] = useState('');
//   const [tagToDelete, setTagToDelete] = useState<Tags | null>(null);

//   const filteredNotes = notes
//     .filter((note) => (filter ? note.tags.includes(filter) : true))
//     .filter(
//       (note) =>
//         note.title.toLowerCase().includes(search.toLowerCase()) ||
//         note.content.toLowerCase().includes(search.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === 'title') {
//         return sortOrder === 'asc'
//           ? a.title.localeCompare(b.title)
//           : b.title.localeCompare(a.title);
//       } else {
//         return sortOrder === 'asc' ? a._id - b._id : b._id - a._id;
//       }
//     });

//   const fetchTags = async () => {
//     const res = await axiosInstance.get(`/tags?author=${user?._id}`);
//     setAllTags(res.data.data.result);
//   };
//   const fetchNotes = async () => {
//     const res = await axiosInstance.get(`/notes?author=${user?._id}`);
//     setNotes(res.data.data.result);
//   };

//   useEffect(() => {
//     fetchTags();
//     fetchNotes();
//   }, [user]);

//   const addOrUpdateNote = async () => {
//     if (title && content) {
//       if (editingNote) {
//         // Update existing note
//         const updatedNote = { ...editingNote, title, content, tags: selectedTags };
//         await axiosInstance.put(`/notes/${editingNote._id}`, updatedNote);
//         setNotes((prevNotes) => prevNotes.map(note => (note._id === editingNote._id ? updatedNote : note)));
//       } else {
//         // Add new note
//         const newNote = { id: Date.now(), title, content, tags: selectedTags };
//         await axiosInstance.post('/notes', newNote);
//         setNotes((prevNotes) => [...prevNotes, newNote]);
//       }
//       resetNoteForm();
//     }
//   };

//   const resetNoteForm = () => {
//     setTitle('');
//     setContent('');
//     setSelectedTags([]);
//     setEditingNote(null);
//     setIsNoteModalOpen(false);
//   };

//   const editNote = (note: Note) => {
//     setEditingNote(note);
//     setTitle(note.title);
//     setContent(note.content);
//     setSelectedTags(note.tags);
//     setIsNoteModalOpen(true);
//   };

//   const deleteNote = async (noteId: string) => {
//     await axiosInstance.delete(`/notes/${noteId}`);
//     setNotes((prevNotes) => prevNotes.filter(note => note._id !== noteId));
//     toast({ title: "Note Deleted Successfully!" });
//   };

//   const addTag = async () => {
//     if (newTag.trim() && !allTags.some(tag => tag.name === newTag)) {
//       const data = { author: user?._id, name: newTag };
//       const res = await axiosInstance.post('/tags', data);
//       if (res.data.success) {
//         setAllTags([...allTags, { _id: res.data.data._id, name: newTag, author: { name: user.name }}]);
//         toast({ title: "Tag Added Successfully!", description: "Thank You" });
//         setNewTag('');
//       }
//     }
//   };

//   const startEditingTag = (tag: Tags) => {
//     setEditingTag(tag);
//     setEditedTagName(tag.name);
//   };

//   const saveEditedTag = async () => {
//     if (editingTag && editedTagName.trim() && !allTags.some(tag => tag.name === editedTagName)) {
//       const data = { name: editedTagName };
//       const res = await axiosInstance.patch(`/tags/${editingTag._id}`, data);
//       if (res.data.success) {
//         setAllTags(allTags.map(tag => (tag._id === editingTag._id ? { ...tag, name: editedTagName } : tag)));
//         setEditingTag(null);
//         setEditedTagName('');
//         toast({title: 'Tag Updated Successfully'})
//       }
//     }
//   };

//   const confirmDeleteTag = (tag: Tags) => {
//     setTagToDelete(tag);
//   };

//   const deleteTag = async () => {
//     if (tagToDelete) {
//       const res = await axiosInstance.delete(`/tags/${tagToDelete._id}`);
//       if (res.data.success) {
//         setAllTags(allTags.filter(tag => tag._id !== tagToDelete._id));
//         setNotes(notes.filter(note => !note.tags.includes(tagToDelete._id))); // assuming tag ids are used in notes
//         setTagToDelete(null);
//         toast({ title: "Tag Deleted Successfully!" });
//       }
//     }
//   };

//   return (
//     <div className="container mx-auto flex p-4">
//       <aside className="w-64 pr-4">
//         <h2 className="mb-2 text-xl font-semibold">Tags</h2>
//         <div className="mb-4 flex flex-col gap-2">
//           {allTags.map((tag, idx) => (
//             <Badge
//               key={idx}
//               //variant={filter === tag ? 'default' : 'secondary'}
//               className="cursor-pointer"
//               // onClick={() => setFilter(filter === tag ? null : tag)}
//             >
//               {tag.name}
//             </Badge>
//           ))}
//         </div>
//         <Button variant={'outline'} onClick={() => setIsTagModalOpen(true)}>
//           Manage Tags
//         </Button>
//       </aside>

//       <main className="flex-1">
//         <h1 className="mb-4 text-2xl font-bold">Note</h1>

//         <div className="mb-4 flex justify-between gap-2">
//           <Input
//             placeholder="Search notes..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="max-w-3xl"
//           />
//           <Select
//             value={sortBy}
//             onValueChange={(value: 'title' | 'id') => setSortBy(value)}
//           >
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Sort by" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="title">Title</SelectItem>
//               <SelectItem value="id">Date</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button
//             variant={'outline'}
//             onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
//           >
//             {sortOrder === 'asc' ? '↑' : '↓'}
//           </Button>
//           <Button variant={'outline'} onClick={() => setIsNoteModalOpen(true)}>
//             Add Note
//           </Button>
//         </div>

//         <Card>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Title</TableHead>
//                   <TableHead>Content</TableHead>
//                   <TableHead>Tags</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//               {notes.map((note) => (
//                   <TableRow key={note._id}>
//                     <TableCell>{note.title}</TableCell>
//                     <TableCell>{note.content.substring(0, 50)}...</TableCell>

//                     <TableCell>

//                     </TableCell>
//                     <TableCell className='flex gap-2'>
//                     <Button variant="outline" onClick={() => editNote(note)}>
//                         Edit
//                       </Button>
//                     <Button variant="outline" onClick={() => deleteNote(note?._id)}>

//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </TableCell>

//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>

//         <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>
//                 {editingNote ? 'Edit Note' : 'Add New Note'}
//               </DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <Input
//                 placeholder="Note Title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//               />
//               <Textarea
//                 placeholder="Note Content"
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//               />
//               <div>
//                 <Label>Tags</Label>
//                 <div className="mt-2 flex flex-wrap gap-2">
//                   {allTags.map((tag, idx) => (
//                     <div key={idx} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={tag?._id}
//                       />
//                       <Label>{tag?.name}</Label>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button onClick={addOrUpdateNote}>
//                 {editingNote ? 'Update' : 'Add'} Note
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Manage Tags</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div className="flex gap-2">
//                 <Input
//                   placeholder="New Tag"
//                   value={newTag}
//                   onChange={(e) => setNewTag(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') {
//                       addTag()
//                     }
//                   }}
//                 />
//                 <Button variant={'outline'} onClick={addTag}>Add Tag</Button>
//               </div>
//               <div className="space-y-2">
//                 {allTags.map((tag, idx) => (
//                   <div key={idx} className="flex items-center gap-2">
//                     {editingTag?._id === tag._id ? (
//                       <>
//                         <Input
//                           value={editedTagName}
//                           onChange={(e) => setEditedTagName(e.target.value)}
//                           onKeyDown={(e) => {
//                             if (e.key === 'Enter') {
//                               saveEditedTag(); // Call the add tag function on Enter
//                             }
//                           }}
//                         />
//                         <Button variant={'outline'} onClick={saveEditedTag}>Save</Button>
//                       </>
//                     ) : (
//                       <>
//                         <Badge>{tag?.name}</Badge>
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           onClick={() => startEditingTag(tag)}
//                         >
//                           <Pencil className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           onClick={() => confirmDeleteTag(tag)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>

//         <AlertDialog
//           open={!!tagToDelete}
//           onOpenChange={() => setTagToDelete(null)}
//         >
//           <AlertDialogContent>
//             <AlertDialogHeader>
//               <AlertDialogTitle className='text-primary'>Are you sure?</AlertDialogTitle>
//               <AlertDialogDescription className='text-primary'>
//                 This will permanently delete the tag <b>"{tagToDelete?.name}"</b> and all
//                 notes associated with it.
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel>Cancel</AlertDialogCancel>
//               <AlertDialogAction onClick={deleteTag}>Delete</AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       </main>
//     </div>
//   );
// }

export default function NotesPage() {
  return <>comming soon</>;
}
