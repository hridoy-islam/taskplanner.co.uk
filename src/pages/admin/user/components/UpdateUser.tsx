import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';
import Select from 'react-select'; // Using react-select

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
  company: z.string().optional(),
  creator: z.string().optional(),
  authorized: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateUserProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export default function UpdateUser({ 
  userId, 
  open, 
  onOpenChange, 
  onUserUpdated 
}: UpdateUserProps) {
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Dropdowns
  const [companies, setCompanies] = useState<{ value: string; label: string }[]>([]);
  const [creators, setCreators] = useState<{ value: string; label: string }[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      company: '',
      creator: '',
      authorized: false,
    },
  });

  const { isSubmitting } = form.formState;

  // 1. Fetch Companies (Admin only)
  useEffect(() => {
    const fetchCompanies = async () => {
      if (user.role === 'admin' || user.role === 'director') {
        try {
          const res = await axiosInstance.get('/users?role=company&limit=1000&isDeleted=false');
          setCompanies(res.data.data.result.map((c: any) => ({ value: c._id, label: c.name })));
        } catch (error) {
          console.error("Failed to fetch companies");
        }
      }
    };
    if (open) fetchCompanies();
  }, [open, user.role]);

  // 2. Fetch User Data & Populate
  useEffect(() => {
    if (open && userId) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          // Get User Data
          const res = await axiosInstance.get(`/users/${userId}`);
          const userData = res.data.data;
          
          const currentCompanyId = userData.company?._id || userData.company;
          const currentCreatorId = userData.creator?._id || userData.creator;

          form.reset({
            name: userData.name || '',
            email: userData.email || '',
            password: '', 
            company: currentCompanyId || '',
            creator: currentCreatorId || '',
            authorized: userData.authorized || false,
          });

          // If there is a company assigned, fetch its managers immediately so the dropdown populates
          if (currentCompanyId) {
             fetchCreators(currentCompanyId);
          } else if (user.role === 'company') {
             fetchCreators(user._id); // Auto-fetch if I am the company
          }

        } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'Error fetching details' });
          onOpenChange(false);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, userId, form, onOpenChange, toast, user.role, user._id]);

  // 3. Helper to Fetch Creators
  const fetchCreators = async (companyId: string) => {
    try {
      const res = await axiosInstance.get(`/users?role=creator&company=${companyId}&limit=1000`);
      setCreators(res.data.data.result.map((c: any) => ({ value: c._id, label: c.name })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompanyChange = (selectedOption: any) => {
    const companyId = selectedOption?.value || '';
    form.setValue('company', companyId);
    form.setValue('creator', ''); // Clear creator if company changes
    fetchCreators(companyId);
  };

  const onSubmit = async (values: FormValues) => {
    if (!userId) return;

    const payload: any = {
      name: values.name,
      email: convertToLowerCase(values.email),
      isValided: values.authorized,
      authorized: values.authorized,
      company: values.company,
      creator: values.creator
    };

    if (values.password && values.password.length >= 6) {
      payload.password = values.password;
    }

    try {
      await axiosInstance.patch(`/users/${userId}`, payload);
      toast({ title: 'Success', description: 'Updated successfully.' });
      onOpenChange(false);
      onUserUpdated();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Could not update user.',
      });
    }
  };

  const showCompanySelect = user.role === 'admin' || user.role === 'director';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto max-h-[97vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update the user details below.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 py-2 w-full">
              
               {/* --- Company Select (Admin Only) --- */}
               {showCompanySelect && (
                <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                    <FormItem className="w-full">
                    <FormLabel>Assign Company</FormLabel>
                    <FormControl>
                        <Select
                            options={companies}
                            value={companies.find((c) => c.value === field.value)}
                            onChange={(val) => handleCompanyChange(val)}
                            placeholder="Select a company..."
                            className="w-full text-sm"
                           
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}

            {/* --- Manager/Creator Select --- */}
            <FormField
              control={form.control}
              name="creator"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Assign Manager</FormLabel>
                   <FormControl>
                        <Select
                            options={creators}
                            value={creators.find((c) => c.value === field.value)}
                            onChange={(val) => field.onChange(val?.value)}
                            isDisabled={!form.getValues('company') && user.role !== 'company'}
                            placeholder="Select a manager..."
                            className="w-full text-sm"
                           
                        />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stacked Fields - No Grid */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem className="w-full">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input 
                            placeholder="Jane Doe" 
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
                            disabled 
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-input p-4 w-full shadow-sm">
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
                        Authorize User
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Grant this user valid status and access.
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