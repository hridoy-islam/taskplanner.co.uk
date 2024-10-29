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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../lib/axios';
import { useForm } from 'react-hook-form';
import { convertToLowerCase } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

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

export default function UserProfileDetail() {
  const { id } = useParams();
  const [userData, setUserData] = useState<userDetails>();
  const { register, handleSubmit, reset } = useForm<userDetails>();
  const [assignedMembers, setAssignedMembers] = useState<any>([]);
  const [availableMembers, setAvailableMembers] = useState<any>([]);

  const fetchUserDetails = async () => {
    const res = await axiosInstance.get(`/users/${id}`);
    setUserData(res.data.data);
    reset(res.data.data);
    const response = await axiosInstance.get(
      `/users?company=${res.data.data.company}`
    );
    setAvailableMembers(response.data.data.result);
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
        description: 'Thank You'
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
                <Input id="email" {...register('email')} type="email" />
              </div>

              <Button type="submit" variant={'outline'}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assigned Company Members</CardTitle>
            <CardDescription>
              Manage team members assigned to this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {assignedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="text-sm font-medium leading-none">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium">Available Members</h4>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {availableMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-2 py-2"
                  >
                    <Checkbox
                      id={`member-${member.id}`}
                      onCheckedChange={() => handleAssignMember(member)}
                    />
                    <Label
                      htmlFor={`member-${member.id}`}
                      className="flex items-center space-x-2"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {member.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
