import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { registerUser } from '@/redux/features/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { useToast } from '@/components/ui/use-toast';
import { convertToLowerCase } from '@/lib/utils';
import { fetchUserProfile } from '@/redux/features/profileSlice';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import axiosInstance from "@/lib/axios"
// --- Zod Schema ---
const createUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.string().min(1, { message: 'Role is required' }),
  authorized: z.boolean().optional(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const roleOptions = [
  { value: 'user', label: 'Staff' },
  { value: 'creator', label: 'Manager' }, // Assuming 'creator' maps to Manager logic
];

export default function CreateUser({ onUserCreated }: { onUserCreated: () => void }) {
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { profileData } = useSelector((state: any) => state.profile);

  // --- Form Setup ---
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: '', // Default empty, user must select
      authorized: false,
    },
  });

  const onCompanySubmit = async (data: any) => {
    const payload = { ...data };
    
    payload.email = convertToLowerCase(data.email);

    // Attach Company ID logic
    if (user?.role === 'company') {
      payload.company = user?._id;
    }
    if (user?.role === 'creator') {
      dispatch(fetchUserProfile(user?._id));
      payload.company = profileData.company;
    }

    // Handle Authorization logic
    if (payload.authorized) {
      payload.isValided = true;
      payload.authorized = true;
    } else {
      payload.isValided = false;
      payload.authorized = false;
    }

    setIsLoading(true);

    try {

     await axiosInstance.post(`/auth/signup`, payload);
      reset();
      onUserCreated();
      toast({
        title: 'User created successfully!',
      });
      setIsCompanyDialogOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data.message || 'Failed to create user. Email might exist.';
      toast({
        variant: 'destructive',
        title: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-0 flex items-center justify-between">
      <Dialog 
        open={isCompanyDialogOpen} 
        onOpenChange={(open) => {
            setIsCompanyDialogOpen(open);
            if (!open) reset(); // Reset validation state on close
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Staff
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Staff</DialogTitle>
           
          </DialogHeader>
          <form onSubmit={handleSubmit(onCompanySubmit)}>
            <div className="grid gap-4 py-4">
              
              {/* Name Field */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500">{errors.name.message}</span>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="name@example.com"
                  />
                  {errors.email && (
                    <span className="text-xs text-red-500">{errors.email.message}</span>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    className={errors.password ? 'border-red-500' : ''}
                    placeholder="******"
                  />
                  {errors.password && (
                    <span className="text-xs text-red-500">{errors.password.message}</span>
                  )}
                </div>
              </div>

              {/* Role Selection (React Select) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={roleOptions}
                        placeholder="Select Role"
                        value={roleOptions.find((c) => c.value === field.value)}
                        onChange={(val) => field.onChange(val?.value)}
                        styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '40px',
                              borderColor: errors.role ? '#ef4444' : '#e2e8f0',
                            }),
                        }}
                      />
                    )}
                  />
                  {errors.role && (
                    <span className="text-xs text-red-500">{errors.role.message}</span>
                  )}
                </div>
              </div>

              {/* Authorized Checkbox */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="authorized" className="text-right">
                  Authorized
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    type="checkbox"
                    id="authorized"
                    {...register('authorized')}
                    className="mr-2 h-5 w-5 accent-slate-900"
                  />
                  <span className="text-xs text-muted-foreground">Grant immediate access</span>
                </div>
              </div>

            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => { setIsCompanyDialogOpen(false); reset(); }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Staff'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}