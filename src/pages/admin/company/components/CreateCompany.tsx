import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';
import { Loader2, PlusCircle, Building2 } from 'lucide-react';

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

// 1. Define Validation Schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  authorized: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateCompany({ onUserCreated }: { onUserCreated: () => void }) {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  
  // 2. Initialize Form
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

  // 3. Handle Submission
  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      role: 'company',
      email: convertToLowerCase(values.email),
      isValided: values.authorized,
      authorized: values.authorized,
    };

    try {
      await dispatch(registerUser(payload)).unwrap();
      
      toast({
        title: 'Success',
        description: 'Company account created successfully.',
        variant: 'default',
      });

      form.reset();
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Company
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            Create New Company
          </DialogTitle>
          <DialogDescription>
            Enter the credentials below to create a new company account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 w-full">
            
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="Acme Inc." 
                        className="w-full" 
                        {...field} 
                        disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="contact@company.com" 
                        type="email" 
                        className="w-full" 
                        {...field} 
                        disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
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
                        className="w-full" 
                        {...field} 
                        disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Authorized Checkbox */}
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
                      Pre-Authorize Company
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Immediately grant this company valid status and access.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 w-full sm:justify-end gap-2">
              <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)} 
                  disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Company'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}