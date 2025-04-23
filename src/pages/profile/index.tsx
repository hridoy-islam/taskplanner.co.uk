'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import type { OutputFileEntry } from '@uploadcare/react-uploader';
import { fetchUsers } from '@/redux/features/userSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { ImageUploader } from './components/userImage-uploader';
import { Card } from '@/components/ui/card';
import { Camera, Search } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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

const profileFormSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email({ message: 'Enter a valid email address' }),
  address: z.string().optional(),
  phone: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: any) => state.auth);
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(
    null
  );
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [files, setFiles] = useState<OutputFileEntry<'success'>[]>([]);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const { toast } = useToast();

  const defaultValues: Partial<ProfileFormValues> = {
    name: profileData?.name || '',
    email: profileData?.email || '',
    address: profileData?.address || '',
    phone: profileData?.phone || ''
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange'
  });

  const userId = user?._id;

  const fetchProfileData = async () => {
    try {
      const response = await dispatch(fetchUsers(user?._id));

      if (fetchUsers.fulfilled.match(response)) {
        const data = response.payload;
        setProfileData(data);
        form.reset(data);
      } else {
        console.error('Error fetching users:', response.payload);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
    const interval = setInterval(() => {
      fetchProfileData();
    }, 10000);

    return () => clearInterval(interval);
  }, [userId, dispatch]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const updatedData = {
        ...data
      };

      await axiosInstance.patch(`/users/${userId}`, updatedData);
      toast({
        title: 'Profile Updated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  const handleUploadComplete = (data: any) => {
    setIsImageUploaderOpen(false);
    fetchProfileData();
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-6 overflow-y-auto bg-gradient-to-br p-4 md:flex-row md:px-8">
      {/* Left Card - Profile */}
      <Card className="h-[80vh] w-full overflow-y-auto rounded-3xl p-8 shadow-lg md:w-2/5">
        <div className="flex flex-col items-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-col items-center justify-center gap-2 "
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
                        .map((n) => n[0])
                        .join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* This div is now relative to Avatar */}
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
                        className=" w-full rounded-none border-0 border-b shadow-none"
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
                        className=" w-full rounded-none border-0 border-b shadow-none"
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
                        className=" w-full rounded-none border-0 border-b shadow-none"
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
                        className=" w-full rounded-none border-0 border-b shadow-none"
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

      {/* Right Column - Accounts and Bills */}
      <div className="w-full space-y-6 md:w-3/5">
        {/* xPay Accounts Card */}
        <Card className="rounded-3xl p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">My accounts</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Active account</p>
                <p className="text-sm text-gray-400">8245 5698 1234 4325</p>
              </div>
              <Button className="rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600">
                Block Account
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Blocked account</p>
                <p className="text-sm text-gray-400">7523 4598 1254 3698</p>
              </div>
              <Button className="rounded-full bg-gradient-to-r from-lime-400 to-lime-500 text-white hover:from-lime-500 hover:to-lime-600">
                Unblock account
              </Button>
            </div>
          </div>
        </Card>

        {/* Bills Card */}
        <Card className="rounded-3xl p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">My bills</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <p>Phone bill</p>
              </div>
              <Button className="rounded-full bg-gradient-to-r from-lime-400 to-lime-500 px-4 text-xs text-white hover:from-lime-500 hover:to-lime-600">
                Bill paid
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <p>Internet bill</p>
              </div>
              <Button className="rounded-full bg-gradient-to-r from-pink-400 to-pink-500 px-4 text-xs text-white hover:from-pink-500 hover:to-pink-600">
                Not paid
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <p>House rent</p>
              </div>
              <Button className="rounded-full bg-gradient-to-r from-lime-400 to-lime-500 px-4 text-xs text-white hover:from-lime-500 hover:to-lime-600">
                Bill paid
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <p>Income tax</p>
              </div>
              <Button className="rounded-full bg-gradient-to-r from-lime-400 to-lime-500 px-4 text-xs text-white hover:from-lime-500 hover:to-lime-600">
                Bill paid
              </Button>
            </div>
          </div>
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
