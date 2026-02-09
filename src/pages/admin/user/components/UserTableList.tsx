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
import CreateUser from './CreateUser';
import UpdateUser from './UpdateUser'; // New Component
import { BlinkingDots } from '@/components/shared/blinking-dots';

export default function UserTableList() {
  const { user } = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Separate Input State from Search Trigger State
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  
  // Dropdown options
  const [companies, setCompanies] = useState([]);
  const [creators, setCreators] = useState([]);
  
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);

  // Edit Dialog State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const handleRefresh = () => {
    setInternalRefreshKey((prev) => prev + 1);
  };

  const getInitials = (name: string) => {
    return name?.slice(0, 2).toUpperCase() || 'US';
  };

  const fetchData = useCallback(
    async (page, entriesPerPage, term = '') => {
      setIsLoading(true);
      try {
        let endpoint;
        // Construct query based on role
        if (user.role === 'company') {
          endpoint = `/users?role=user&company=${user._id}&page=${page}&limit=${entriesPerPage}&searchTerm=${term}`;
        } else if (user.role === 'creator') {
          endpoint = `/users?role=user&creator=${user._id}&page=${page}&limit=${entriesPerPage}&searchTerm=${term}`;
        } else {
          // Admin/Director sees all users
          endpoint = `/users?role=user&page=${page}&limit=${entriesPerPage}&searchTerm=${term}`;
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

  const fetchDropdownData = useCallback(async () => {
    try {
      // Fetch Companies (For Admin)
      if (user.role === 'admin' || user.role === 'director') {
        const resCompanies = await axiosInstance.get(
          `/users?role=company&limit=1000&isDeleted=false`
        );
        setCompanies(
          resCompanies.data.data.result.map((c: any) => ({
            value: c._id,
            label: c.name
          }))
        );
      }

      // Fetch Creators (For Admin and Company)
      if (user.role === 'admin' || user.role === 'director' || user.role === 'company') {
        // If Company, fetch only their creators
        const creatorQuery = user.role === 'company' 
            ? `/users?role=creator&company=${user._id}&limit=1000`
            : `/users?role=creator&limit=1000`;

        const resCreators = await axiosInstance.get(creatorQuery);
        setCreators(
          resCreators.data.data.result.map((c: any) => ({
            value: c._id,
            label: c.name
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  // Effect triggers on searchTerm change
  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
    fetchDropdownData();
  }, [
    currentPage,
    entriesPerPage,
    searchTerm,
   
    internalRefreshKey,
    fetchData,
    fetchDropdownData
  ]);

  // Search Handlers
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSearchClick = () => {
    setSearchTerm(inputValue);
    setCurrentPage(1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleEditClick = (id: string) => {
    setSelectedUserId(id);
    setIsUpdateDialogOpen(true);
  };

  // --- ACTIONS ---

  const handleAssignmentChange = async (selectedOption: any, userId: string, field: 'company' | 'creator') => {
    if (!selectedOption && field !== 'company') return; // Allow clearing? usually react-select clear returns null
    
    // Construct payload
    const updatedFields: any = {};
    if (selectedOption) {
        updatedFields[field] = selectedOption.value;
    } else {
        // Handle clearing if needed, backend might require specific logic for unassigning
        // updatedFields[field] = null; 
    }

    try {
      const response = await axiosInstance.patch(`/users/${userId}`, updatedFields);
      if (response.data.success) {
        toast({ title: `${field === 'company' ? 'Company' : 'Creator'} Assigned Successfully` });
        handleRefresh();
      }
    } catch (err) {
      toast({ title: 'Assignment failed', variant: 'destructive' });
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
          title: currentStatus ? 'User activated' : 'User deactivated'
        });
      }
    } catch (error) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  const toggleAuthorization = async (targetUser: any) => {
    const newStatus = !(targetUser.isValided && targetUser.authorized);
    try {
      const response = await axiosInstance.patch(`/users/${targetUser._id}`, {
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

  const isColleague = (targetUser: any) => {
    return targetUser.colleagues && targetUser.colleagues.includes(user._id);
  };

  const isAdminOrDirector = user.role === 'admin' || user.role === 'director';

  return (
    <div className="w-full space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* --- Header --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-taskplanner">
              User List
            </h2>
          </div>
          
          {/* Search Section */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users"
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
        <CreateUser onUserCreated={handleRefresh} />
      </div>

      {/* --- Table --- */}
      <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 bg-taskplanner/5">
              <TableHead className="w-[250px] pl-6 text-xs font-semibold uppercase tracking-wider text-black">
                View User
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-black">
                Company
              </TableHead>
              
              {/* Assignments */}
              {isAdminOrDirector && (
                <TableHead className="w-[180px] text-xs font-semibold uppercase tracking-wider text-black">
                  Assign Company
                </TableHead>
              )}
            

              {/* Status & Auth */}
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-black">
                  Status
              </TableHead>
              
              {isAdminOrDirector && (
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-black">
                  Auth
                </TableHead>
              )}
              
              {/* Actions */}
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
                <TableCell colSpan={9}>
                  <BlinkingDots />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center font-bold text-taskplanner"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((item: any) => (
                <TableRow
                  key={item._id}
                  className="group border-b border-gray-100 hover:bg-gray-50/50"
                >
                  {/* 1. User Info */}
                  <TableCell className="py-3 pl-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9 border border-gray-100 bg-white">
                        <AvatarImage src={item.image} />
                        <AvatarFallback className="bg-taskplanner/5 text-[10px] font-bold text-taskplanner">
                          {getInitials(item.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-tight text-gray-900">
                          {item.name}
                        </span>
                        <span className="text-xs text-black">
                          {item.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* 2. Current Company */}
                  <TableCell>
                    <span className="text-sm text-black">
                      {item.company ? item.company.name : '-'}
                    </span>
                  </TableCell>

                 
                  {/* 4. Assign Company (Admin Only) */}
                  {isAdminOrDirector && (
                    <TableCell>
                      <Select
                        options={companies}
                        value={null}
                        onChange={(selectedOption) =>
                          handleAssignmentChange(selectedOption, item._id, 'company')
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
                          dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
                          valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          menu: (base) => ({ ...base, zIndex: 9999 })
                        }}
                      />
                    </TableCell>
                  )}

                  

                  {/* 6. Status Switch */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={!item.isDeleted}
                        onCheckedChange={() =>
                          toggleIsDeleted(item._id, item.isDeleted)
                        }
                        disabled={!isAdminOrDirector && user.role !== 'company'} // Creators usually can't delete users entirely?
                      />
                    </div>
                  </TableCell>

                  {/* 7. Auth Checkbox */}
                  {isAdminOrDirector && (
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={!!(item.isValided && item.authorized)}
                          onCheckedChange={() => toggleAuthorization(item)}
                        />
                      </div>
                    </TableCell>
                  )}

                  {/* 8. Network Actions */}
                  {isAdminOrDirector && (
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            handleAddRemoveColleague(
                              item._id,
                              user._id,
                              isColleague(item) ? 'remove' : 'add'
                            )
                          }
                          className={cn(
                            'h-8 w-8 rounded-full transition-all hover:bg-gray-100',
                            isColleague(item)
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'text-gray-400 hover:text-taskplanner'
                          )}
                        >
                          {isColleague(item) ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  )}

                  {/* 9. Edit Button */}
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="default"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditClick(item._id)}
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

      <UpdateUser
        userId={selectedUserId}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUserUpdated={handleRefresh}
      />
    </div>
  );
}