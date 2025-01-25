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

import { useToast } from '@/components/ui/use-toast';

const profileFormSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email({ message: 'Enter a valid email address' }),
  address: z.string().optional(),
  phone: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  // const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: any) => state.auth);
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(
    null
  );
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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get(`/users/${userId}`);
        const data = response.data.data;
        setProfileData(data);
        form.reset(data); // Populate form with fetched data
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: 'Error',
          description: 'Unable to fetch profile data',
          variant: 'destructive'
        });
      }
    };

    fetchProfileData();
  }, [userId]);
  console.log(userId);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await axiosInstance.patch(`/users/${userId}`, data);
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
    <div className="space-y-4 p-4 md:p-8">
      <PageHead title="Profile Page" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/' },
          { title: 'Profile', link: '/profile' }
        ]}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-center space-y-8 "
        >
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user?.image} alt="Profile picture" />
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
                <Button type="button" variant="outline" size="sm">
                  Change Avatar
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
                    className="h-[50px] w-[400px] "
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
                    className="h-[50px] w-[400px] "
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
                    className="h-[50px] w-[400px] "
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
                    className="h-[50px] w-[400px] "
                    placeholder="Enter Your Address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="h-[50px] w-[400px] "
            variant="outline"
            type="submit"
          >
            Update profile
          </Button>
        </form>
      </Form>
    </div>
  );
}
