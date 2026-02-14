import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import {
  Camera,
  Settings,
  Users,
  UserPlus,
  UserMinus,
  File,
  Paperclip,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import moment from 'moment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function RightSidebar({
  groupDetails,
  user,
  isCurrentUserAdmin,
  handleMemberDialog,
  handleRemoveMember,
  handleChangeRole,
  setUploadOpen,
  setIsSettingsOpen,
  comments
}) {
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'files'

  const groupName = groupDetails?.groupName || 'Group Name';
  const groupImg = groupDetails?.image || '/group-placeholder.svg';

  const files = comments.filter((comment) => comment.isFile);
  const recentFiles = files.slice(-3).reverse(); // Get latest 3 files

  // Helper function to safely extract file URL, Image status, and File Name
  const getFileDetails = (comment) => {
    let fileContent;
    try {
      fileContent = JSON.parse(comment.content);
    } catch (e) {
      fileContent = comment.content;
    }

    const fileUrl =
      typeof fileContent === 'object'
        ? fileContent.url || fileContent.fileUrl || ''
        : fileContent;

    let isImage = false;
    // Check if it's an image via mimeType (if object) or by file extension/URL (if string)
    if (typeof fileContent === 'object' && fileContent.mimeType) {
      isImage = fileContent.mimeType.startsWith('image/');
    } else if (typeof fileUrl === 'string') {
      isImage =
        !!fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) ||
        fileUrl.startsWith('data:image/') ||
        fileUrl.includes('image');
    }

    const fileName =
      typeof fileContent === 'object' && fileContent.originalFilename
        ? fileContent.originalFilename
        : 'File';

    return { fileUrl, isImage, fileName };
  };

  const renderOverview = () => (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white">
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col items-center border-b border-gray-200 pb-6">
          <Avatar className="mb-4 h-24 w-24 border-2 border-white shadow-sm ring-1 ring-gray-100">
            <AvatarImage
              src={groupImg || '/group-placeholder.jpg'}
              alt={groupName || 'Group profile'}
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-50">
              {/* This image shows if AvatarImage fails */}
              <img
                src="/group-placeholder.jpg"
                alt="placeholder"
                className="h-full w-full object-cover opacity-60"
              />
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{groupName}</h2>
          <p className="mt-1  text-sm">
            Group · {groupDetails?.members?.length || 0} members
          </p>
        </div>

        {/* Admin Actions */}
        {isCurrentUserAdmin && (
          <div className="space-y-2 border-b border-gray-200 py-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => setUploadOpen(true)}
            >
              <Camera className="mr-3 h-5 w-5 " />
              Change Group Photo
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="mr-3 h-5 w-5 " />
              Group Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={handleMemberDialog}
            >
              <UserPlus className="mr-3 h-5 w-5 " />
              Add Members
            </Button>
          </div>
        )}
        {/* Media/Files Preview */}
        <div className="border-b border-gray-200 py-4">
          <Button
            variant="ghost"
            className="mb-3 w-full justify-between px-2 "
            onClick={() => setCurrentView('files')}
          >
            <div className="flex items-center">
              <File className="mr-3 h-5 w-5 " />
              <span className="font-medium">Media and Docs</span>
            </div>
            <div className="flex items-center ">
              <span className="mr-2 text-sm">{files.length}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Button>

          {/* 3 Photos/Files Preview */}
          <div className="grid grid-cols-3 gap-2 px-2">
            {recentFiles.map((comment) => {
              const { fileUrl, isImage } = getFileDetails(comment);

              return (
                <a
                  key={comment._id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square overflow-hidden rounded-md bg-gray-100 transition-opacity hover:opacity-80"
                >
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt="File"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <Paperclip className="h-6 w-6 " />
                    </div>
                  )}
                </a>
              );
            })}
          </div>
          {recentFiles.length === 0 && (
            <p className="px-2  text-xs">No files shared yet.</p>
          )}
        </div>

        <div className="py-4">
          <div className="mb-4 flex items-center px-2 ">
            <Users className="mr-3 h-5 w-5" />
            <span className="font-medium">
              {groupDetails?.members?.length || 0} Members
            </span>
          </div>

          <div className="space-y-1">
            {groupDetails?.members?.map((member) => (
              <div
                key={member?._id}
                className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-100">
                    <AvatarImage
                      src={member.image || '/placeholder.png'}
                      alt={member.name || 'User avatar'}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-100 font-medium text-gray-600">
                      {member?.name
                        ?.split(' ')
                        ?.map((n) => n[0])
                        ?.join('')
                        ?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-row items-center gap-2">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs ">
                      {groupDetails?.creator._id === member?._id && (
                        <span className="inline-flex items-center rounded-full border border-taskplanner/20 bg-taskplanner/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-taskplanner">
                          Admin
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {isCurrentUserAdmin &&
                  groupDetails?.creator !== member?._id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-white"
                      >
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleChangeRole(member?._id, member?.role)
                          }
                        >
                          Make {member.role === 'admin' ? 'Member' : 'Admin'}
                        </DropdownMenuItem>
                        {member?.role !== 'admin' && (
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member._id)}
                            className="text-red-600"
                          >
                            <UserMinus className="mr-2 h-4 w-4" /> Remove
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Direct Members List */}
      </ScrollArea>
    </div>
  );

  const renderFilesList = () => (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white">
      <div className="flex items-center p-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView('overview')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="ml-2 text-lg font-semibold">Files & Media</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {files.map((comment) => {
            const { fileUrl, isImage, fileName } = getFileDetails(comment);

            return (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                key={comment._id}
              >
                <Card className="flex items-start gap-3 border-gray-100 p-3 shadow-sm hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    {isImage ? (
                      <img
                        src={fileUrl}
                        alt="File"
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100">
                        <Paperclip className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium">{fileName}</h3>
                    <p className="truncate  text-xs">
                      By {comment.authorId?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {moment(comment.createdAt).format('MMM D, YYYY')}
                    </p>
                  </div>
                </Card>
              </a>
            );
          })}
          {files.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 ">
              <Paperclip className="mb-2 h-12 w-12" />
              <p>No files shared yet</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {currentView === 'overview' && renderOverview()}
      {currentView === 'files' && renderFilesList()}
    </>
  );
}
