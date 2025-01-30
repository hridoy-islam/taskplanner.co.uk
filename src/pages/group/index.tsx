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
import {
  Bell,
  MessageSquareIcon,
  MessageSquareText,
  Plus,
  Search,
  Trash,
  X
} from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Member {
  id: number;
  name: string;
  email: string;
  avatar: string;
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
  unreadMessageCount?: number; // Add this line
  status: string; // Add this line
  createdAt: Date; // Add this line
}

// interface Notification {
//   id: number;
//   content: string;
//   isRead: boolean;
// }

export default function GroupPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<
    'name' | 'members' | 'unread' | 'recent'
  >('unread');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  // const [currentPage, setCurrentPage] = useState(1);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  // const [newComment, setNewComment] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  const [initialMembers, setInitialMembers] = useState<Member[]>([]);

  const { user } = useSelector((state: any) => state.auth);

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
          avatar: user?.avatarUrl,
          isCurrentUser: true // Add this line
        },
        ...fetchedMembers.map((member: any) => ({
          id: member._id,
          name: member.name,
          email: member.email,
          avatar: member.avatarUrl
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
          members: group.members.map((member: any) => ({
            id: member._id,
            name: initialMembers.find((m) => m.id === member._id)?.name,
            avatar: initialMembers.find((m) => m.id === member._id)?.avatar
          })),
          comments: [],
          unreadMessageCount: group.unreadMessageCount
        }));
        setGroups(fetchedGroups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
    }
  };

  useEffect(() => {
    // Fetch groups initially
    fetchGroups();

    // Set up an interval to refresh the group data
    const interval = setInterval(() => {
      fetchGroups();
    }, 30000); // Refresh every 30 seconds

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [initialMembers]); // Re-run if `initialMembers` changes

  // const pageSize = 5;

  const addGroup = async () => {
    if (newGroupName) {
      const groupData = {
        groupName: newGroupName,
        description: 'A new group created by the user.', // Optional, adjust as needed
        creator: user?._id, // Replace with the actual creator's ID from the user's context
        status: 'active',
        members: [
          {
            _id: user?._id, // Add the current user as an admin
            role: 'admin', // Assign the role as admin
            acceptInvitation: true,
            name: user?.name
          },
          ...selectedMembers.map((memberId) => ({
            _id: memberId,
            role: 'member', // Default role; adjust as needed
            acceptInvitation: true
          }))
        ]
      };

      try {
        const response = await axiosInstance.post('/group', groupData);
        if (response.status === 201 || response.status === 200) {
          // Update UI with the newly created group
          const newGroup: Group = {
            id: response.data._id, // Assuming the API returns the created group's ID
            name: groupData.groupName,
            status: groupData.status,
            createdAt: new Date(),
            members: [
              {
                id: user?._id,
                name: user?.name || 'You',
                email: '',
                avatar: user?.avatarUrl
              },
              ...initialMembers.filter((member) =>
                selectedMembers.includes(member.id)
              )
            ],
            comments: []
          };

          // setGroups([...groups, newGroup]);
          setNewGroupName('');
          setSelectedMembers([]);
          setIsGroupModalOpen(false);
          fetchGroups();
          setSortOrder('desc');
          setSortBy('recent');
        }
      } catch (error) {
        console.error('Error creating group:', error);
        // Optionally display an error message to the user
      }
    }
  };

  // const addComment = () => {
  //   if (selectedGroup && newComment) {
  //     const comment: Comment = {
  //       id: Date.now(),
  //       memberId: 1, // Assuming the current user is the first member
  //       content: newComment,
  //       createdAt: new Date()
  //     };
  //     const updatedGroup = {
  //       ...selectedGroup,
  //       comments: [...selectedGroup.comments, comment]
  //     };
  //     setGroups(
  //       groups.map((group) =>
  //         group.id === selectedGroup.id ? updatedGroup : group
  //       )
  //     );
  //     setNewComment('');
  //     // addNotification(
  //     //   `New comment in ${selectedGroup.name}: ${newComment.substring(0, 50)}${newComment.length > 50 ? '...' : ''}`
  //     // );
  //   }
  // };

  // const removeMember = (groupId: number, memberId: number) => {
  //   setGroups(
  //     groups.map((group) => {
  //       if (group.id === groupId) {
  //         return {
  //           ...group,
  //           members: group.members.filter((member) => member.id !== memberId)
  //         };
  //       }
  //       return group;
  //     })
  //   );
  // };

  const filteredMembers = initialMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // const addNotification = (content: string) => {
  //   const newNotification: Notification = {
  //     id: Date.now(),
  //     content,
  //     isRead: false
  //   };
  //   setNotifications([newNotification, ...notifications]);
  // };

  // const markNotificationAsRead = (id: number) => {
  //   setNotifications(
  //     notifications.map((notification) =>
  //       notification.id === id
  //         ? { ...notification, isRead: true }
  //         : notification
  //     )
  //   );
  // };

  const filteredGroups = groups
    .filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'members') {
        return sortOrder === 'asc'
          ? a.members.length - b.members.length
          : b.members.length - a.members.length;
      } else if (sortBy === 'unread') {
        return sortOrder === 'asc'
          ? (b.unreadMessageCount || 0) - (a.unreadMessageCount || 0)
          : (a.unreadMessageCount || 0) - (b.unreadMessageCount || 0);
      } else if (sortBy === 'recent') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

  // const paginatedGroups = filteredGroups.slice(
  //   (currentPage - 1) * pageSize,
  //   currentPage * pageSize
  // );

  // const pageCount = Math.ceil(filteredGroups.length / pageSize);

  // useEffect(() => {
  //   // setCurrentPage(1);
  // }, [searchTerm, sortBy, sortOrder]);

  return (
    <div className="container mx-auto h-full overflow-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Groups</h1>
      <div className="flex md:flex-row  ">
        <div className="mb-4 flex w-full gap-4 max-md:flex-col">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* <Button
          onClick={() => {
            setSortBy('members');
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          }}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button> */}

          <div className="flex flex-row  items-center justify-end gap-2">
            <Button className="hover:bg-black hover:text-white">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  {sortBy || 'sort'} {sortOrder === 'asc' ? '↑' : '↓'}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy('unread');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    New Message
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy('name');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Name
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy('members');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Member Count
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy('recent');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Date Created
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Button>

            <Button
              onClick={() => setIsGroupModalOpen(true)}
              className="hover:bg-black hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Group
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent>
          <Table>
            <ScrollArea className="h-[40rem] max-h-fit pr-2 ">
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Members</TableHead>
                  {/* <TableHead>G Type</TableHead> */}
                  <TableHead>View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow
                    key={group.id}
                    className="shadow hover:bg-slate-100"
                  >
                    <TableCell className="font-semibold">
                      <Link to={`${group?.id}`}>{group.name}</Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2 overflow-hidden">
                        {group.members.slice(0, 3).map((member) => (
                          <TooltipProvider key={member.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Avatar className="inline-block border-2 border-background">
                                  <AvatarImage
                                    src={member.avatar}
                                    alt={member.name}
                                  />
                                  <AvatarFallback>
                                    {member?.name
                                      ?.split(' ')
                                      ?.map((n) => n[0])
                                      ?.join('') || 'User'}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{member.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                        {group.members.length > 3 && (
                          <Avatar className="inline-block border-2 border-background">
                            <AvatarFallback>
                              +{group.members.length - 3}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Link to={`${group?.id}`}>
                        <Button
                          variant={`${group.unreadMessageCount === 0 ? 'ghost' : 'destructive'}`}
                          size={'sm'}
                          onClick={() => setSelectedGroup(group)}
                        >
                          <MessageSquareText className={`h-4 w-4`} />
                          <sup className="ml-1 text-[10px]">
                            {(group.unreadMessageCount ?? 0) > 0 ? (
                              <span>{group?.unreadMessageCount}</span>
                            ) : (
                              ''
                            )}
                          </sup>
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Trash
                        className={`h-4 w-4 cursor-pointer text-red-900`}
                      ></Trash>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ScrollArea>
          </Table>
        </CardContent>
      </Card>

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
            />
            <div>
              <Label>Select Members</Label>
              <Input
                placeholder="Search User"
                className="mb-2"
                value={searchQuery} // Bind the input value to searchQuery state
                onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery on input change
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
                        <AvatarImage src={member.avatar} alt={member.name} />
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
