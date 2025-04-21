'use client';

import {
  Button
} from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Hash,
  Share2,
  Trash,
  Star,
  Pen
} from 'lucide-react';
import { updateNote } from '@/redux/features/allNoteSlice';
import { useDispatch } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';

interface NotesContentProps {
  selectedNote: any;
  selectedTab: string;
  openUpdateModal: (note: any) => void;
  handleNoteAction: (action: string) => void;
  shareNote: () => void;
  addTag: (tag: any) => void;
  removeTag: (tag: any) => void;
  filteredTags: any[];
  tagSearchTerm: string;
  setTagSearchTerm: (term: string) => void;
  notes: any[];
  setSelectedNote: (note: any) => void;
}

export default function NotesContent({
  selectedNote,
  selectedTab,
  openUpdateModal,
  handleNoteAction,
  shareNote,
  addTag,
  removeTag,
  filteredTags,
  tagSearchTerm,
  setTagSearchTerm,
  notes,
  setSelectedNote
}: NotesContentProps) {
    const dispatch = useDispatch();
  const [content, setContent] = useState(selectedNote?.content || '');
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  // Sync content when selectedNote changes
  useEffect(() => {
    setContent(selectedNote?.content || '');
  }, [selectedNote]);

  // Handle content changes and auto-save
  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const now = Date.now();
    
    // Update local state immediately for optimistic UI update
    setContent(newContent);
    
    // Create a proper copy of the note with updated content, preserving structure
    const updatedNote = { 
      ...selectedNote,
      content: newContent,
      // Ensure author format is preserved exactly as it was
      author: selectedNote.author
    };
    
    // Update the note in the parent component to ensure it stays in the list
    setSelectedNote(updatedNote);
  
    // Only send update if 5 seconds have passed since last update
    if (now - lastUpdateTime >= 5000) {
      try {
        await dispatch(
          updateNote({
            noteId: selectedNote._id,
            noteData: { content: newContent }
          })
        ).unwrap();
        setLastUpdateTime(now);
      } catch (error) {
        console.error('Update failed:', error);
        // Keep the optimistic update even on error
      }
    }
  };
  
  // Also update the interval effect to ensure proper optimistic updates:
  
  useEffect(() => {
    if (!selectedNote?._id) return;
  
    const interval = setInterval(() => {
      const now = Date.now();
      if (content !== selectedNote.content && now - lastUpdateTime >= 5000) {
        // Create a copy of the current note with updated content for optimistic update
        const updatedNote = { ...selectedNote, content };
        
        // Keep the note in the parent component's state
        setSelectedNote(updatedNote);
        
        dispatch(
          updateNote({
            noteId: selectedNote._id,
            noteData: { content }
          })
        ).then(() => {
          setLastUpdateTime(now);
        }).catch(error => {
          console.error('Periodic save failed:', error);
          // Even on error, keep the optimistic update
        });
      }
    }, 1000); // Check every second
  
    return () => clearInterval(interval);
  }, [content, selectedNote, lastUpdateTime, dispatch, setSelectedNote]);

  if (!selectedNote) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500">
        Select a note or create a new one
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-gray-300 bg-gray-200 p-4">
        <div
          className="flex cursor-pointer items-center p-2"
          onClick={() => {
            if (selectedTab === 'my-notes') {
              openUpdateModal(selectedNote);
            }
          }}
        >
          <h2 className="font-semibold">{selectedNote.title}</h2>
          {selectedTab === 'my-notes' && (
            <Pen className="ml-2 h-4 w-4 text-gray-600" />
          )}
        </div>

        {selectedTab === 'my-notes' && (
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Hash className="mr-2 h-4 w-4" />
                  Add tag
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 border-none bg-white p-0 text-black">
                <div className="flex flex-col overflow-y-auto">
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={tagSearchTerm}
                    onChange={(e) => setTagSearchTerm(e.target.value)}
                    className="border-b border-gray-200 p-2 focus:outline-none"
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {filteredTags.length > 0 ? (
                      filteredTags.map((tag) => (
                        <div
                          key={tag?._id}
                          onClick={() => addTag(tag)}
                          className="cursor-pointer p-2 hover:bg-gray-200"
                        >
                          {tag.name}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">No tags found.</div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={() => handleNoteAction('update')} size="sm" className="h-8">
              Save
            </Button>

            <Button variant="ghost" size="icon" onClick={shareNote}>
              <Share2 className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleNoteAction('delete')}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNoteAction('favorite')}>
                  <Star
                    className={`mr-2 h-4 w-4 ${selectedNote.favorite ? 'text-orange-400' : ''}`}
                  />
                  <p className={`${selectedNote.favorite ? 'text-orange-400' : ''}`}>
                    Favorite Note
                  </p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </header>

      <main className="flex-1 bg-white p-6">
        {selectedTab === 'my-notes' && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedNote.tags?.map((tag) => (
              <span
                key={tag?._id}
                className="flex items-center rounded-full bg-violet-600 px-2 py-1 text-sm text-white"
              >
                {tag.name}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-white focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          disabled={selectedTab !== 'my-notes' || selectedNote.isArchive}
          className="h-[calc(100%-2rem)] w-full resize-none border-none bg-white focus:outline-none"
          value={content}
          onChange={handleContentChange}
          placeholder="Type your note here..."
        />
      </main>
    </div>
  );
}
