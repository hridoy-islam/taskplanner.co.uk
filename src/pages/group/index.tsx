import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  DialogFooter
} from '@/components/ui/dialog';
import axiosInstance from '../../lib/axios';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArchiveRestore, Plus, Search, Trash, Trash2, Users, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from '@/components/ui/use-toast';

interface Member {
  id: number;
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
  image:string
}

export default function GroupPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<
    'name' | 'members' | 'unread' | 'recent'
  >('unread');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [initialMembers, setInitialMembers] = useState<Member[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [view, setView] = useState<'active' | 'archived'>('active');

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

    loadMembers();
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
          image:group.image
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

  const addGroup = async () => {
    if (newGroupName) {
      const groupData = {
        groupName: newGroupName,
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
          ...selectedMembers.map((memberId) => ({
            _id: memberId,
            role: 'member',
            acceptInvitation: true
          }))
        ]
      };

      try {
        const response = await axiosInstance.post('/group', groupData);
        if (response.status === 201 || response.status === 200) {
          setNewGroupName('');
          setSelectedMembers([]);
          setIsGroupModalOpen(false);
          fetchGroups();
          setSortOrder('desc');
          setSortBy('recent');
        }
      } catch (error) {
        console.error('Error creating group:', error);
      }
    }
  };

  const filteredMembers = initialMembers
    .filter((member) =>
      member.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((member) => ({
      ...member,
      image: member.image
    }));

  const filteredGroups = groups
    .filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return dateB.getTime() - dateA.getTime();
    });

  const activeGroups = filteredGroups.filter(
    (group) => group.status !== 'archived'
  );
  const archivedGroups = filteredGroups.filter(
    (group) => group.status === 'archived'
  );

  console.log(groups)

  return (
    <div className="mx-auto h-full overflow-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Groups</h1>

      <div className="flex md:flex-row">
        <div className="mb-4 flex w-full gap-4 max-md:flex-col">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8"
            />
          </div>
          <div className="flex flex-row items-center justify-end gap-2">
            <Button
              onClick={() => setIsGroupModalOpen(true)}
              className="hover:bg-black hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Group
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant={view === 'active' ? 'outline' : 'default'}
          onClick={() => setView('active')}
        >
          Active Groups
        </Button>
        <Button
          variant={view === 'archived' ? 'outline' : 'default'}
          onClick={() => setView('archived')}
        >
          Archived Groups
        </Button>
      </div>

      {view === 'active' ? (
        <Card className="mb-8 p-2">
          <CardContent>
            <h2 className="mb-4  text-xl  font-semibold">Active Groups</h2>
            <Table>
              <ScrollArea className="h-[30rem] max-h-fit pr-2">
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="pl-2 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeGroups.map((group) => (
                    <TableRow
                      key={group.id}
                      className="cursor-pointer items-center border-none shadow hover:bg-slate-100"
                    >
                      <TableCell
                        onClick={() => navigate(`${group?.id}`)}
                        className="flex flex-col items-start justify-start gap-2 font-semibold"
                      >
                        <div className="mt-2 flex flex-row items-center justify-start gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={group?.image}
                              alt="Profile picture"
                            />
                            <AvatarFallback className=''>
                            <Users />
                            </AvatarFallback>
                          </Avatar>
                          <div>{group.name}</div>
                          {group.unreadMessageCount > 0 && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#7f1d1d] text-[12px] text-white">
                              {group.unreadMessageCount}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex justify-end">
                          <Trash2
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await axiosInstance.patch(
                                  `/group/single/${group.id}`,
                                  {
                                    status: 'archived'
                                  }
                                );
                                toast({
                                  title: 'Group archived successfully'
                                });
                                fetchGroups();
                              } catch (error) {
                                console.error('Error archiving group:', error);
                                toast({
                                  title: 'Failed to archive group',
                                  variant: 'destructive'
                                });
                              }
                            }}
                            className="h-5 w-5 cursor-pointer text-red-600 transition-colors hover:text-red-800"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* {activeGroups.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-gray-500"
                      >
                        No active groups found
                      </TableCell>
                    </TableRow>
                  )} */}
                </TableBody>
              </ScrollArea>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <h2 className="mb-4 text-xl font-semibold">Archived Groups</h2>
            <Table>
              <ScrollArea className="h-[20rem] max-h-fit pr-2">
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="pl-2 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedGroups.map((group) => (
                    <TableRow
                      key={group.id}
                      className="cursor-pointer items-center border-none shadow hover:bg-slate-100"
                    >
                      <TableCell
                        onClick={() => navigate(`${group?.id}`)}
                        className="flex flex-row items-start justify-start gap-2 font-semibold"
                      >
                        <div className="mt-2 flex flex-row items-center justify-start gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={group?.image}
                              alt="Profile picture"
                            />
                            <AvatarFallback className=''>
                            <Users />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="mt-2 flex flex-row items-center justify-start gap-2">
                          <div>{group.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-400">
                        <div className="flex items-center justify-end gap-2 ">
                          <ArchiveRestore
                            onClick={async (e) => {
                              e.stopPropagation(); // Prevent row click if any
                              try {
                                await axiosInstance.patch(
                                  `/group/single/${group.id}`,
                                  {
                                    status: 'active'
                                  }
                                );
                                toast({
                                  title: 'Group unarchived successfully'
                                });
                                fetchGroups();
                              } catch (error) {
                                console.error(
                                  'Error unarchiving group:',
                                  error
                                );
                                toast({
                                  title: 'Failed to unarchive group',
                                  variant: 'destructive'
                                });
                              }
                            }}
                            className="h-5 w-5 cursor-pointer text-blue-600 transition-colors hover:text-blue-800"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {archivedGroups.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-gray-500"
                      >
                        No archived groups found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </ScrollArea>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Group Dialog */}
      <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className='w-full'
            />
            <div>
              <Label>Select Members</Label>
              <Input
                placeholder="Search User"
                className="mb-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                
              />
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="mb-2 flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`member-${member.id}`}
                      checked={selectedMembers.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, member.id]);
                        } else {
                          setSelectedMembers(
                            selectedMembers.filter((id) => id !== member.id)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`member-${member.id}`}
                      className="flex items-center space-x-2"
                    >
                      <Avatar>
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </Label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
