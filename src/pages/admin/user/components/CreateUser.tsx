import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, PlusCircle, User } from 'lucide-react';
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
  DialogTrigger,
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

// Redux & Utils
import { registerUser } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { convertToLowerCase } from '@/lib/utils';
import axiosInstance from '@/lib/axios';

// 1. Define Validation Schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  company: z.string().optional(),
  creator: z.string().optional(),
  authorized: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateUser({ onUserCreated }: { onUserCreated: () => void }) {
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  
  // Dropdown Data States (Formatted for react-select)
  const [companies, setCompanies] = useState<{ value: string; label: string }[]>([]);
  const [creators, setCreators] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);

  // 2. Initialize Form
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

  // 3. Fetch Companies on Mount (for Admin)
  useEffect(() => {
    const fetchCompanies = async () => {
      // Only fetch companies if user is Admin/Director
      if (user.role === 'admin' || user.role === 'director') {
        try {
          const res = await axiosInstance.get('/users?role=company&limit=1000&isDeleted=false');
          setCompanies(res.data.data.result.map((c: any) => ({ value: c._id, label: c.name })));
        } catch (error) {
          console.error("Failed to fetch companies", error);
        }
      } 
      // If user IS a company, set their ID immediately
      else if (user.role === 'company') {
        form.setValue('company', user._id);
        fetchCreators(user._id); // Auto-fetch their creators
      }
    };

    if (isOpen) {
        fetchCompanies();
    }
  }, [isOpen, user.role, user._id, form]);

  // 4. Fetch Creators when Company Changes
  const fetchCreators = async (companyId: string) => {
    if (!companyId) {
        setCreators([]);
        return;
    }
    setIsLoadingCreators(true);
    try {
      const res = await axiosInstance.get(`/users?role=creator&company=${companyId}&limit=1000`);
      setCreators(res.data.data.result.map((c: any) => ({ value: c._id, label: c.name })));
    } catch (error) {
      console.error("Failed to fetch creators", error);
      toast({ title: 'Failed to load managers', variant: 'destructive' });
    } finally {
      setIsLoadingCreators(false);
    }
  };

  const handleCompanyChange = (selectedOption: any) => {
    const companyId = selectedOption?.value || '';
    form.setValue('company', companyId);
    form.setValue('creator', ''); // Reset manager when company changes
    fetchCreators(companyId);
  };

  // 5. Handle Submission
  const onSubmit = async (values: FormValues) => {
    const payload: any = {
      ...values,
      role: 'user',
      email: convertToLowerCase(values.email),
      isValided: values.authorized,
      authorized: values.authorized,
    };

    // Ensure relationships are set correctly based on role
    if (user.role === 'company') {
        payload.company = user._id;
    }
    // If Admin selected a company via dropdown, it's already in `values.company`

    try {
      await dispatch(registerUser(payload)).unwrap();
      
      toast({
        title: 'Success',
        description: 'User account created successfully.',
        variant: 'default',
      });

      form.reset();
      setCompanies([]);
      setCreators([]);
      setIsOpen(false);
      onUserCreated(); 
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error?.message || 'This email might already be in use.',
      });
    }
  };

  const showCompanySelect = user.role === 'admin' || user.role === 'director';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      
      <DialogContent className=" overflow-y-auto max-h-[97vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Enter the credentials below to create a new user account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-full">
            
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
                            placeholder={isLoadingCreators ? "Loading..." : "Select a manager..."}
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
                        placeholder="user@example.com" 
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="******" 
                        type="password" 
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
                      Grant immediate valid status.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 w-full sm:justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}