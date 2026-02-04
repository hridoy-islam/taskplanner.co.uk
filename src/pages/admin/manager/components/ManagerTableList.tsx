import { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, UserCheck, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import CreateCreator from './CreateManager';
import UpdateCreator from './UpdateManager';
import { BlinkingDots } from '@/components/shared/blinking-dots';

export default function ManagerTableList({
  refreshKey
}: {
  refreshKey?: number;
}) {
  const { user } = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Separate Input State from Search Trigger State
  const [inputValue, setInputValue] = useState(''); // Stores text as you type
  const [searchTerm, setSearchTerm] = useState(''); // Stores value only when 'Search' is clicked

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [companies, setCompanies] = useState([]);
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);

  // Edit Dialog State
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(
    null
  );
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const handleRefresh = () => {
    setInternalRefreshKey((prev) => prev + 1);
  };

  const getInitials = (name: string) => {
    return name?.slice(0, 2).toUpperCase() || 'CR';
  };

  const fetchData = useCallback(
    async (page, entriesPerPage, term = '') => {
      setIsLoading(true);
      try {
        let endpoint;
        if (user.role === 'company') {
          endpoint = `/users?role=creator&company=${user._id}&page=${page}&limit=${entriesPerPage}&searchTerm=${term}`;
        } else {
          endpoint = `/users?role=creator&page=${page}&limit=${entriesPerPage}&searchTerm=${term}`;
        }
        const res = await axiosInstance.get(endpoint);
        setUsers(res.data.data.result);
        setTotalPages(res.data.data.meta.totalPage);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const fetchCompanies = useCallback(
    async (page, entriesPerPage, term = '') => {
      try {
        const res = await axiosInstance.get(
          `/users?role=company&page=${page}&limit=${entriesPerPage}&searchTerm=${term}&isDeleted=false`
        );

        const companyOptions = res.data.data.result.map((company: any) => ({
          value: company._id,
          label: company.name
        }));
        setCompanies(companyOptions);
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  // Effect only runs when 'searchTerm' (committed value) changes
  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
    fetchCompanies(currentPage, entriesPerPage, searchTerm);
  }, [
    currentPage,
    entriesPerPage,
    searchTerm, // This is the trigger
    refreshKey,
    internalRefreshKey,
    fetchData,
    fetchCompanies
  ]);

  // 2. Handlers for Input and Search Action
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSearchClick = () => {
    setSearchTerm(inputValue); // Commit the input value to trigger fetch
    setCurrentPage(1); // Reset to page 1 for new results
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleEditClick = (id: string) => {
    setSelectedCreatorId(id);
    setIsUpdateDialogOpen(true);
  };

  // --- ACTIONS ---

  const handleCompanyChange = async (selectedOption: any, userId: string) => {
    if (!selectedOption) return;
    const company = selectedOption.value;
    const updatedFields = { company };

    try {
      const response = await axiosInstance.patch(
        `/users/${userId}`,
        updatedFields
      );
      if (response.data.success) {
        toast({ title: 'Company Assigned Successfully' });
        handleRefresh();
      }
    } catch (err) {
      toast({ title: 'Failed to assign company', variant: 'destructive' });
    }
  };

  const toggleIsDeleted = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await axiosInstance.patch(`/users/${userId}`, {
        isDeleted: !currentStatus
      });
      if (res.data.success) {
        handleRefresh();
        toast({
          title: currentStatus ? 'Creator activated' : 'Creator deactivated'
        });
      }
    } catch (error) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  const toggleAuthorization = async (creator: any) => {
    const newStatus = !(creator.isValided && creator.authorized);
    try {
      const response = await axiosInstance.patch(`/users/${creator._id}`, {
        isValided: newStatus,
        authorized: newStatus
      });
      if (response.data.success) {
        handleRefresh();
        toast({ title: `Authorization ${newStatus ? 'granted' : 'revoked'}` });
      }
    } catch (error) {
      toast({ title: 'Authorization failed', variant: 'destructive' });
    }
  };

  const handleAddRemoveColleague = async (
    userId: string,
    colleagueId: string,
    action: string
  ) => {
    try {
      const response = await axiosInstance.patch(`users/addmember/${userId}`, {
        colleagueId,
        action
      });

      if (response.data.success) {
        toast({
          title: action === 'add' ? 'Added to network' : 'Removed from network'
        });
        handleRefresh();
      }
    } catch (error) {
      toast({ title: 'Error updating colleagues', variant: 'destructive' });
    }
  };

  const isColleague = (creator: any) => {
    return creator.colleagues && creator.colleagues.includes(user._id);
  };

  const isAdminOrDirector = user.role === 'admin' || user.role === 'director';

  return (
    <div className="w-full space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* --- Header --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-taskplanner">
              Creator List
            </h2>
          </div>
          
          {/* 3. Updated Search Section */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search creator"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="h-10 w-full rounded-lg border-gray-300 bg-gray-50 pl-9 transition-all focus:border-taskplanner focus:bg-white"
              />
            </div>
            <Button 
                onClick={handleSearchClick}
                variant="default"
                className="h-10 px-4"
            >
                Search
            </Button>
          </div>
        </div>
        <CreateCreator onUserCreated={handleRefresh} />
      </div>

      {/* --- Table --- */}
      <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 bg-taskplanner/5">
              <TableHead className="w-[280px] pl-6 text-xs font-semibold uppercase tracking-wider text-black">
                View Creator
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-black">
                Company
              </TableHead>
              {isAdminOrDirector && (
                <TableHead className="w-[220px] text-xs font-semibold uppercase tracking-wider text-black">
                  Assign Company
                </TableHead>
              )}
              {(isAdminOrDirector || user.role === 'company') && (
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-black">
                  Status
                </TableHead>
              )}
              {isAdminOrDirector && (
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-black">
                  Auth
                </TableHead>
              )}
              {isAdminOrDirector && (
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-black">
                  Network
                </TableHead>
              )}
              <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-black">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <BlinkingDots />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center font-bold text-taskplanner"
                >
                  No creators found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((creator: any) => (
                <TableRow
                  key={creator._id}
                  className="group border-b border-gray-100 hover:bg-gray-50/50"
                >
                  {/* 1. Creator Info */}
                  <TableCell className="py-3 pl-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9 border border-gray-100 bg-white">
                        <AvatarImage src={creator.image} />
                        <AvatarFallback className="bg-taskplanner/5 text-[10px] font-bold text-taskplanner">
                          {getInitials(creator.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-tight text-gray-900">
                          {creator.name}
                        </span>
                        <span className="text-xs text-black">
                          {creator.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* 2. Company Name */}
                  <TableCell>
                    <span className="text-sm text-gray-700">
                      {creator.company ? creator.company.name : '-'}
                    </span>
                  </TableCell>

                  {/* 3. Assign Company (Admin) */}
                  {isAdminOrDirector && (
                    <TableCell>
                      <Select
                        options={companies}
                        value={null}
                        onChange={(selectedOption) =>
                          handleCompanyChange(selectedOption, creator._id)
                        }
                        isClearable
                        placeholder="Assign..."
                        className="text-xs"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '32px',
                            height: '32px',
                            borderColor: '#e2e8f0'
                          }),
                          dropdownIndicator: (base) => ({
                            ...base,
                            padding: '4px'
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: '0 8px'
                          }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          menu: (base) => ({ ...base, zIndex: 9999 })
                        }}
                      />
                    </TableCell>
                  )}

                  {/* 4. Status Switch */}
                  {(isAdminOrDirector || user.role === 'company') && (
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={!creator.isDeleted}
                          onCheckedChange={() =>
                            toggleIsDeleted(creator._id, creator.isDeleted)
                          }
                        />
                      </div>
                    </TableCell>
                  )}

                  {/* 5. Auth Checkbox */}
                  {isAdminOrDirector && (
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={!!(creator.isValided && creator.authorized)}
                          onCheckedChange={() => toggleAuthorization(creator)}
                        />
                      </div>
                    </TableCell>
                  )}

                  {/* 6. Network Actions */}
                  {isAdminOrDirector && (
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            handleAddRemoveColleague(
                              creator._id,
                              user._id,
                              isColleague(creator) ? 'remove' : 'add'
                            )
                          }
                          className={cn(
                            'h-8 w-8 rounded-full transition-all hover:bg-gray-100',
                            isColleague(creator)
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'text-gray-400 hover:text-taskplanner'
                          )}
                        >
                          {isColleague(creator) ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  )}

                  {/* 7. Edit Button */}
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="default"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditClick(creator._id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UpdateCreator
        creatorId={selectedCreatorId}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUserUpdated={handleRefresh}
      />
    </div>
  );
}