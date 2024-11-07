import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Plus, Search, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

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
}

interface Notification {
  id: number;
  content: string;
  isRead: boolean;
}

const initialMembers: Member[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 3,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: 4,
    name: 'Diana Ross',
    email: 'diana@example.com',
    avatar: 'https://i.pravatar.cc/150?img=4'
  }
];

export default function GroupPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'members'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newComment, setNewComment] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const pageSize = 5;

  const addGroup = () => {
    if (newGroupName) {
      const newGroup: Group = {
        id: Date.now(),
        name: newGroupName,
        members: initialMembers.filter((member) =>
          selectedMembers.includes(member.id)
        ),
        comments: []
      };
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setSelectedMembers([]);
      setIsGroupModalOpen(false);
    }
  };

  const addComment = () => {
    if (selectedGroup && newComment) {
      const comment: Comment = {
        id: Date.now(),
        memberId: 1, // Assuming the current user is the first member
        content: newComment,
        createdAt: new Date()
      };
      const updatedGroup = {
        ...selectedGroup,
        comments: [...selectedGroup.comments, comment]
      };
      setGroups(
        groups.map((group) =>
          group.id === selectedGroup.id ? updatedGroup : group
        )
      );
      setNewComment('');
      addNotification(
        `New comment in ${selectedGroup.name}: ${newComment.substring(0, 50)}${newComment.length > 50 ? '...' : ''}`
      );
    }
  };

  const removeMember = (groupId: number, memberId: number) => {
    setGroups(
      groups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.filter((member) => member.id !== memberId)
          };
        }
        return group;
      })
    );
  };

  const addNotification = (content: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      content,
      isRead: false
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const filteredGroups = groups
    .filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc'
          ? a.members.length - b.members.length
          : b.members.length - a.members.length;
      }
    });

  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pageCount = Math.ceil(filteredGroups.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Groups</h1>

      <div className="mb-4 flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
        <Button onClick={() => setIsGroupModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Group
        </Button>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>{group.name}</TableCell>
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
                                  {member.name.charAt(0)}
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
                    <Button
                      variant="outline"
                      onClick={() => setSelectedGroup(group)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}
      </div>

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
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {initialMembers.map((member) => (
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

      <Dialog
        open={!!selectedGroup}
        onOpenChange={() => setSelectedGroup(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Members</h3>
              <div className="flex flex-wrap gap-2">
                {selectedGroup?.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-2 rounded-full bg-gray-100 py-1 pl-1 pr-2"
                  >
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        selectedGroup &&
                        removeMember(selectedGroup.id, member.id)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">Comments</h3>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {selectedGroup?.comments.map((comment) => (
                  <div key={comment.id} className="mb-2">
                    <div className="font-semibold">
                      {
                        selectedGroup.members.find(
                          (m) => m.id === comment.memberId
                        )?.name
                      }
                    </div>
                    <div>{comment.content}</div>
                    <div className="text-sm text-gray-500">
                      {comment.createdAt.toLocaleString()}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={addComment}>Post</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-4 right-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-full p-2">
              <Bell className="h-6 w-6" />
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2"
                >
                  {notifications.filter((n) => !n.isRead).length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`mb-2 cursor-pointer rounded p-2 ${
                    notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
                  }`}
                  onClick={() =>
                    !notification.isRead &&
                    markNotificationAsRead(notification.id)
                  }
                >
                  {notification.content}
                </div>
              ))}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// export default function GroupPage() {
//   return <>comming soon</>;
// }
