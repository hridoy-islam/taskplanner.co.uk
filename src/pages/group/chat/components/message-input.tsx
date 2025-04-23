"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, X } from "lucide-react"
import { useEffect } from "react"

export function MessageInput({
  isAccessible,
  groupDetails,
  handleSubmit,
  handleCommentSubmit,
  register,
  handleKeyDown,
  isSubmitting,
  setIsImageUploaderOpen,
  files,
  handleFileSubmit,
  groupId,
  editingMessage,
  setEditingMessage,
  cancelEdit,
  setValue, 
  handleEditSubmit, 
}) {
  useEffect(() => {
    if (editingMessage?.id) {
      setValue("content", editingMessage.content)
    }
  }, [editingMessage, setValue])

  if (!isAccessible) return null

  return (
    <div className="p-4">
      <form 
        onSubmit={handleSubmit(editingMessage?.id ? handleEditSubmit : handleCommentSubmit)} 
        className="flex flex-col space-y-2"
      >
        {groupDetails?.status !== "archived" && (
          <>
            {editingMessage?.id && (
              <div className="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-sm">
                <span>Editing message</span>
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
            <div className={`flex items-center space-x-2`}>
              <Textarea
                id="comment"
                {...register("content", { required: true })}
                placeholder={editingMessage?.id ? "Edit your message..." : "Type your comment here..."}
                rows={1}
                className="flex-1 resize-none"
                onKeyDown={handleKeyDown}
              />

              <div className="flex max-w-full flex-col-reverse items-center gap-1">
                {!editingMessage?.id && (
                  <Button type="button" variant="outline" size="default" onClick={() => setIsImageUploaderOpen(true)}>
                    <Paperclip className="mr-2 h-4 w-4" /> Upload
                  </Button>
                )}

                {files.length > 0 ? (
                  <Button className="w-full" type="button" variant="outline" size="default" onClick={handleFileSubmit}>
                    Send Files
                  </Button>
                ) : (
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {editingMessage?.id ? "Update" : "Send"}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  )
}