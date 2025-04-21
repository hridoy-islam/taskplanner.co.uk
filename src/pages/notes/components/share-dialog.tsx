"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { X } from "lucide-react"
import Select from "react-select"

interface ShareDialogProps {
  isShareDialogOpen: boolean
  setIsShareDialogOpen: (isOpen: boolean) => void
  selectedNote: any
  userOptions: any[]
  sharedWith: any[]
  handleChange: (selectedOptions: any) => void
  removeShareUser: (user: any) => Promise<void>
  handleShare: () => Promise<void>
}

export default function ShareDialog({
  isShareDialogOpen,
  setIsShareDialogOpen,
  selectedNote,
  userOptions,
  sharedWith,
  handleChange,
  removeShareUser,
  handleShare,
}: ShareDialogProps) {
  return (
    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>Choose users to share this note with and assign tags.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="users" className="w-full">
          <TabsContent value="users">
            <div className="space-y-4">
              <Select
                options={userOptions}
                isMulti
                value={sharedWith}
                onChange={handleChange}
                className="w-full"
                placeholder="Select users..."
              />
              <ScrollArea key={selectedNote?._id} className="h-[200px]">
                {(selectedNote?.sharedWith || []).map((userId) => {
                  const user = userOptions.find((user) => user.value === userId)
                  if (user) {
                    return (
                      <div key={user.value} className="mb-2 flex items-center space-x-2">
                        <label htmlFor={`user-${user.value}`} className="flex-1">
                          {user.label}
                        </label>
                        <Button variant="ghost" size="sm" onClick={() => removeShareUser(user)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  }
                  return null
                })}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare}>Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
