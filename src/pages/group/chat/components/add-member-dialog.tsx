"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AddMemberDialog({
  isAddMemberOpen,
  setIsAddMemberOpen,
  searchQuery,
  setSearchQuery,
  filteredMembers,
  selectedMember2,
  setSelectedMember2,
  handleAddMember,
}) {
  return (
    <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Select Member</Label>
            <Input
              placeholder="Search User"
              className="mb-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div key={member.id} className="mb-2 flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`member-${member.id}`}
                      name="member-selection"
                      checked={selectedMember2 === member.id}
                      onChange={() => setSelectedMember2(member.id)}
                
                    />
                    <Label htmlFor={`member-${member.id}`} className="flex items-center space-x-2">
                      <Avatar className="inline-block">
                        <AvatarFallback>
                          {member?.name
                            ?.split(" ")
                            ?.map((n) => n[0])
                            ?.join("") || "User"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No members found.</p>
              )}
            </ScrollArea>
          </div>
        </div>

        {selectedMember2 !== null && (
          <DialogFooter>
            <Button variant="default" onClick={() => setSelectedMember2(null)}>
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                handleAddMember()
                setIsAddMemberOpen(false)
              }}
            >
              Add Member
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
