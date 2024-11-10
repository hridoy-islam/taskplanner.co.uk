import { useState, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

const getRandomColor = () => {
  const colors = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'pink',
    'orange',
    'teal'
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
    <div className="mx-auto flex h-[600px] max-w-4xl overflow-hidden rounded-lg border">
      {/* Sidebar with group members */}
      <div className="w-64 border-r bg-muted p-4">
        <h2 className="mb-4 text-lg font-bold">{groupName}</h2>
        <h3 className="mb-2 font-semibold">Group Members</h3>
        <ScrollArea className="h-[calc(100%-12rem)]">
          {groupMembers.map((member) => (
            <div
              key={member.id}
              className="mb-2 flex items-center justify-between space-x-2"
            >
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback style={{ backgroundColor: member.color }}>
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm" style={{ color: member.color }}>
                  {member.name}
                </span>
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
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddMember();
            }}
            className="flex space-x-2"
          >
            <Input
              type="text"
              placeholder="New member name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <UserPlus className="h-4 w-4" />
            </Button>
          </form>
        </div>
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
                className={`inline-block max-w-[70%] ${message.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3`}
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
        <div className="border-t p-4">
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
    </div>
  );
}
