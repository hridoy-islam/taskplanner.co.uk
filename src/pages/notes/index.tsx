import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { CellAction } from '@/components/shared/CellAction';

type Inputs = {
  title: string;
  content: string;
  author?: string;
};

const noteFields = [
  { name: 'title', type: 'text', placeholder: 'Note Title' },
  { name: 'content', type: 'textarea', placeholder: 'Note Content' }
];

export default function NotesPage() {
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<Inputs>();
  const [notes, setNotes] = useState([]);
  const { user } = useSelector((state: any) => state.auth);

  const fetchNotes = async () => {
    const response = await axiosInstance.get(`/notes?author=${user?._id}`);
    setNotes(response.data.data.result);
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    data.author = user?._id;
    const response = await axiosInstance.post('/notes', data);
    if (response.data.success) {
      reset(),
        toast({
          title: 'Note Created Successfully'
        });
      fetchNotes();
    } else {
      toast({
        title: 'Something Went Wrong',
        variant: 'destructive'
      });
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">My Notes</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-4">
          <CardHeader>
            <Input
              placeholder="Title"
              {...register('title', { required: true })}
              className="mb-2"
            />
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Take a note..."
              {...register('content', { required: true })}
              rows={3}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" variant={'outline'}>
              <Plus className="mr-2 h-4 w-4" /> Add Note
            </Button>
          </CardFooter>
        </Card>
      </form>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {notes.map((note: any) => (
          <Card key={note._id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h2 className="font-semibold">{note?.title}</h2>
              <CellAction
                data={note}
                endpoint="/notes"
                entityName="Note"
                onDelete={fetchNotes}
                fields={noteFields}
              />
            </CardHeader>
            <CardContent>
              <p className="text-sm">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
