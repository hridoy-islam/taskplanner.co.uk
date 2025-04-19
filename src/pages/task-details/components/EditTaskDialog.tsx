"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import moment from "moment"
import { useEffect, useState } from "react"

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

  const handleDateChange = (date: Date | undefined) => {
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

          <div className="space-y-1">
            <label className="text-sm font-medium">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="default" className="w-full justify-start text-left border font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editedTask.dueDate ? moment(editedTask.dueDate).format("MMM DD, YYYY") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={editedTask.dueDate ? new Date(editedTask.dueDate) : undefined}
                  onSelect={handleDateChange}
                  initialFocus
              
                />
              </PopoverContent>
            </Popover>
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
