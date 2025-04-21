"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface TagManagementDialogProps {
  isTagManagementOpen: boolean
  setIsTagManagementOpen: (isOpen: boolean) => void
  newTag: string
  setNewTag: (tag: string) => void
  addNewTag: () => Promise<void>
  isTagSubmitting: boolean
  tags: any[]
  removeExistingTag: (tag: any) => Promise<void>
}

export default function TagManagementDialog({
  isTagManagementOpen,
  setIsTagManagementOpen,
  newTag,
  setNewTag,
  addNewTag,
  isTagSubmitting,
  tags,
  removeExistingTag,
}: TagManagementDialogProps) {
  return (
    <Dialog open={isTagManagementOpen} onOpenChange={setIsTagManagementOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="New tag name"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addNewTag()
                }
              }}
              className="w-full"
            />
            <Button onClick={addNewTag} disabled={isTagSubmitting}>
              {isTagSubmitting ? "Adding..." : "Add"}
            </Button>
          </div>

          <ScrollArea className="h-[200px]">
            {Array.isArray(tags) ? (
              tags.map((tag) => (
                <div key={tag._id} className="flex items-center justify-between py-2">
                  <span>{tag.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeExistingTag(tag)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p>Loading tags...</p>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
