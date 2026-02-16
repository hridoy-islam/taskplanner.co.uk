'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Plus, Search, Hash, Filter } from 'lucide-react';
import moment from 'moment';

interface NotesSidebarProps {
  notes: any[];
  sharedNotes: any[];
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  setSelectedNote: (note: any) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  isTagManagementOpen: boolean;
  setIsTagManagementOpen: (isOpen: boolean) => void;
  filteredTags: any[];
  tagSearchTerm: string;
  showFavorites: boolean;
  handleTagClick: (tagName: string) => void;
  selectedNoteId?: string;
}

export default function NotesSidebar({
  notes,
  sharedNotes,
  selectedTab,
  setSelectedTab,
  setSelectedNote,
  searchTerm,
  setSearchTerm,
  isDialogOpen,
  setIsDialogOpen,
  isTagManagementOpen,
  setIsTagManagementOpen,
  filteredTags,
  tagSearchTerm,
  showFavorites,
  handleTagClick,
  selectedNoteId
}: NotesSidebarProps) {
  // Helper function to safely strip HTML and truncate text
  const getPreviewText = (htmlContent: string) => {
    if (!htmlContent) return '';
    const stripped = htmlContent.replace(/<[^>]+>/g, '');
    return stripped.length > 20 ? stripped.substring(0, 20) + '...' : stripped;
  };

  return (
    <div className="flex w-96 flex-col border-r border-taskplanner/60 bg-white p-3">
      <div className=" flex items-center justify-between py-2">
        <h2 className="text-2xl font-bold text-black">Notes</h2>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-6 w-6" /> Add Note
        </Button>
      </div>

      <div className=" pb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 transform text-neutral-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search notes..."
            className="w-full rounded-full border-taskplanner/60 bg-neutral-100 py-3 pl-12 pr-4 text-black placeholder-neutral-500 focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {selectedTab === 'my-notes' && (
        <div className="flex items-center justify-between pb-4">
          <Button size="sm" onClick={() => setIsTagManagementOpen(true)}>
            <Hash className="mr-2 h-4 w-4" />
            Manage Tags
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 rounded-md border border-neutral-200 bg-white p-0 text-black shadow-lg"
              align="end"
            >
              <div className="flex flex-col p-2">
                <div
                  onClick={() => handleTagClick('All')}
                  className={`cursor-pointer rounded-md p-2 text-sm  ${
                    !tagSearchTerm && !showFavorites
                      ? 'bg-neutral-100 font-semibold'
                      : ''
                  }`}
                >
                  All Notes
                </div>
                <div
                  onClick={() => handleTagClick('Favorites')}
                  className={`cursor-pointer rounded-md p-2 text-sm  ${showFavorites ? 'bg-neutral-100 font-semibold' : ''}`}
                >
                  Favorites
                </div>
                <div className="my-2 border-t border-taskplanner/60" />
                <div className="max-h-56 overflow-y-auto">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <div
                        key={tag._id}
                        onClick={() => handleTagClick(tag.name)}
                        className={`cursor-pointer rounded-md p-2 text-sm  ${
                          tagSearchTerm === tag.name
                            ? 'bg-neutral-100 font-semibold'
                            : ''
                        }`}
                      >
                        <Hash className="mr-2 inline-block h-3 w-3 " />
                        {tag.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm ">No tags found.</div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <Tabs
        value={selectedTab}
        defaultValue="my-notes"
        onValueChange={(value) => {
          setSelectedTab(value);
          setSelectedNote(null);
        }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="">
          <TabsList className="grid w-full grid-cols-2 rounded-lg bg-taskplanner p-1">
            <TabsTrigger
              value="my-notes"
              className="rounded-md text-white data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              My Notes
            </TabsTrigger>
            <TabsTrigger
              value="shared-notes"
              className="rounded-md text-white data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              Shared Notes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="my-notes"
          className="flex-1 space-y-2  overflow-y-auto pt-4"
        >
          {notes.map((note) => {
            const isSelected = note._id === selectedNoteId;
            return (
              <div
                key={note._id}
                className={`cursor-pointer rounded-2xl border border-gray-200 p-5 transition-all ${
                  isSelected
                    ? 'bg-taskplanner text-white shadow-sm '
                    : 'bg-white hover:bg-neutral-50 '
                }`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3
                    className={`truncate text-lg font-bold ${isSelected ? 'text-white' : 'text-black'}`}
                  >
                    {note.title}
                  </h3>
                  {note.favorite && (
                    <span className="text-xl text-amber-500">★</span>
                  )}
                </div>

                <p className="mb-3 w-full  text-sm">
                  {getPreviewText(note.content)}
                </p>

                <div className="mb-3 flex flex-wrap gap-2">
                  {note.tags?.map((tag: any) => (
                    <span
                      key={tag._id}
                      className={`text-xs font-bold ${isSelected ? 'text-white' : ''}`}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
                <div
                  className={`text-xs ${isSelected ? 'text-white' : 'text-neutral-400'}`}
                >
                  {moment(note.updatedAt).fromNow()}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent
          value="shared-notes"
          className="flex-1 space-y-2 overflow-y-auto pt-4"
        >
          {sharedNotes.map((note) => {
            const isSelected = note._id === selectedNoteId;
            return (
              <div
                key={note._id}
                className={`cursor-pointer rounded-2xl border border-gray-200 p-5 transition-all ${
                  isSelected
                    ? 'bg-taskplanner text-white shadow-sm '
                    : 'bg-white hover:bg-neutral-50 '
                }`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3
                    className={`truncate text-lg font-bold ${isSelected ? 'text-white' : 'text-black'}`}
                  >
                    {note.title}
                  </h3>
                  {note.favorite && (
                    <span className="text-xl text-amber-500">★</span>
                  )}
                </div>

                <p className="mb-3 w-full  text-sm">
                  {getPreviewText(note.content)}
                </p>

                

                {/* Adapted the footer to show "Shared by" but with the active styling */}
                <div
                  className={`flex items-center justify-between text-xs ${
                    isSelected ? 'text-white' : 'text-black'
                  }`}
                >
                  <span>
                    Shared by{' '}
                    <span className="font-semibold">
                      {note.author?.name || 'Unknown'}
                    </span>
                  </span>

                  <span>{moment(note.updatedAt).fromNow()}</span>
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
