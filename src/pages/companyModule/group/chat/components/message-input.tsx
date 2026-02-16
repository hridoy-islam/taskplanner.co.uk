"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, X, File as FileIcon, Reply } from "lucide-react"
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
  user,
  replyingTo, 
  cancelReply 
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

  useEffect(() => {
    if (editingMessage?.id) {
      setValue("content", editingMessage.content)
      if (groupDetails?.members && editingMessage.content) {
        const detectedMentions = groupDetails.members.filter(member => 
          editingMessage.content.includes(`@${member.name}`)
        )
        setMentionedUsers(detectedMentions)
      } else {
        setMentionedUsers([])
      }
    } else {
      if (!textareaRef.current?.value) {
        setValue("content", "")
        setMentionedUsers([]) 
      }
    }
  }, [editingMessage?.id, editingMessage?.content, setValue, groupDetails?.members])

  // Focus textarea when clicking reply
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyingTo])

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
    
    // Auto-remove the mention chip if the user manually modifies the name in the textarea
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

  const removeFile = (indexToRemove: number) => {
    if (setFiles) {
      setFiles((prev: any[]) => prev.filter((_, index) => index !== indexToRemove))
    }
  }

  const handleFormSubmit = async (data: any) => {
    if (mentionedUsers.length > 0) {
      data.mentionBy = mentionedUsers.map(u => u._id)
    }
    
    if (editingMessage?.id) {
      await handleEditSubmit(data)
    } else {
      await handleCommentSubmit(data)
    }
    
    setMentionedUsers([])
  }

  const handleKeyDownWithMention = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 1. Handle Navigation within the Mention Dropdown
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

    // 2. Handle WhatsApp-style Mention Block Deletion
    if (e.key === 'Backspace' && textareaRef.current) {
      const textarea = textareaRef.current
      // Only trigger if cursor is collapsed (no text is actively highlighted/selected)
      if (textarea.selectionStart === textarea.selectionEnd) {
        const cursorPosition = textarea.selectionStart
        const content = textarea.value
        const textBeforeCursor = content.slice(0, cursorPosition)

        let matchedMention = null
        let matchStringLength = 0

        // Sort mentions by length descending so longer names match first 
        // (prevents deleting "@John" if the user actually mentioned "@John Doe")
        const sortedMentions = [...mentionedUsers].sort((a, b) => b.name.length - a.name.length)

        for (const member of sortedMentions) {
          const exactMention = `@${member.name}`
          const exactMentionWithSpace = `@${member.name} `

          if (textBeforeCursor.endsWith(exactMentionWithSpace)) {
            matchedMention = member
            matchStringLength = exactMentionWithSpace.length
            break
          } else if (textBeforeCursor.endsWith(exactMention)) {
            matchedMention = member
            matchStringLength = exactMention.length
            break
          }
        }

        // If cursor is right after a mention, delete the whole block
        if (matchedMention) {
          e.preventDefault() // Stop default single-character backspace

          const newContent = 
            content.slice(0, cursorPosition - matchStringLength) + 
            content.slice(cursorPosition)
          
          setValue("content", newContent, { shouldValidate: true })
          
          // Remove member from the active mentions array
          setMentionedUsers((prev) => prev.filter(u => u._id !== matchedMention._id))

          // Put the cursor back in the correct position
          const newCursorPos = cursorPosition - matchStringLength
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus()
              textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
            }
          }, 0)
          
          return
        }
      }
    }

    if (mentionQuery && e.key === 'Enter') {
      return
    }
    
    // Normal submission handler
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

            {replyingTo && !editingMessage?.id && (
              <div className="flex items-center justify-between rounded-t-md border-l-4 border-[#38ada9] bg-gray-50 px-3 py-2 shadow-sm">
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-[#38ada9] flex items-center">
                    <Reply className="h-3 w-3 mr-1" />
                    Replying to {replyingTo.authorId?.name}
                  </span>
                  <span className="truncate text-xs text-gray-600 mt-0.5 max-w-[80%]">
                    {replyingTo.isFile ? "📎 Attached File" : replyingTo.content}
                  </span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={cancelReply} className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-200">
                  <X className="h-4 w-4" />
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