import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../lib/axios';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { convertToLowerCase } from '@/lib/utils';

interface userDetails {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  colleagues: [];
  isDeleted: boolean;
  authroized: boolean;
  company: string;
}

export default function CompanyProfileDetail() {
  const { id } = useParams();
  const [userData, setUserData] = useState<userDetails>();
  const { register, handleSubmit, reset } = useForm<userDetails>();

  const fetchUserDetails = async () => {
    const res = await axiosInstance.get(`/users/${id}`);
    setUserData(res.data.data);
    reset(res.data.data);
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const onSubmit = async (data: userDetails) => {
    try {
      data.email = convertToLowerCase(data.email);
      await axiosInstance.patch(`/users/${id}`, data);
      toast({
        title: 'Profile Updated Successfully',
       
      });
      fetchUserDetails();
    } catch (error) {
      toast({
        title: 'Error updating user',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Edit {userData?.name} Profile</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{userData?.name} Details</CardTitle>
            <CardDescription>
              Edit the {userData?.name}'s personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
              </div>
              <Button type="submit" variant={'outline'}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
