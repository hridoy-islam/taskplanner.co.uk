"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X, Hash, Trash } from "lucide-react"

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
      <DialogContent className="bg-white text-black border-neutral-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Create a new tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addNewTag()
                }
              }}
              className="flex-1 border-neutral-300 focus:border-black focus:ring-black rounded-md"
            />
            <Button onClick={addNewTag} disabled={isTagSubmitting || !newTag.trim()} >
              {isTagSubmitting ? "Adding..." : "Add"}
            </Button>
          </div>

          <div className="text-sm font-medium text-black">Existing Tags:</div>
          <ScrollArea className="h-[250px] border border-neutral-200 rounded-md p-2">
            {Array.isArray(tags) && tags.length > 0 ? (
              tags.map((tag) => (
                <div key={tag._id} className="flex items-center cursor-pointer justify-between py-2 px-2 hover:bg-neutral-100 rounded-md group">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-neutral-500" />
                    <span className="text-sm font-medium">{tag.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeExistingTag(tag)} className="text-neutral-500 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-100 h-8 w-8 p-0 transition-opacity">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 p-2">No tags created yet.</p>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsTagManagementOpen(false)} >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}