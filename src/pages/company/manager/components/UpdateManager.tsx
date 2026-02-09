import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User } from 'lucide-react';
import axiosInstance from '@/lib/axios';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { convertToLowerCase } from '@/lib/utils';

// Schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional().or(z.literal('')),
  authorized: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateCreatorProps {
  creatorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export default function UpdateCreator({ 
  creatorId, 
  open, 
  onOpenChange, 
  onUserUpdated 
}: UpdateCreatorProps) {
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      authorized: false,
    },
  });

  const { isSubmitting } = form.formState;

  // Fetch Data on Open
  useEffect(() => {
    if (open && creatorId) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const res = await axiosInstance.get(`/users/${creatorId}`);
          const userData = res.data.data;
          
          form.reset({
            name: userData.name || '',
            email: userData.email || '',
            password: '', 
            authorized: userData.authorized || false,
          });
        } catch (error) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Error fetching creator details',
          });
          onOpenChange(false);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, creatorId, form, onOpenChange, toast]);

  const onSubmit = async (values: FormValues) => {
    if (!creatorId) return;

    const payload: any = {
      name: values.name,
      email: convertToLowerCase(values.email),
      isValided: values.authorized,
      authorized: values.authorized,
    };

    if (values.password && values.password.length >= 6) {
      payload.password = values.password;
    }

    try {
      await axiosInstance.patch(`/users/${creatorId}`, payload);
      
      toast({
        title: 'Success',
        description: 'Creator details updated successfully.',
        variant: 'default',
      });

      onOpenChange(false);
      onUserUpdated();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Could not update creator details.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Edit Creator
          </DialogTitle>
          <DialogDescription>
            Update the creator details below.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 w-full">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        disabled={isSubmitting} 
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        {...field} 
                        disabled={isSubmitting} 
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>New Password (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Leave blank to keep current" 
                        {...field} 
                        disabled={isSubmitting} 
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorized"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-300 p-4 w-full shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer text-sm font-medium">
                        Authorize Creator
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Grant this creator valid status and access.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 w-full sm:justify-end gap-2">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)} 
                    disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}