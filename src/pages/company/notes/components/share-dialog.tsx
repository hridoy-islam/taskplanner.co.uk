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
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#000000' : '#e5e5e5',
      boxShadow: state.isFocused ? '0 0 0 1px #000000' : null,
      '&:hover': {
        borderColor: '#000000',
      },
      borderRadius: '0.375rem',
      padding: '0.125rem',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#f3f4f6',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#000000',
      fontWeight: '500',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#6b7280',
      ':hover': {
        backgroundColor: '#e5e5e5',
        color: '#000000',
      },
    }),
  };

  return (
    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
      <DialogContent className="bg-white text-black border-neutral-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Share Note</DialogTitle>
          <DialogDescription className="text-neutral-500">
            Invite others to collaborate on this note.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <Select
              options={userOptions}
              isMulti
              value={sharedWith}
              onChange={handleChange}
              className="w-full text-sm"
              placeholder="Select users to share with..."
              styles={customStyles}
            />
            <div className="text-sm font-medium text-black">Shared with:</div>
            <ScrollArea className="h-[150px] border border-neutral-200 rounded-md p-2">
              {(selectedNote?.sharedWith || []).length > 0 ? (
                (selectedNote?.sharedWith || []).map((userId: string) => {
                  const user = userOptions.find((u) => u.value === userId)
                  if (user) {
                    return (
                      <div key={user.value} className="flex items-center justify-between py-2 px-2 hover:bg-neutral-100 rounded-md">
                        <span className="text-sm font-medium">{user.label}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeShareUser(user)} className="text-neutral-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  }
                  return null
                })
              ) : (
                <div className="text-sm text-neutral-500 p-2">Not shared with anyone yet.</div>
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsShareDialogOpen(false)} >
            Cancel
          </Button>
          <Button onClick={handleShare} >
            Share Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}