'use client';

import { Button } from '@/components/ui/button';
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
  Pen,
  Save,
  Loader2,
  X
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment';

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
  updateNoteApi: (noteId: string, noteData: any) => Promise<void>;
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
  setSelectedNote,
  updateNoteApi
}: NotesContentProps) {
  const [content, setContent] = useState(selectedNote?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  // Sync content when a different note is selected
  useEffect(() => {
    setContent(selectedNote?.content || '');
  }, [selectedNote?._id]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Update locally for instantaneous UI updates in the sidebar
    const updatedNote = { ...selectedNote, content: newContent };
    setSelectedNote(updatedNote);
  };

  // Manual Save Function
  const handleManualSave = async () => {
    if (!selectedNote?._id) return;
    setIsSaving(true);
    try {
      await updateNoteApi(selectedNote._id, { content });
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedNote) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white text-black">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Write down your ideas 💡</h1>
          <p className="text-lg text-neutral-500">
            Select a note or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link']
    ]
  };

  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="flex min-h-[5rem] flex-wrap items-center justify-between gap-4 border-b border-taskplanner/60 p-6">
        {/* Added min-w-0 and flex-1 so this side can take up available space and wrap text properly */}
        <div className="flex min-w-0 flex-1 flex-col space-y-1">
          <div
            className="group flex cursor-pointer items-start" // Changed to items-start so icon stays at the top if text wraps
            onClick={() =>
              selectedTab === 'my-notes' && openUpdateModal(selectedNote)
            }
          >
            {/* Added break-words so long text will wrap to the next line and push the height down */}
            <h1 className="mr-2 break-words text-sm font-semibold text-black">
              {selectedNote.title}
            </h1>
            {selectedTab === 'my-notes' && (
              <Pen className="mt-1 h-5 w-5 shrink-0 transition-colors group-hover:text-black" /> // Added shrink-0 and mt-1 for alignment
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-normal">
            <span>Last updated {moment(selectedNote.updatedAt).fromNow()}</span>
            {selectedNote.favorite && (
              <Star className="h-4 w-4 shrink-0 fill-current text-amber-500" />
            )}
          </div>
        </div>

        {selectedTab === 'my-notes' && (
          <div className="flex flex-wrap items-center gap-2">
            {/* The New Save Button */}
            <Button
              onClick={handleManualSave}
              size={'sm'}
              disabled={isSaving || selectedNote.isArchive}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4 shrink-0" />
              )}
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm">
                  <Hash className="mr-2 h-4 w-4 shrink-0" />
                  Add tag
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 rounded-md border border-neutral-200 bg-white p-0 text-black shadow-lg">
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={tagSearchTerm}
                    onChange={(e) => setTagSearchTerm(e.target.value)}
                    className="border-b border-taskplanner/60 p-3 text-sm focus:outline-none"
                  />
                  <div className="max-h-56 overflow-y-auto p-2">
                    {filteredTags.length > 0 ? (
                      filteredTags.map((tag) => (
                        <div
                          key={tag?._id}
                          onClick={() => addTag(tag)}
                          className="cursor-pointer rounded-md p-2 text-sm hover:bg-gray-100"
                        >
                          {tag.name}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-neutral-500">
                        No tags found.
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button size="sm" onClick={shareNote} className="">
              <Share2 className="mr-2 h-4 w-4 shrink-0" /> Share
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={` border-gray-200 transition-colors ${
                selectedNote.favorite
                  ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-50 hover:text-amber-500/90'
                  : ''
              }`}
              onClick={() => handleNoteAction('favorite')}
              title="Favorite"
            >
              <Star
                className={`mr-2 h-4 w-4 shrink-0 ${selectedNote.favorite ? 'fill-current' : ''}`}
              />{' '}
              Favorite
            </Button>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleNoteAction('delete')}
              title="Delete Note"
            >
              <Trash className="mr-2 h-4 w-4 shrink-0" /> Delete
            </Button>
          </div>
        )}
      </header>

      <main className="flex flex-1 flex-col overflow-hidden p-6">
        {selectedTab === 'my-notes' && selectedNote.tags?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {selectedNote.tags.map((tag: any) => (
              <span
                key={tag?._id}
                className="flex items-center rounded-full bg-taskplanner px-3 py-1 text-sm font-medium text-white"
              >
                <Hash className="mr-1 h-3 w-3 text-white" />
                {tag.name}
                <button
                  onClick={() => removeTag(tag?._id)}
                  className="ml-2 text-neutral-500 hover:text-black focus:outline-none"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Note the ID and relative class added to this wrapper div */}
        <div id="editor-wrapper" className="relative flex-1 ">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            readOnly={selectedTab !== 'my-notes' || selectedNote.isArchive}
            modules={modules}
            bounds="#editor-wrapper"
            className="z-[9999] h-[70vh] [&_.ql-container]:border-none [&_.ql-editor]:text-lg [&_.ql-editor]:text-black [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-taskplanner/60 [&_.ql-tooltip]:!left-auto [&_.ql-tooltip]:md:!left-[0px]"
            placeholder="Start writing..."
          />
        </div>
      </main>
    </div>
  );
}
