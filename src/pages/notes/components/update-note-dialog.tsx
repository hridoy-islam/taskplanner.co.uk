"use client"

import UpdateNote from "@/components/shared/update-note"

interface UpdateNoteDialogProps {
  selectedNote: any
  isOpen: boolean
  onClose: () => void
  onConfirm: (note: any) => Promise<void>
  loading: boolean
}

export default function UpdateNoteDialog({ selectedNote, isOpen, onClose, onConfirm, loading }: UpdateNoteDialogProps) {
  return (
    <UpdateNote
      selectNote={selectedNote}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title="Update"
      description="Edit the Note Title."
    />
  )
}
