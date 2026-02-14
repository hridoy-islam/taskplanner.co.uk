import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import axiosInstance from '@/lib/axios';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArchiveRestore, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription as AlertDialogDesc,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

// Zod & React Hook Form imports
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface Member {
  id: number | string; // Adjusted to allow string incase of MongoDB ObjectId
  name: string;
  email: string;
  image: string;
  isCurrentUser?: boolean;
}

interface Comment {
  id: number;
  memberId: number;
  content: string;
  createdAt: Date;
}

interface Group {
  id: number;
  name: string;
  members: Member[];
  comments: Comment[];
  unreadMessageCount?: number;
  status: string;
  createdAt: Date;
  isArchived: boolean;
  updatedAt: Date;
  image: string;
  creator: any;
}

// Zod Schema for validation
const groupFormSchema = z.object({
  groupName: z
    .string()
    .min(3, { message: 'Group name must be at least 3 characters.' })
    .max(50, { message: 'Group name must not exceed 50 characters.' }),
  selectedMembers: z.array(z.union([z.string(), z.number()])).default([]),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

export default function CompanyGroupPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // Modal Search
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [initialMembers, setInitialMembers] = useState<Member[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [view, setView] = useState<'active' | 'archived'>('active');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Initialize React Hook Form
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      groupName: '',
      selectedMembers: [],
    },
  });

  const fetchMembers = async () => {
    try {
      const response = await axiosInstance.get(`/users/company/${user?._id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadMembers = async () => {
      const fetchedMembers = await fetchMembers();
      setInitialMembers([
        {
          id: user?._id,
          name: user?.name,
          email: user?.email,
          image: user?.image,
          isCurrentUser: true
        },
        ...fetchedMembers.map((member: any) => ({
          id: member._id,
          name: member.name,
          email: member.email,
          image: member.image
        }))
      ]);
    };

    if (user?._id) loadMembers();
  }, [user?._id]);

  const fetchGroups = async () => {
    try {
      const response = await axiosInstance.get('/group/single');
      if (response.status === 200) {
        const fetchedGroups = response?.data?.data?.map((group: any) => ({
          id: group._id,
          name: group.groupName,
          status: group.status,
          createdAt: group.createdAt,
          isArchived: group.isArchived,
          updatedAt: group.updatedAt,
          members: group.members.map((member: any) => ({
            id: member._id,
            name: initialMembers.find((m) => m.id === member._id)?.name,
            image: initialMembers.find((m) => m.id === member._id)?.image
          })),
          comments: [],
          unreadMessageCount: group.unreadMessageCount,
          image: group.image,
          creator: group.creator
        }));
        setGroups(fetchedGroups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
    const interval = setInterval(() => {
      fetchGroups();
    }, 20000);
    return () => clearInterval(interval);
  }, [initialMembers]);

  // Form Submit Handler
  const onSubmit = async (values: GroupFormValues) => {
    const groupData = {
      groupName: values.groupName,
      description: 'A new group created by the user.',
      creator: user?._id,
      status: 'active',
      members: [
        {
          _id: user?._id,
          role: 'admin',
          acceptInvitation: true,
          name: user?.name
        },
        ...values.selectedMembers.map((memberId) => ({
          _id: memberId,
          role: 'member',
          acceptInvitation: true
        }))
      ]
    };

    try {
      const response = await axiosInstance.post('/group', groupData);
      if (response.status === 201 || response.status === 200) {
        toast({ title: 'Group created successfully!' });
        handleModalOpenChange(false);
        fetchGroups();
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({ title: 'Error creating group', variant: 'destructive' });
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsGroupModalOpen(open);
    if (!open) {
      form.reset();
      setSearchQuery('');
    }
  };

  const filteredMembers = initialMembers
    .filter((member) =>
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      member.id !== user?._id
    )
    .filter((member, index, self) => 
      index === self.findIndex((m) => m.id === member.id)
    );

  const sortedGroups = groups.sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return dateB.getTime() - dateA.getTime();
  });

  const activeGroups = sortedGroups.filter(
    (group) => group.status !== 'archived'
  );
  const archivedGroups = sortedGroups.filter(
    (group) => group.status === 'archived'
  );

  const displayGroups = view === 'active' ? activeGroups : archivedGroups;

  return (
    <div className="mx-auto h-full space-y-3 p-2">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center ">
        <div className="flex flex-row items-center gap-4 w-[40vw]">
          <div className="flex overflow-hidden rounded-lg bg-taskplanner p-1 text-white">
            <button
              onClick={() => setView('active')}
              className={`rounded-md px-4 py-1 text-center text-sm font-medium transition-colors
      ${
        view === 'active'
          ? 'bg-white font-semibold text-taskplanner'
          : 'bg-taskplanner px-1 text-white hover:bg-taskplanner/80'
      }`}
            >
              Active Groups
            </button>

            <button
              onClick={() => setView('archived')}
              className={`rounded-md px-4 py-1 text-center text-sm font-medium transition-colors
      ${
        view === 'archived'
          ? 'bg-white font-semibold text-taskplanner'
          : 'bg-taskplanner px-1 text-white hover:bg-taskplanner/80'
      }`}
            >
              Archived Groups
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsGroupModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Group
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="rounded-md border border-taskplanner  shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-taskplanner text-white">
              <TableHead className="w-[300px]">Group Name</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayGroups.map((group) => (
              <TableRow
                key={group.id}
                className="cursor-pointer hover:bg-gray-50/50"
                onClick={() => navigate(`${group?.id}`)}
              >
                {/* Group Name Column */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-200">
                      <AvatarImage src={group?.image} alt="Group" />
                      <AvatarFallback className=" ">
                        <img
                          src="/group-placeholder.jpg"
                          alt="Avatar"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="truncate font-semibold">
                        {group.name}
                      </span>
                      {group.unreadMessageCount && group.unreadMessageCount > 0 ? (
                        <span className="text-xs font-medium text-red-600">
                          {group.unreadMessageCount} new messages
                        </span>
                      ): null}
                    </div>
                  </div>
                </TableCell>

                {/* Members Column */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-4 overflow-hidden">
                      {group.members.slice(0, 4).map((member) => (
                        <Avatar
                          key={member.id}
                          className="inline-block h-8 w-8 border-2 border-white ring-offset-2"
                        >
                          <AvatarImage src={member.image} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <img
                              src="/placeholder.png"
                              alt="Avatar"
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Badge variant="secondary" className="text-xs font-normal bg-taskplanner hover:bg-taskplanner text-white">
                      {group.members.length} members
                    </Badge>
                  </div>
                </TableCell>

                {/* Created At Column */}
                <TableCell className="text-sm font-semibold">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-200">
                      <AvatarImage src={group?.creator?.image} alt="Group" />
                      <AvatarFallback className=" text-primary">
                        <img
                          src="/placeholder.png"
                          alt="Avatar"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="truncate font-semibold">
                        {group.creator?.name}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-semibold">
                  {moment(group.createdAt).format('MMM D, YYYY')}
                </TableCell>

                {/* Actions Column */}
                <TableCell className="text-right">
                  {user._id == group.creator?._id?.toString() && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() =>
                              setSelectedGroupId(group.id.toString())
                            }
                          >
                            {view === 'active' ? (
                              <Trash2 className="h-4 w-4" />
                            ) : (
                              <ArchiveRestore className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="bg-white text-black">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {view === 'active'
                                ? 'Archive Group?'
                                : 'Restore Group?'}
                            </AlertDialogTitle>
                            <AlertDialogDesc>
                              {view === 'active'
                                ? 'This will archive the group. It will move to the archived tab.'
                                : 'This will restore the group to the active list.'}
                            </AlertDialogDesc>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setSelectedGroupId(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  const newStatus =
                                    view === 'active' ? 'archived' : 'active';
                                  await axiosInstance.patch(
                                    `/group/single/${selectedGroupId}`,
                                    { status: newStatus }
                                  );
                                  toast({
                                    title:
                                      view === 'active'
                                        ? 'Group archived'
                                        : 'Group restored'
                                  });
                                  fetchGroups();
                                } catch (error) {
                                  console.error('Error updating group:', error);
                                  toast({
                                    title: 'Action failed',
                                    variant: 'destructive'
                                  });
                                }
                                setSelectedGroupId(null);
                              }}
                              className={
                                view === 'active'
                                  ? 'bg-destructive hover:bg-destructive/90'
                                  : ''
                              }
                            >
                              {view === 'active' ? 'Archive' : 'Restore'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {displayGroups.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No {view} groups found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modernized Create Group Dialog */}
     {/* Modernized Create Group Dialog */}
      <Dialog open={isGroupModalOpen} onOpenChange={handleModalOpenChange}>
        {/* 1. Increased Dialog width to 800px */}
        <DialogContent className="sm:max-w-[800px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">Create New Group</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a title and invite team members to collaborate together.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              
              {/* Group Name Field */}
              <FormField
                control={form.control}
                name="groupName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Marketing Team, Design Sync"
                        {...field}
                        className="focus-visible:ring-taskplanner"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Members Selection Field */}
              <FormField
                control={form.control}
                name="selectedMembers"
                render={({ field }) => {
                  // 2. Derive the selected member objects from the form's ID array
                  const selectedMemberObjects = field.value
                    .map((id) => initialMembers.find((m) => m.id === id))
                    .filter(Boolean);

                  return (
                    <FormItem>
                      <FormLabel>Team Members</FormLabel>
                      {/* 3. Implemented a 2-column grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                        
                        {/* Left Side: Search and Available Members */}
                        <div className="flex flex-col gap-3">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                            Available Members
                          </Label>
                          <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="focus-visible:ring-taskplanner"
                          />
                          
                          <ScrollArea className="h-[250px] rounded-md border p-2 shadow-inner bg-muted/5">
                            {filteredMembers.map((member) => {
                              const isSelected = field.value.includes(member.id);

                              return (
                                <div
                                  key={member.id}
                                  className="flex items-center space-x-3 rounded-md px-3 py-2.5 hover:bg-muted/50 transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    id={`member-${member.id}`}
                                    className="h-4 w-4 shrink-0 rounded-sm border-primary accent-taskplanner"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const updated = e.target.checked
                                        ? [...field.value, member.id]
                                        : field.value.filter((id) => id !== member.id);
                                      field.onChange(updated);
                                    }}
                                  />
                                  <Label
                                    htmlFor={`member-${member.id}`}
                                    className="flex flex-1 cursor-pointer items-center space-x-3"
                                  >
                                    <Avatar className="h-8 w-8 border bg-white">
                                      <AvatarImage src={member.image} alt={member.name} />
                                      <AvatarFallback className="text-xs font-semibold">
                                        {member.name?.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium leading-none">{member.name}</span>
                                  </Label>
                                </div>
                              );
                            })}

                            {filteredMembers.length === 0 && (
                              <div className="mt-8 text-center text-sm text-muted-foreground">
                                No team members found.
                              </div>
                            )}
                          </ScrollArea>
                        </div>

                        {/* Right Side: Selected Members View */}
                        <div className="flex flex-col gap-3">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                            Selected ({field.value.length})
                          </Label>
                          
                          <div className="border rounded-md shadow-inner bg-muted/5 flex-1 p-2">
                            {/* Slightly taller scroll area to align nicely with the left side (Search + List) */}
                            <ScrollArea className="h-[295px]">
                              {selectedMemberObjects.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground mt-24">
                                  No members selected.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {selectedMemberObjects.map((member: any) => (
                                    <div 
                                      key={`selected-${member.id}`} 
                                      className="flex items-center justify-between rounded-md border bg-white px-3 py-2 shadow-sm"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <Avatar className="h-8 w-8 border bg-white">
                                          <AvatarImage src={member.image} alt={member.name} />
                                          <AvatarFallback className="text-xs font-semibold">
                                            {member.name?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium leading-none truncate max-w-[120px]">
                                          {member.name}
                                        </span>
                                      </div>
                                      
                                      {/* Easy remove button */}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                          const updated = field.value.filter((id: any) => id !== member.id);
                                          field.onChange(updated);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                          </div>
                        </div>

                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => handleModalOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-taskplanner hover:bg-taskplanner/90 text-white"
                  disabled={form.formState.isSubmitting}
                >
                  Create Group
                </Button>
              </DialogFooter>
            </form>
          </Form>

        </DialogContent>
      </Dialog>
    </div>
  );
}