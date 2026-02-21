"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import moment from "moment"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: {
    taskName: string
    description: string
    dueDate: string
  }
  onSave: (updatedTask: {
    taskName: string
    description: string
    dueDate: string
  }) => void
}

export function EditTaskDialog({ open, onOpenChange, task, onSave }: EditTaskDialogProps) {
  const [editedTask, setEditedTask] = useState({
    taskName: "",
    description: "",
    dueDate: new Date().toISOString(),
  })

  // Update local state when the dialog opens or task prop changes
  useEffect(() => {
    if (task) {
      setEditedTask({
        taskName: task.taskName || "",
        description: task.description || "",
        dueDate: task.dueDate || new Date().toISOString(),
      })
    }
  }, [task, open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedTask((prev) => ({ ...prev, [name]: value }))
  }

  // Updated to accept Date | null to match react-datepicker's onChange signature
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setEditedTask((prev) => ({
        ...prev,
        dueDate: date.toISOString(),
      }))
    }
  }

  const handleSave = () => {
    if (!editedTask.taskName.trim()) {
      alert("Task name is required")
      return
    }

    onSave(editedTask)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Task Name</label>
            <Textarea
              name="taskName"
              value={editedTask.taskName}
              onChange={handleInputChange}
              placeholder="Enter task name"
              className="min-h-[60px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={editedTask.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">Due Date</label>
            <DatePicker
              selected={editedTask.dueDate ? new Date(editedTask.dueDate) : null}
              onChange={handleDateChange}
              minDate={new Date()}
              dateFormat="dd-MM-yyyy"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}