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
      <DialogContent className="bg-white text-black ">
        <DialogTitle className="text-xl font-semibold">Create a New Note</DialogTitle>

        <form
          onSubmit={handleSubmit((data) => {
            addNewNote(data)
            reset()
          })}
          className="mt-4"
        >
          <Input
            {...register("title", { required: true })}
            placeholder="Enter note title..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSubmit((data) => addNewNote(data))()
              }
            }}
            className="w-full border-neutral-300  rounded-md"
          />

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isSubmitting} >
              {isSubmitting ? "Creating..." : "Create Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}