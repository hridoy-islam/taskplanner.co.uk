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
import UpdateUser from './UpdateUser';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DynamicPagination } from '@/components/shared/DynamicPagination';

export default function UserTableList() {
  const { user } = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Separate Input State from Search Trigger State
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- NEW: Filter States (UI Selection) ---
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  // --- NEW: Active Filter States (Applied on Search) ---
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);

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

  // --- NEW: Role Options ---
  const roleOptions = [
    { label: 'Manager', value: 'creator' },
    { label: 'User', value: 'user' },
  ];

  const handleRefresh = () => {
    setInternalRefreshKey((prev) => prev + 1);
  };

  const getInitials = (name: string) => {
    return name?.slice(0, 2).toUpperCase() || 'US';
  };

  // --- UPDATED: fetchData to accept filters ---
  const fetchData = useCallback(
    async (page, entriesPerPage, term = '', companyFilter = null, roleFilter = null) => {
      setIsLoading(true);
      try {
        let endpoint = `/users?page=${page}&limit=${entriesPerPage}&searchTerm=${term}`;

        // Apply Role Filter
        if (roleFilter) {
             endpoint += `&role=${roleFilter}`;
        } else {
             // Default: fetch both user and creator if no specific role selected
             endpoint += `&role=user&role=creator`;
        }

        // Apply Company Filter
        if (companyFilter) {
            endpoint += `&company=${companyFilter}`;
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
      // Fetch Companies (For Admin/Director)
      if (user.role === 'admin' || user.role === 'director') {
        const resCompanies = await axiosInstance.get(
          `/users?role=company&limit=all&isDeleted=false`
        );
        setCompanies(
          resCompanies.data.data.result.map((c: any) => ({
            value: c._id,
            label: c.name
          }))
        );
      }

      // Fetch Creators... (Rest of existing logic)
      if (
        user.role === 'admin' ||
        user.role === 'director' ||
        user.role === 'company'
      ) {
        const creatorQuery =
          user.role === 'company'
            ? `/users?role=creator&company=${user._id}&limit=all`
            : `/users?role=creator&limit=all`;

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

  // --- UPDATED: Effect triggers on Active Filters changes ---
  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm, activeCompany, activeRole);
    fetchDropdownData();
  }, [
    currentPage,
    entriesPerPage,
    searchTerm,
    activeCompany, // Trigger fetch when activeCompany changes
    activeRole,    // Trigger fetch when activeRole changes
    internalRefreshKey,
    fetchData,
    fetchDropdownData
  ]);

  // Search Handlers
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // --- UPDATED: Apply Filters on Click ---
  const handleSearchClick = () => {
    setSearchTerm(inputValue);
    // Move selected UI state to Active state
    setActiveCompany(selectedCompany?.value || null);
    setActiveRole(selectedRole?.value || null);
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

  const isAdminOrDirector = user.role === 'admin' || user.role === 'director';

  return (
    <div className="w-full space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* --- Header --- */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-start gap-4 xl:flex-row xl:items-center w-full">
          <div className="shrink-0">
            <h2 className="text-2xl font-semibold tracking-tight text-taskplanner">
              User List
            </h2>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center w-full ">
            
            {/* 1. Company Filter (Admin/Director Only) */}
            

            {/* 3. Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="h-10 w-full rounded-lg border-gray-300 bg-gray-50 pl-9 transition-all focus:border-taskplanner focus:bg-white"
              />
            </div>
            {isAdminOrDirector && (
                <div className="w-full md:w-56">
                    <Select
                        options={companies}
                        value={selectedCompany}
                        onChange={setSelectedCompany}
                        placeholder="Select Company"
                        isClearable
                        styles={{
                            control: (base) => ({
                                ...base,
                                minHeight: '40px',
                                borderColor: '#e2e8f0',
                            }),
                        }}
                    />
                </div>
            )}

            <div className="w-full md:w-40">
                <Select
                    options={roleOptions}
                    value={selectedRole}
                    onChange={setSelectedRole}
                    placeholder="Select Role"
                    isClearable
                    styles={{
                        control: (base) => ({
                            ...base,
                            minHeight: '40px',
                            borderColor: '#e2e8f0',
                        }),
                    }}
                />
            </div>
            {/* 4. Search Button */}
            <Button
              onClick={handleSearchClick}
              variant="default"
              className="h-10 px-6 shrink-0"
            >
              Search
            </Button>
          </div>
        </div>
        
        <div className="shrink-0">
            <CreateUser onUserCreated={handleRefresh} />
        </div>
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

              {isAdminOrDirector && (
                <TableHead className="w-[180px] text-xs font-semibold uppercase tracking-wider text-black">
                  Role
                </TableHead>
              )}

              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-black">
                Status
              </TableHead>

              {isAdminOrDirector && (
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-black">
                  Auth
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
                  {/* User Info */}
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
                        <span className="text-xs text-black">{item.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Current Company */}
                  <TableCell>
                    <span className="text-sm text-black">
                      {item.company ? item.company.name : '-'}
                    </span>
                  </TableCell>

                  {/* Role */}
                  {isAdminOrDirector && (
                    <TableCell>
                        <span className="text-sm font-semibold uppercase text-black">
                        {item.role ? item.role : '-'}
                        </span>
                    </TableCell>
                  )}

                  {/* Status Switch */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={!item.isDeleted}
                        onCheckedChange={() =>
                          toggleIsDeleted(item._id, item.isDeleted)
                        }
                        disabled={!isAdminOrDirector && user.role !== 'company'}
                      />
                    </div>
                  </TableCell>

                  {/* Auth Checkbox */}
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

                  {/* Edit Button */}
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

        {users.length > 40 && (
          <div className="pt-4">
            <DynamicPagination
              pageSize={entriesPerPage}
              setPageSize={setEntriesPerPage}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
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