"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function GroupSettingsDialog({ isSettingsOpen, setIsSettingsOpen, groupDetails, handleGroupDescriptionUpdate }) {
  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Group Info</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleGroupDescriptionUpdate}>
          <div className="space-t-4">
            <div>
              <Label>Group Name</Label>
              <Input
                placeholder="Group Name"
                className="mb-2 w-full"
                name="groupName"
                required
                defaultValue={groupDetails?.groupName}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Group Description"
                className="mb-2"
                name="groupDescription"
                defaultValue={groupDetails?.description}
              />
            </div>
            <div className="mt-3 flex flex-row items-center justify-center gap-3">
              <Label>Admin Only Message</Label>
              <Input
                className="h-5 w-5"
                name="isActive"
                type="checkbox"
                defaultChecked={groupDetails?.status !== "active"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="submit">
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
