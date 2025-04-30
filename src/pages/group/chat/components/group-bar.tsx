'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Camera,
  UserPlus,
  Settings,
  UserMinus,
  MoreVertical,
  Users,
  ArrowLeft,
  Loader2,
  File,
  Paperclip,
  EyeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Loader from '@/components/shared/loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import moment from 'moment';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
const GroupBar = ({
  groupDetails,
  user,
  isCurrentUserAdmin,
  handleMemberDialog,
  handleRemoveMember,
  handleChangeRole,
  setUploadOpen,
  setIsSettingsOpen,
  loading,
  router,
  comments
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const groupName = groupDetails?.groupName || 'Group Name';
  const groupImg = groupDetails?.image || '/group-placeholder.svg';
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="flex  flex-col ">
      <div className="flex items-center justify-between  bg-white p-3">
        <div className="flex flex-row items-center gap-8">
          <div
            className="w-4 cursor-pointer text-gray-700 "
            onClick={() => router.push('/dashboard/group')}
          >
            <ArrowLeft />
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={groupImg} alt={groupName} />
              <AvatarFallback>
                {groupName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold">{groupName}</h2>
          </div>
        </div>

        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 cursor-pointer bg-white text-black "
          >
            <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {isCurrentUserAdmin && (
              <>
                <DropdownMenuItem
                  onClick={() => setUploadOpen(true)}
                  className="cursor-pointer hover:bg-black hover:text-white"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Change Group Photo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsSettingsOpen(true)}
                  className="cursor-pointer hover:bg-black hover:text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Group Settings
                </DropdownMenuItem>

                {/* Show Members Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <DropdownMenuItem className="cursor-pointer hover:bg-black hover:text-white">
                      <Users className="mr-2 h-4 w-4" />
                      Show Members
                    </DropdownMenuItem>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="max-h-68 w-72 overflow-y-auto bg-white scrollbar-hide"
                  >
                    <ScrollArea className="max-h-64 bg-white">
                      {groupDetails?.members?.map((member) => (
                        <div
                          key={member?._id}
                          className="flex items-center justify-between border-b bg-white p-2 text-black"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={member.image}
                                alt={member.name}
                              />
                              <AvatarFallback className="bg-gray-100 text-xs">
                                {member?.name
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium leading-tight">
                                {member.name}
                              </p>
                              <p
                                className={`text-xs ${
                                  groupDetails?.creator === member?._id
                                    ? 'text-purple-600'
                                    : member?.role === 'admin'
                                      ? 'text-blue-600'
                                      : 'text-gray-500'
                                }`}
                              >
                                {groupDetails?.creator === member?._id
                                  ? 'Owner'
                                  : member.role}
                              </p>
                            </div>
                          </div>

                          {isCurrentUserAdmin &&
                            groupDetails?.creator !== member?._id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48 cursor-pointer bg-white text-black "
                                >
                                  <DropdownMenuLabel>
                                    Member Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleChangeRole(
                                        member?._id,
                                        member?.role
                                      )
                                    }
                                    className="hover:bg-black hover:text-white"
                                  >
                                    Make{' '}
                                    {member.role === 'admin'
                                      ? 'Member'
                                      : 'Admin'}
                                  </DropdownMenuItem>
                                  {member?.role !== 'admin' && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleRemoveMember(member._id)
                                      }
                                      className="text-red-600 hover:bg-black hover:text-red-600"
                                    >
                                      <UserMinus className="mr-2 h-4 w-4" />
                                      Remove
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </div>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <DropdownMenuItem
              onClick={handleOpenDialog}
              className="cursor-pointer hover:bg-black hover:text-white"
            >
              <File className="mr-2 h-4 w-4" />
              Files
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleMemberDialog}
              className="cursor-pointer"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Members
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogTrigger />
        <DialogContent className="mx-auto max-w-2xl rounded-md bg-white p-4 shadow-lg">
          <DialogTitle className="text-xl font-semibold">Files</DialogTitle>
          <DialogDescription className="mt-2">
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 gap-4">
                {comments
                  .filter((comment) => comment.isFile)
                  .map((comment) => {
                    let fileContent;
                    try {
                      fileContent = JSON.parse(comment.content);
                    } catch (error) {
                      fileContent = comment.content;
                    }

                    const fileUrl =
                      typeof fileContent === 'object'
                        ? fileContent.url
                        : fileContent;

                    return (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        key={comment._id} // move key here
                      >
                        <Card className="cursor-pointer border border-gray-200 p-4 shadow-md hover:bg-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {typeof fileContent === 'object' &&
                              fileContent.mimeType?.startsWith('image/') ? (
                                <img
                                  src={fileContent.url}
                                  alt={fileContent.originalFilename}
                                  className="h-16 w-16 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100">
                                  <Paperclip className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">
                                  {typeof fileContent === 'object'
                                    ? fileContent.originalFilename
                                    : 'File'}
                                </h3>
                                <EyeIcon className="h-5 w-5 text-blue-500" />
                              </div>
                              <p className="text-sm text-gray-500">
                                Uploaded by {comment.authorId?.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {moment(comment.createdAt).format(
                                  'MMM D, YYYY h:mm A'
                                )}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </a>
                    );
                  })}
              </div>

              {comments.filter((comment) => comment.isFile).length === 0 && (
                <div className="flex h-full flex-col items-center justify-center py-8 text-gray-500">
                  <Paperclip className="h-12 w-12" />
                  <p className="mt-2">No files shared yet</p>
                </div>
              )}
            </ScrollArea>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupBar;
