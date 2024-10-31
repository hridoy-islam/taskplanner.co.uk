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
import { convertToLowerCase } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query

  const fetchUserDetails = async () => {
    const res = await axiosInstance.get(`/users/${id}`);
    setUserData(res.data.data);
    reset(res.data.data);
    setAssignedMembers(res.data.data.colleagues); // Set assigned members
    await fetchAvailableMembers(res.data.data.company);
  };

  const fetchAvailableMembers = async (company: string) => {
    const response = await axiosInstance.get(`/users?company=${company}`);
    const allMembers = response.data.data.result;

    // Filter out current user and already assigned members
    const filteredAvailableMembers = allMembers.filter(
      (member) => member._id !== id
    );

    setAvailableMembers(filteredAvailableMembers);
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

  // Function to filter available members based on the search query
  const filteredMembers = availableMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignMember = async (member: any) => {
    const isAlreadyAssigned = assignedMembers.some(
      (assigned) => assigned._id === member._id
    );

    if (isAlreadyAssigned) {
      toast({
        title: 'Member Already Assigned',
        description: 'This member is already assigned to the user.',
        variant: 'destructive'
      });
      return; // Exit the function if the member is already assigned
    }
    const data = { colleagueId: member._id, action: 'add' };
    try {
      const res = await axiosInstance.patch(`/users/addmember/${id}`, data);
      if (res.data.success) {
        toast({
          title: 'Member Assigned Successfully',
          description: 'Thank You'
        });

        // Update assignedMembers state
        setAssignedMembers((prev) => [...prev, member]);
        // Refetch available members after assignment
        await fetchAvailableMembers(userData?.company || '');
      }
    } catch (error) {
      toast({
        title: 'Error assigning member',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const data = { colleagueId: memberId, action: 'remove' };
      await axiosInstance.patch(`/users/addmember/${id}`, data);
      setAssignedMembers((prev) =>
        prev.filter((member) => member._id !== memberId)
      );
      await fetchAvailableMembers(userData?.company || '');
      toast({
        title: 'Member Removed Successfully',
        description: 'The member has been removed from the assigned members.'
      });
    } catch (error) {
      toast({
        title: 'Error removing member',
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
              {assignedMembers.map((member: any) => (
                <div
                  key={member._id}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member._id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium">Available Members</h4>
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
                className="mb-2"
              />
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {filteredMembers.map((member: any) => (
                  <div
                    key={member._id}
                    className="flex items-center space-x-2 py-2"
                  >
                    <Checkbox
                      id={`member-${member._id}`}
                      checked={assignedMembers.some(
                        (assigned) => assigned._id === member._id
                      )}
                      onCheckedChange={() => handleAssignMember(member)}
                    />
                    <Label
                      htmlFor={`member-${member._id}`}
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
