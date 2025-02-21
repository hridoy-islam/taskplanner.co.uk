import { z } from 'zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import PageHead from '@/components/shared/page-head';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axiosInstance from '../../lib/axios';
import { ImageUploader } from '@/components/shared/image-uploader';

import { useToast } from '@/components/ui/use-toast';
import { OutputFileEntry } from '@uploadcare/react-uploader';
import { fetchUsers } from '@/redux/features/userSlice';
import { useDispatch} from 'react-redux';
import { AppDispatch } from '@/redux/store';

const profileFormSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email({ message: 'Enter a valid email address' }),
  address: z.string().optional(),
  phone: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(
    null
  );
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [files, setFiles] = useState<OutputFileEntry<'success'>[]>([]);

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

  // const fetchProfileData = async () => {
  //   try {
  //     const response = await axiosInstance.get(`/users/${userId}`);
  //     const data = response.data.data;
  //     setProfileData(data);
  //     form.reset(data); // Populate form with fetched data
  //   } catch (error) {
  //     console.error('Error fetching profile data:', error);
  //     toast({
  //       title: 'Error',
  //       description: 'Unable to fetch profile data',
  //       variant: 'destructive'
  //     });
  //   }
  // };

  const fetchProfileData = async () => {
    try {
      // Dispatch the fetchUsers action to get the data
      const response = await dispatch(fetchUsers(user?._id));
  
      if (fetchUsers.fulfilled.match(response)) {
        const data = response.payload;
        setProfileData(data); // Set the profile data once fetched
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
      // Add the uploaded image file ID to the profile data if available
      const updatedData = {
        ...data,
        image: files.length > 0 ? files[0].data.id : user?.image
      };

      await axiosInstance.patch(`/users/${userId}`, updatedData);
      toast({
        title: 'Profile Updated',
        description: 'Thank You'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

 
  return (
    <div className="space-y-4 p-4 md:p-8  h-[calc(100vh-7rem)] overflow-y-auto">
      <PageHead title="Profile Page" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Profile', link: '/profile' }
        ]}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex  flex-col items-center justify-center lg:space-y-8 space-y-4 "
        >
          <div className="flex flex-col items-center lg:space-y-4 space-y-2">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profileData?.image} alt="Profile picture" />
              <AvatarFallback>
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
              />
              <Label htmlFor="avatar" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => setIsImageUploaderOpen(true)}
                >
                  Update Image
                </Button>
              </Label>
            </div>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    className="lg:h-[50px] lg:w-[400px]  "
                    placeholder="Enter Your Name..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    className="lg:h-[50px] lg:w-[400px]  "
                    placeholder="example@example.com"
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    className="lg:h-[50px] lg:w-[400px] "
                    placeholder="Phone"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    className="lg:h-[50px] lg:w-[400px] "
                    placeholder="Enter Your Address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className=" lg:h-[50px] lg:w-[400px] w-[200px] relative "
            variant="outline"
            type="submit"
          >
            Update profile
          </Button>
        </form>
        <ImageUploader
            open={isImageUploaderOpen}
            onOpenChange={setIsImageUploaderOpen}
            multiple={false}
            onUploadComplete={ async (uploadedFiles) => {

             if(uploadedFiles?.data?.file_url){
              try {
                const updatedData = {
                  ...user,
                  image: uploadedFiles.data.file_url, 
                };
        
                // Send the  request to the backend
                await axiosInstance.patch(`/users/${userId}`, updatedData);
        
                // Show success toast
                toast({
                  title: "Profile Updated",
                  description: "Your profile image has been updated.",
                });
              } catch (error) {
                // Show error toast
                toast({
                  title: "Error",
                  description: "Failed to update profile image.",
                  variant: "destructive",
                });
              }
             }
              
            }}
            className="uc-light"
          />
      </Form>
    </div>
  );
}
