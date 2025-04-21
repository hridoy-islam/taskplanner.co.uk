"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Camera, Loader, Settings2, UserPlus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserMinus } from "lucide-react"

export function GroupSidebar({
  isSidebarVisible,
  groupDetails,
  loading,
  error,
  user,
  isCurrentUserAdmin,
  handleMemberDialog,
  handleRemoveMember,
  handleChangeRole,
  setUploadOpen,
  setIsSettingsOpen,
  router,
}) {
  const groupName = groupDetails?.groupName || "Group Name"
  const groupImg = groupDetails?.image || "Group Image"

  return (
    <div
      className={cn(
        "fixed z-20 w-80 space-y-3 rounded-md bg-white p-4 transition-transform duration-300 ease-in-out max-md:border md:relative",
        isSidebarVisible ? "block" : "hidden",
        "md:block",
      )}
    >
      {/* Group header */}
      <div className="flex w-full items-start justify-between gap-2">
        <div className="relative h-10 w-10 overflow-hidden rounded-full">
          <img
            src={groupDetails?.image || "https://kzmjkvje8tr2ra724fhh.lite.vusercontent.net/placeholder.svg"}
            alt={`${groupDetails?.groupName}`}
            className="h-full w-full object-contain"
          />
          <Button
            size="icon"
            className="absolute right-0 top-4 h-4 w-4 rounded-full"
            onClick={() => setUploadOpen(true)}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-bold">
          {groupName.substring(0, 15)}
          {groupName.length > 15 && "..."}
        </h2>
        <div>
          {groupDetails?.members?.map((member) => {
            if (member._id === user?._id && isCurrentUserAdmin) {
              return (
                <Button key={member._id} onClick={() => setIsSettingsOpen(true)} variant={"secondary"} size={"sm"}>
                  <Settings2 className="h-4 w-4" />
                </Button>
              )
            }
            return null
          })}
        </div>
      </div>

      {/* Members header */}
      <div className="flex flex-row items-end justify-between">
        <h3 className="font-semibold">Group Members</h3>
        <div className="flex items-center justify-between gap-2">
          <Button variant={"outline"} size={"sm"} className="" onClick={handleMemberDialog}>
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Members list */}
      <ScrollArea className="xs:h-[calc(100%-10rem)] h-[calc(100%-11rem)] sm:h-[calc(100%-8rem)]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="text-red-500">Failed to load members: {error}</div>
        ) : (
          groupDetails?.members?.map((member) => (
            <div
              key={member?._id}
              className="border-s- mb-3 flex items-center justify-between space-x-2 border-b border-gray-300"
            >
              <div className="mb-1 ml-1 flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>
                    {member?.name
                      ?.split(" ")
                      ?.map((n) => n[0])
                      ?.join("") || "User"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm">{member.name}</span>
                  {groupDetails?.creator === member?._id ? (
                    <span
                      className={`${member?.role === "admin" && "w-fit max-w-prose bg-purple-600 px-1 text-white"} text-[9px]`}
                    >
                      owner
                    </span>
                  ) : (
                    <span
                      className={`${member?.role === "admin" && "w-fit max-w-prose bg-red-600 px-1 text-white"} text-[9px]`}
                    >
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                {isCurrentUserAdmin && (
                  <DropdownMenuTrigger>
                    <Button
                      className={`${groupDetails?.creator === member?._id ? "hidden" : ""}`}
                      variant={"ghost"}
                      size={"icon"}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                )}
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <>
                    <DropdownMenuItem onClick={() => handleChangeRole(member?._id, member?.role)}>
                      Make {member.role === "admin" ? "member" : "admin"}
                    </DropdownMenuItem>
                    {member?.role !== "admin" && (
                      <DropdownMenuItem onClick={() => handleRemoveMember(member._id)} className="flex justify-between">
                        <span>Remove</span>
                        <UserMinus className="h-4 w-4" />
                      </DropdownMenuItem>
                    )}
                  </>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </ScrollArea>

      {/* Return button */}
      <div className="flex flex-row gap-2">
        <Button
          variant="default"
          className="w-full text-gray-700 hover:bg-black hover:text-white"
          size="sm"
          onClick={() => router.push("/dashboard/group")}
        >
          Return
        </Button>
      </div>
    </div>
  )
}
