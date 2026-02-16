'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Users } from 'lucide-react';

export function AddMemberDialog({
  isAddMemberOpen,
  setIsAddMemberOpen,
  searchQuery,
  setSearchQuery,
  filteredMembers,
  selectedMember2,
  setSelectedMember2,
  handleAddMember
}) {
  // Ensure selectedMember2 is treated as an array (fallback to [] if null/undefined)
  const selectedMembers = Array.isArray(selectedMember2) ? selectedMember2 : [];

  // Helper to handle row clicks for multiple selection/deselection
  const toggleMemberSelection = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMember2(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMember2([...selectedMembers, memberId]);
    }
  };

  return (
    <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
      <DialogContent className="border-gray-200 bg-white ">
        <DialogHeader>
          <DialogTitle className="text-xl text-black">
            Add New Members
          </DialogTitle>
          <DialogDescription className="text-black">
            Search and select users to add them to your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Modern Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search users by name..."
              className="w-full border-gray-200 bg-white pl-9 focus-visible:ring-taskplanner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Member List */}
          <ScrollArea className="h-[280px] w-full rounded-md border border-gray-200 bg-white p-2">
            {filteredMembers.length > 0 ? (
              <div className="space-y-1">
                {filteredMembers.map((member) => {
                  const isSelected = selectedMembers.includes(member.id);

                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMemberSelection(member.id)}
                      className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all duration-200 ${
                        isSelected
                          ? 'border-taskplanner/30 bg-taskplanner/30'
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleMemberSelection(member.id)}
                      />

                      <Avatar className="h-9 w-9 border border-gray-100">
                        <AvatarImage
                          src={member.image || '/placeholder.png'}
                          alt={member.name}
                          className="object-cover"
                        />
                        <AvatarFallback
                          className={
                            isSelected
                              ? 'bg-taskplanner text-white'
                              : 'bg-gray-100 text-gray-600'
                          }
                        >
                          {member?.name
                            ?.split(' ')
                            ?.map((n) => n[0])
                            ?.join('')
                            ?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-1 flex-col">
                        <Label
                          htmlFor={`member-${member.id}`}
                          className={`cursor-pointer text-sm font-medium ${isSelected ? 'text-taskplanner' : 'text-gray-900'}`}
                        >
                          {member.name}
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="flex h-full flex-col items-center justify-center space-y-3 text-gray-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm">No members found.</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="mt-2 flex-row items-center sm:justify-end">
          <div className="mt-2 flex w-full gap-2 sm:mt-0 sm:w-auto">
            {selectedMembers.length > 0 && (
              <Button variant="outline" onClick={() => setSelectedMember2([])}>
                Clear
              </Button>
            )}
            <Button
              disabled={selectedMembers.length === 0}
              className="w-full bg-taskplanner text-white hover:bg-taskplanner/90 sm:w-auto"
              onClick={() => {
                handleAddMember(); // Make sure your parent function handles an array now!
                setIsAddMemberOpen(false);
                setSelectedMember2([]); // Reset selection after adding
              }}
            >
              Add {selectedMembers.length > 1 ? 'Members' : 'Member'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
