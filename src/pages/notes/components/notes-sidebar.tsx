"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PlusCircle, Search, Hash } from "lucide-react"

interface NotesSidebarProps {
  notes: any[]
  sharedNotes: any[]
  selectedTab: string
  setSelectedTab: (tab: string) => void
  setSelectedNote: (note: any) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
  isTagManagementOpen: boolean
  setIsTagManagementOpen: (isOpen: boolean) => void
  filteredTags: any[]
  tagSearchTerm: string
  showFavorites: boolean
  handleTagClick: (tagName: string) => void
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
}: NotesSidebarProps) {
  return (
    <div className="w-80 overflow-y-auto border-r border-gray-300 bg-gray-200">
      <div className="overflow-hidden px-2 py-4">
        <Button
          variant="ghost"
          className="w-full justify-center border border-gray-400 text-gray-700 hover:bg-black"
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {selectedTab === "my-notes" && (
        <div className="flex flex-row items-center justify-between px-2">
          <Button onClick={() => setIsTagManagementOpen(true)}>
            <Hash className="mr-2 h-4 w-4" />
            Manage Tags
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 ">
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 border-none bg-white p-0 text-black">
              <div className="flex flex-col overflow-y-auto">
                <div className="max-h-48 overflow-y-auto">
                  <div>
                    <div
                      onClick={() => handleTagClick("All")}
                      className={`cursor-pointer p-2 hover:bg-gray-200 ${
                        !tagSearchTerm && !showFavorites ? "font-bold" : ""
                      }`}
                    >
                      All
                    </div>

                    <div
                      onClick={() => handleTagClick("Favorites")}
                      className={`cursor-pointer p-2 hover:bg-gray-200 ${showFavorites ? "font-bold" : ""}`}
                    >
                      Favorites
                    </div>

                    {filteredTags.length > 0 ? (
                      filteredTags.map((tag) => (
                        <div
                          key={tag._id}
                          onClick={() => handleTagClick(tag.name)}
                          className={`cursor-pointer p-2 hover:bg-gray-200 ${
                            tagSearchTerm === tag.name ? "font-bold" : ""
                          }`}
                        >
                          {tag.name}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">No tags found.</div>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="p-2 ">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-600" size={18} />
          <Input
            type="text"
            placeholder="Search"
            className="border border-gray-400 pl-10 focus:ring-0 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-2 ">
        <Tabs
          value={selectedTab}
          defaultValue="my-notes"
          onValueChange={(value) => {
            setSelectedTab(value)
            setSelectedNote(null)
          }}
          className="w-full "
        >
          <TabsList className="grid w-full grid-cols-2 ">
            <TabsTrigger value="my-notes">My Notes</TabsTrigger>
            <TabsTrigger value="shared-notes">Shared Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="my-notes">
            <div className="flex flex-col gap-2 overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`cursor-pointer rounded-md border border-gray-200 p-4 hover:bg-gray-400 ${note?.favorite ? "bg-orange-200" : "bg-white"}`}
                  onClick={() => setSelectedNote(note)}
                >
                  <h3 className="truncate font-semibold">{note.title}</h3>
                  <p className="w-full truncate text-sm text-gray-600">
                    {note.content.length > 40 ? note.content.substring(0, 40) + "..." : note.content}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {note.tags?.map((tag) => (
                      <span key={tag._id} className="rounded-full bg-violet-600 p-1 text-[10px] text-white">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shared-notes">
            <div className="flex flex-col gap-2 overflow-y-auto ">
              {sharedNotes.map((note) => (
                <div
                  key={note.id}
                  className="cursor-pointer rounded-md border border-gray-200 bg-gray-100 p-4 hover:bg-gray-400"
                  onClick={() => setSelectedNote(note)}
                >
                  <h3 className="truncate font-semibold">{note.title}</h3>
                  <p className="w-full truncate text-sm text-gray-600">
                    {note.content.length > 40 ? note.content.substring(0, 40) + "..." : note.content}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
