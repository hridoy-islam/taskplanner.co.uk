"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface CreateNoteDialogProps {
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
  addNewNote: (data: any) => Promise<void>
  isSubmitting: boolean
}

export default function CreateNoteDialog({
  isDialogOpen,
  setIsDialogOpen,
  addNewNote,
  isSubmitting,
}: CreateNoteDialogProps) {
  const { register, handleSubmit, reset } = useForm()

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogTitle>Enter Note Title</DialogTitle>

        <form
          onSubmit={handleSubmit((data) => {
            addNewNote(data)
            reset()
          })}
        >
          <Input
            {...register("title", { required: true })}
            placeholder="Note Title"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSubmit((data) => addNewNote(data))()
              }
            }}
            className="w-full "
          />

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Creating..." : "Create Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
