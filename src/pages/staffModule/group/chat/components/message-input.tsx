"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, X, File as FileIcon } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MessageInput({
  isAccessible,
  groupDetails,
  handleSubmit,
  handleCommentSubmit,
  register,
  handleKeyDown,
  isSubmitting,
  setIsImageUploaderOpen,
  files = [],
  setFiles,
  handleFileSubmit,
  editingMessage,
  cancelEdit,
  setValue, 
  handleEditSubmit,
  draggedFile,
  setDraggedFile,
  handleSendDraggedFile,
  handleRemoveDraggedFile,
  toast,
  user
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [mentionedUsers, setMentionedUsers] = useState<any[]>([])
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0)
  
  // Single robust state for mention list
  const [mentionQuery, setMentionQuery] = useState<{ query: string; start: number; end: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const mentionListRef = useRef<HTMLDivElement | null>(null)
  
  // Extract ref from register so we can track the cursor natively
  const { ref: rhfRef, ...rhfRest } = register("content", { required: true })

  // FIX 1: Detect and populate existing mentions when editing starts
  useEffect(() => {
    if (editingMessage?.id) {
      setValue("content", editingMessage.content)
      
      // Auto-detect existing mentions from the content based on group members
      if (groupDetails?.members && editingMessage.content) {
        const detectedMentions = groupDetails.members.filter(member => 
          editingMessage.content.includes(`@${member.name}`)
        )
        setMentionedUsers(detectedMentions)
      } else {
        setMentionedUsers([])
      }
    } else {
      setValue("content", "")
      setMentionedUsers([]) // Clear mentions for new message
    }
  }, [editingMessage?.id, editingMessage?.content, setValue, groupDetails?.members])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedMemberIndex(0)
  }, [mentionQuery?.query])

  // Click outside to close mention list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionListRef.current && 
        !mentionListRef.current.contains(event.target as Node) &&
        !textareaRef.current?.contains(event.target as Node)
      ) {
        setMentionQuery(null)
      }
    }

    if (mentionQuery) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mentionQuery])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = value.slice(0, cursorPosition)
    
    // FIX 2: Auto-remove the mention chip if the user manually backspaces the name in the textarea
    const remainingMentions = mentionedUsers.filter(u => value.includes(`@${u.name}`))
    if (remainingMentions.length !== mentionedUsers.length) {
      setMentionedUsers(remainingMentions)
    }
    
    // Check for @ mentions right behind the cursor (Allowed during edit now too)
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_ ]*)$/)

    if (match) {
      setMentionQuery({ query: match[1], start: match.index, end: cursorPosition })
    } else {
      setMentionQuery(null)
    }
  }

  const handleMentionSelect = (member: any) => {
    const currentContent = textareaRef.current?.value || ""
    if (!mentionQuery) return

    const newContent = 
      currentContent.slice(0, mentionQuery.start) + 
      `@${member.name} ` + 
      currentContent.slice(mentionQuery.end)

    setValue("content", newContent, { shouldValidate: true })
    
    // Add to mentioned users if not already there
    if (!mentionedUsers.find(u => u._id === member._id)) {
      setMentionedUsers([...mentionedUsers, member])
    }
    
    setMentionQuery(null)
    
    // Focus back and set cursor position
    if (textareaRef.current) {
      textareaRef.current.focus()
      const newCursorPos = mentionQuery.start + member.name.length + 2
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
  }

  // Filter members excluding current user and already mentioned users
  const availableMembers = groupDetails?.members?.filter((m) => {
    const isCurrentUser = m._id === user?._id
    const alreadyMentioned = mentionedUsers.some(u => u._id === m._id)
    const matchesQuery = m.name.toLowerCase().includes(mentionQuery?.query.toLowerCase() || "")
    return !isCurrentUser && !alreadyMentioned && matchesQuery
  }) || []

  const handleRemoveMention = (memberToRemove: any) => {
    // 1. Remove from the mentioned users array (chips)
    setMentionedUsers(mentionedUsers.filter(u => u._id !== memberToRemove._id))
    
    // FIX 3: Actually remove the text from the message content visually
    const currentContent = textareaRef.current?.value || ""
    const newContent = currentContent
      .replace(`@${memberToRemove.name}`, "")
      .replace(/\s{2,}/g, " ") // Clean up double spaces left behind
      .trimStart()
      
    setValue("content", newContent, { shouldValidate: true })
    
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const removeFile = (indexToRemove: number) => {
    if (setFiles) {
      setFiles((prev: any[]) => prev.filter((_, index) => index !== indexToRemove))
    }
  }

  const handleFormSubmit = async (data: any) => {
    // Add mentionBy field if there are mentioned users
    if (mentionedUsers.length > 0) {
      data.mentionBy = mentionedUsers.map(u => u._id)
    }
    
    if (editingMessage?.id) {
      await handleEditSubmit(data)
    } else {
      await handleCommentSubmit(data)
    }
    
    // Reset mentions
    setMentionedUsers([])
  }

  const handleKeyDownWithMention = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery && availableMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedMemberIndex((prev) => 
          prev < availableMembers.length - 1 ? prev + 1 : prev
        )
        return
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedMemberIndex((prev) => prev > 0 ? prev - 1 : 0)
        return
      }
      
      if (e.key === 'Enter') {
        e.preventDefault()
        handleMentionSelect(availableMembers[selectedMemberIndex])
        return
      }
      
      if (e.key === 'Escape') {
        e.preventDefault()
        setMentionQuery(null)
        return
      }
    }
    
    // Don't call original handleKeyDown for Enter when mention list is open
    if (mentionQuery && e.key === 'Enter') {
      return
    }
    
    handleKeyDown(e)
  }

  if (!isAccessible) return null

  return (
    <div className="p-4 relative">
      <form 
        onSubmit={handleSubmit(handleFormSubmit)} 
        className="flex flex-col space-y-2 relative"
      >
        {groupDetails?.status !== "archived" && (
          <>
            {editingMessage?.id && (
              <div className="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <span>Editing message...</span>
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit} className="h-6 px-2 hover:bg-amber-200 hover:text-amber-800">
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
            
            <div 
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              className={`relative flex flex-col rounded-xl border transition-colors duration-200 bg-white shadow-sm focus-within:ring-1 focus-within:ring-blue-500 ${
                isDragOver || draggedFile ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200"
              }`}
            >
              {/* Mention Dropdown List */}
              {mentionQuery && availableMembers.length > 0 && (
                <div 
                  ref={mentionListRef}
                  className="absolute bottom-[calc(100%+8px)] left-0 w-64 rounded-md border border-gray-200 bg-white shadow-lg z-50"
                >
                  <ScrollArea className="max-h-48 overflow-y-auto p-1">
                    <p className="text-xs font-semibold text-gray-500 px-2 py-1">Mention member</p>
                    {availableMembers.map((member, index) => (
                      <button
                        key={member._id}
                        type="button"
                        className={`flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors ${
                          index === selectedMemberIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleMentionSelect(member)
                        }}
                        onMouseEnter={() => setSelectedMemberIndex(index)}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.image} />
                          <AvatarFallback className="bg-taskplanner/10 text-taskplanner text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <span className="font-medium text-gray-800">{member.name}</span>
                          {member.email && <p className="text-xs text-gray-500 truncate">{member.email}</p>}
                        </div>
                      </button>
                    ))}
                  </ScrollArea>
                </div>
              )}

              <Textarea
                id="comment"
                {...rhfRest}
                ref={(e) => {
                  rhfRef(e)
                  textareaRef.current = e
                }}
                onChange={(e) => {
                  rhfRest.onChange(e)
                  handleInputChange(e)
                }}
                placeholder={
                  editingMessage?.id 
                    ? "Edit your message..." 
                    : files.length > 0 || draggedFile
                    ? "Press 'Send Files' to upload attachments..."
                    : "Type your comment here... (@ to mention)"
                }
                rows={1}
                className="min-h-[60px] w-full resize-none border-0 bg-transparent p-3 shadow-none focus-visible:ring-0"
                onKeyDown={handleKeyDownWithMention}
              />

              {/* Display mentioned users */}
              {mentionedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 px-3 pb-2">
                  {mentionedUsers.map((member) => (
                    <div key={member._id} className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      <span>@{member.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMention(member)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {files?.length > 0 && (
                <div className="flex flex-wrap gap-2 px-3 pb-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      <FileIcon className="h-3 w-3 text-blue-500" />
                      <span className="max-w-[150px] truncate font-medium">{file.name || 'Attached File'}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFile(i)} 
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 px-2 py-2">
                <div className="flex items-center">
                  {!editingMessage?.id && !draggedFile && (
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => setIsImageUploaderOpen(true)}
                    >
                      <Paperclip className="mr-2 h-4 w-4" /> Attachment
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {files?.length > 0 && !draggedFile ? (
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleFileSubmit}
                      disabled={isSubmitting}
                      className="h-8 rounded-lg px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Send Files
                    </Button>
                  ) : !draggedFile ? (
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={isSubmitting}
                      className="h-8 rounded-lg px-4 text-xs font-semibold bg-taskplanner hover:bg-taskplanner/90 text-white"
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      {editingMessage?.id ? "Update" : "Send"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  )
}