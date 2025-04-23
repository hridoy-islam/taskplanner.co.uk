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
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Loader from '@/components/shared/loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  router
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const groupName = groupDetails?.groupName || 'Group Name';
  const groupImg = groupDetails?.image || '/group-placeholder.svg';

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
                    className="max-h-68 w-72 bg-white overflow-y-auto scrollbar-hide"
                  >
                    <ScrollArea className="max-h-64 bg-white">
                      {loading ? (
                        <div className="flex h-32 items-center justify-center">
                          <Loader />
                        </div>
                      ) : (
                        groupDetails?.members?.map((member) => (
                          <div
                            key={member?._id}
                            className="flex items-center justify-between border-b p-2 bg-white text-black"
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
                                    className="w-48 cursor-pointer hover:bg-black hover:text-white"
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
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <UserMinus className="mr-2 h-4 w-4" />
                                        Remove
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenuSeparator />
              </>
            )}

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
    </div>
  );
};

export default GroupBar;
