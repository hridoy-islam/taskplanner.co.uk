'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import type { OutputFileEntry } from '@uploadcare/react-uploader';
import { fetchUsers } from '@/redux/features/userSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { ImageUploader } from './components/userImage-uploader';
import { Card } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// Password Change Schema
const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, 'Current password must be at least 6 characters'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

// Profile Form Schema
const profileFormSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email({ message: 'Enter a valid email address' }),
  address: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: any) => state.auth);
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(null);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const { toast } = useToast();

  // Password Form
  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Profile Form
  const defaultValues = useMemo(
    () => ({
      name: profileData?.name || '',
      email: profileData?.email || '',
      address: profileData?.address || '',
      phone: profileData?.phone || '',
      bio: profileData?.bio || ''
    }),
    [profileData]
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange'
  });

  // Reset form only when profileData changes initially or explicitly
  useEffect(() => {
    if (profileData && !form.formState.isDirty) {
      form.reset(defaultValues);
    }
  }, [defaultValues, profileData, form]);

  const userId = user?._id;

  // Fetch profile data on mount & periodically
  const fetchProfileData = async () => {
    try {
      const response = await dispatch(fetchUsers(user?._id));
      if (fetchUsers.fulfilled.match(response)) {
        const data = response.payload;
        setProfileData(data);
      } else {
        console.error('Error fetching users:', response.payload);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
    // Optional: Disable auto-refresh unless needed
    const interval = setInterval(() => {
      fetchProfileData();
    }, 10000);
    return () => clearInterval(interval);
  }, [userId, dispatch]);

  // Handle Password Change
  const handlePasswordChange = async (data: PasswordChangeValues) => {
    try {
      await axiosInstance.patch(`/auth/${user?._id}/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast({ title: 'Password changed successfully' });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (error) {
      toast({
        title: error.response?.data?.message || 'Please check your current password',
        className: 'destructive border-none text-white'
      });
    }
  };

  // Handle Profile Submit
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await axiosInstance.patch(`/users/${userId}`, data);
      toast({ title: 'Profile Updated' });
      fetchProfileData(); // Refresh after save
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  // Handle Image Upload
  const handleUploadComplete = (data: any) => {
    setIsImageUploaderOpen(false);
    fetchProfileData();
  };

  const hasBioChanges = form.watch('bio') !== profileData?.bio;

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-6 overflow-y-auto bg-gradient-to-br p-4 md:flex-row md:px-8">
      {/* Left Card - Profile */}
      <Card className="h-[80vh] w-full overflow-y-auto rounded-3xl p-8 shadow-lg md:w-2/5">
        <div className="flex flex-col items-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-col items-center justify-center gap-2"
            >
              {/* Avatar + Image Upload */}
              <div className="relative flex w-full flex-col items-center justify-start space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40">
                    <AvatarImage
                      src={profileData?.image}
                      alt="Profile picture"
                    />
                    <AvatarFallback>
                      {user?.name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0">
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div
                        onClick={() => setIsImageUploaderOpen(true)}
                        className="rounded-full bg-white p-2 shadow"
                      >
                        <Camera />
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full rounded-none border-0 border-b shadow-none focus-visible:ring-0"
                        placeholder="Enter Your Name..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full rounded-none border-0 border-b shadow-none focus-visible:ring-0"
                        placeholder="example@example.com"
                        disabled
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full rounded-none border-0 border-b shadow-none focus-visible:ring-0"
                        placeholder="Phone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full rounded-none border-0 border-b shadow-none focus-visible:ring-0"
                        placeholder="Enter Your Address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Submit */}
              <div className="flex w-full justify-end pt-4">
                <Button variant="outline" type="submit">
                  Update Profile
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>

      {/* Right Column - Accounts and Bio */}
      <div className="w-full space-y-6 md:w-3/5">
        {/* My Accounts Card */}
        <Card className="rounded-3xl p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">My accounts</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
              </div>
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter current password"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter new password"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm new password"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsPasswordDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Change Password</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* Bio Card */}
        <Card className="rounded-3xl p-6 shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold">Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-full rounded-lg border-0  p-2 h-64 resize-none"
                        placeholder="Tell us about yourself..."
                        rows={4}
                        {...field}
                       
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasBioChanges && (
                <div className="flex justify-end pt-4">
                  <Button type="submit">Update Bio</Button>
                </div>
              )}
            </form>
          </Form>
        </Card>
      </div>

      {/* Image Uploader Modal */}
      <ImageUploader
        open={isImageUploaderOpen}
        onOpenChange={setIsImageUploaderOpen}
        onUploadComplete={handleUploadComplete}
        entityId={user?._id}
      />
    </div>
  );
}