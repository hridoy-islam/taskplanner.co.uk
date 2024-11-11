import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { UserPlus, UserMinus, Send, Paperclip, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Mock data
const groupName = 'Project Alpha Team';
const initialGroupMembers = [
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
  { id: 3, name: 'Charlie Brown' },
  { id: 4, name: 'Diana Prince' }
];
const initialMessages = [
  {
    id: 1,
    sender: 'Alice Johnson',
    content: "Hey team, how's the project coming along?",
    timestamp: '10:30 AM'
  },
  {
    id: 2,
    sender: 'Bob Smith',
    content: 'Making good progress on the frontend!',
    timestamp: '10:32 AM'
  },
  {
    id: 3,
    sender: 'Charlie Brown',
    content: 'Backend is almost done, just fixing a few bugs.',
    timestamp: '10:35 AM'
  }
];

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

const getRandomColor = () => {
  const colors = [
    'red-500', // Medium red
    'blue-500', // Medium blue
    'green-500', // Medium green
    'yellow-500', // Medium yellow
    'purple-500', // Medium purple
    'pink-500', // Medium pink
    'orange-500', // Medium orange
    'teal-500' // Medium teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function GroupChat() {
  const [groupMembers, setGroupMembers] = useState(
    initialGroupMembers.map((member) => ({
      ...member,
      color: getRandomColor()
    }))
  );
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const handleSendMessage = () => {
    if (newMessage.trim() !== '' || attachedFile) {
      const message = {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        file: attachedFile
          ? {
              name: attachedFile.name,
              size: attachedFile.size,
              type: attachedFile.type
            }
          : null
      };
      setMessages([...messages, message]);
      setNewMessage('');
      setAttachedFile(null);
    }
  };

  const handleAddMember = () => {
    if (newMemberName.trim() !== '') {
      const newMember = {
        id: groupMembers.length + 1,
        name: newMemberName.trim(),
        color: getRandomColor()
      };
      setGroupMembers([...groupMembers, newMember]);
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (id: number) => {
    setGroupMembers(groupMembers.filter((member) => member.id !== id));
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  return (
    <div className="mx-auto flex h-full overflow-hidden">
      {/* Sidebar with group members */}
      <div className="w-64 space-y-3 border-r border-gray-300 p-4">
        <h2 className="mb-4 text-lg font-bold">{groupName}</h2>
        <div className="flex justify-between">
          <h3 className="mb-2 font-semibold">Group Members </h3>
          <Button
            variant={'outline'}
            size={'sm'}
            onClick={() => setIsAddMemberOpen(true)}
          >
            Add
          </Button>
        </div>

        <ScrollArea className="h-[calc(100%-12rem)]">
          {groupMembers.map((member) => (
            <div
              key={member.id}
              className="mb-2 flex items-center justify-between space-x-2"
            >
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{member.name}</span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove {member.name} from the group. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Chat messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.sender === 'You' ? 'text-right' : ''}`}
            >
              <div
                className={`inline-block max-w-[70%] ${message.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-red-100'} rounded-lg p-3`}
              >
                <div className="mb-1 flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback
                      style={{
                        backgroundColor:
                          groupMembers.find((m) => m.name === message.sender)
                            ?.color || 'gray'
                      }}
                    >
                      {message.sender[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="font-semibold"
                    style={{
                      color: groupMembers.find((m) => m.name === message.sender)
                        ?.color
                    }}
                  >
                    {message.sender}
                  </span>
                  <span className="text-xs opacity-70">
                    {message.timestamp}
                  </span>
                </div>
                <p>{message.content}</p>
                {message.file && (
                  <div className="mt-2 rounded bg-gray-200 p-2">
                    <p className="text-sm">Attached: {message.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(message.file.size / 1024).toFixed(2)} KB •{' '}
                      {message.file.type}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Message input */}
        <div className="border-t border-gray-300 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex flex-col space-y-2"
          >
            {attachedFile && (
              <div className="flex items-center space-x-2 rounded bg-gray-100 p-2">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm">{attachedFile.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAttachedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileAttach}
                className="hidden"
              />
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Members</Label>
              <Input placeholder="Search User" className="mb-2" />
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {initialMembers.map((member) => (
                  <div
                    key={member.id}
                    className="mb-2 flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`member-${member.id}`}
                      //checked={selectedMembers.includes(member.id)}
                      // onChange={(e) => {
                      //   if (e.target.checked) {
                      //     setSelectedMembers([...selectedMembers, member.id]);
                      //   } else {
                      //     setSelectedMembers(
                      //       selectedMembers.filter((id) => id !== member.id)
                      //     );
                      //   }
                      // }}
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
            <Button variant={'outline'}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
