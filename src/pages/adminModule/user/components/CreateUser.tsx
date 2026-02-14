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
  // Company is now mandatory
  company: z.string().min(1, { message: 'Company is required.' }),
  // Role is now mandatory (enum ensures only specific values)
  role: z.enum(['creator', 'user'], { required_error: 'Role is required.' }),
  authorized: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

// Role Options for React-Select
const ROLE_OPTIONS = [
  { value: 'creator', label: 'Manager' }, // Maps to 'creator'
  { value: 'user', label: 'Staff' },      // Maps to 'user'
];

export default function CreateUser({ onUserCreated }: { onUserCreated: () => void }) {
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  
  // Dropdown Data States
  const [companies, setCompanies] = useState<{ value: string; label: string }[]>([]);

  // 2. Initialize Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      company: '',
      role: undefined, // undefined forces user to select
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
      // If logged-in user IS a company, set their ID immediately
      else if (user.role === 'company') {
        form.setValue('company', user._id);
      }
    };

    if (isOpen) {
        fetchCompanies();
    }
  }, [isOpen, user.role, user._id, form]);

  // 4. Handle Submission
  const onSubmit = async (values: FormValues) => {
    const payload: any = {
      ...values,
      role: values.role, // Use the selected role (creator/user)
      email: convertToLowerCase(values.email),
      isValided: values.authorized,
      authorized: values.authorized,
    };

    // Double check: If logged in as company, ensure company ID is strictly enforces
    if (user.role === 'company') {
        payload.company = user._id;
    }

    try {
      await dispatch(registerUser(payload)).unwrap();
      
      toast({
        title: 'Success',
        description: `User (${values.role === 'creator' ? 'Manager' : 'Staff'}) created successfully.`,
        variant: 'default',
      });

      form.reset();
      // Reset dropdown states if necessary, though react-hook-form handles values
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
      
      <DialogContent className="overflow-y-auto max-h-[97vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Assign a company and role (Manager or Staff) below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-full">
            
            {/* --- 1. Company Select (Mandatory for Admin, Hidden for Company) --- */}
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

            {/* --- 2. Role Select (Mandatory) --- */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Assign Role <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select
                      options={ROLE_OPTIONS}
                      value={ROLE_OPTIONS.find((r) => r.value === field.value)}
                      onChange={(val) => field.onChange(val?.value)}
                      placeholder="Select Role ..."
                      className="w-full text-sm"
                    />
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- 3. Standard Inputs --- */}
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem className="w-full">
                <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
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
                <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                    <Input 
                        placeholder="user@example.com" 
                        type="email" 
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
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="******" 
                        type="password" 
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
                      Grant immediate access to the platform.
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