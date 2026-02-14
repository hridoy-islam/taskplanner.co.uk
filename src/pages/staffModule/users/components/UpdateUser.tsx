import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';
import Select from 'react-select'; 
import { convertToLowerCase } from '@/lib/utils';

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

// 1. Define Validation Schema (Role removed)
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional().or(z.literal('')),
  company: z.string().min(1, { message: 'Company is required.' }),
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
  
  // Dropdown Data
  const [companies, setCompanies] = useState<{ value: string; label: string }[]>([]);
  
  // 2. Initialize Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      company: '',
      authorized: false,
    },
  });

  const { isSubmitting } = form.formState;

  // 3. Fetch Companies (Admin only)
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

  // 4. Fetch User Data & Populate Form
  useEffect(() => {
    if (open && userId) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const res = await axiosInstance.get(`/users/${userId}`);
          const userData = res.data.data;
          
          const currentCompanyId = userData.company?._id || userData.company;

          form.reset({
            name: userData.name || '',
            email: userData.email || '',
            password: '', // Always reset password field
            company: currentCompanyId || '',
            authorized: userData.authorized || false,
          });

          // Handle case where logged-in user is a Company (ensure ID matches)
          if (user.role === 'company') {
             form.setValue('company', user._id);
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

  // 5. Handle Submission
  const onSubmit = async (values: FormValues) => {
    if (!userId) return;

    const payload: any = {
      name: values.name,
      email: convertToLowerCase(values.email),
      role: 'user', // Hardcoded role to match CreateUser logic
      isValided: values.authorized,
      authorized: values.authorized,
      company: values.company,
    };

    // Only add password if user typed one
    if (values.password && values.password.length >= 6) {
      payload.password = values.password;
    }

    // Security: If logged-in user is 'company', force their ID
    if (user.role === 'company') {
        payload.company = user._id;
    }

    try {
      await axiosInstance.patch(`/users/${userId}`, payload);
      
      toast({ 
        title: 'Success', 
        description: `User updated successfully.` 
      });
      
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
            Edit Staff
          </DialogTitle>
          <DialogDescription>
            Update company or personal details below.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 py-2 w-full">
              
              {/* --- 1. Company Select (Admin Only) --- */}
              {showCompanySelect && (
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Assign Company <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Select
                          options={companies}
                          value={companies.find((c) => c.value === field.value)}
                          onChange={(val) => field.onChange(val?.value)}
                          placeholder="Select a company..."
                          className="w-full text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* --- 2. Standard Inputs --- */}
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
                        // Usually emails are immutable in update forms unless backend handles verification
                        disabled={true} 
                        className="bg-gray-100"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                        Email cannot be changed directly.
                    </FormDescription>
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