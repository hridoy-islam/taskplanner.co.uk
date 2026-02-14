import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, Search, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import CreateUser from './CreateUser';
import UpdateUser from './UpdateUser';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DynamicPagination } from '@/components/shared/DynamicPagination';
import { useNavigate, useParams } from 'react-router-dom';

export default function ManageUserTableList() {
  const { user } = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  
  // 1. Separate Input State from Search Trigger State
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Filter States (UI Selection) ---
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // --- Active Filter States (Applied on Search) ---
  const [activeCompany, setActiveCompany] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const navigate = useNavigate();
  
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

  // --- UPDATED: fetchData strictly for 'user' role ---
  const fetchData = useCallback(
    async (
      page: number,
      entriesPerPage: number,
      term = '',
      companyFilter = null
    ) => {
      setIsLoading(true);
      try {
        // Hardcoded &role=user into the endpoint
        let endpoint = `/users?page=${page}&limit=${entriesPerPage}&searchTerm=${term}&company=${id}&role=user`;

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
    [id] // added 'id' to dependencies since it's used in the endpoint
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

      // Fetch Creators... (Retained existing logic in case it's used elsewhere in the component)
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
    fetchData(
      currentPage,
      entriesPerPage,
      searchTerm,
      activeCompany
    );
    fetchDropdownData();
  }, [
    currentPage,
    entriesPerPage,
    searchTerm,
    activeCompany, // Trigger fetch when activeCompany changes
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
    <div className="w-full space-y-6 bg-white p-2">
      {/* --- Header --- */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full flex-col items-start gap-4 xl:flex-row xl:items-center">
          <div className="shrink-0">
            <h2 className="text-2xl font-semibold tracking-tight text-taskplanner">
              Manage Staff
            </h2>
          </div>

          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
            {/* 3. Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search staffs"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="h-10 w-full rounded-sm bg-gray-50 pl-9 transition-all focus:border-taskplanner focus:bg-white"
              />
            </div>

            {/* 4. Search Button */}
            <Button
              onClick={handleSearchClick}
              variant="default"
              className="h-10 shrink-0 px-6"
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
      <div className="overflow-hidden rounded-md border border-taskplanner bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-taskplanner bg-taskplanner text-white">
              <TableHead className="w-[250px] pl-6 text-xs font-semibold uppercase tracking-wider">
                Name
              </TableHead>

              <TableHead className="w-[180px] text-xs font-semibold uppercase tracking-wider">
                Role
              </TableHead>

              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                Status
              </TableHead>

              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                Auth
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                Staff Relation
              </TableHead>

              <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider">
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
                  className="group border-b border-taskplanner hover:bg-gray-50/50"
                >
                  {/* User Info */}
                  <TableCell className="py-3 pl-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9 bg-white">
                        <AvatarImage src={item.image} alt={item.name} />
                        <AvatarFallback className="p-0">
                          <img
                            src="/placeholder.png"
                            alt="placeholder"
                            className="h-full w-full rounded-full object-cover"
                          />
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

                  {/* Role */}
                  <TableCell>
                    <span className="text-sm font-semibold uppercase text-black">
                      {item.role === 'creator'
                        ? 'manager'
                        : item.role === 'user'
                          ? 'staff'
                          : item.role || '-'}
                    </span>
                  </TableCell>

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
                      <span className="text-xs font-medium">
                        {!item.isDeleted ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Authorization Checkbox */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Checkbox
                        checked={!!(item.isValided && item.authorized)}
                        onCheckedChange={() => toggleAuthorization(item)}
                      />
                      <span className="text-xs font-medium">Authorized</span>
                    </div>
                  </TableCell>

                  {/* Associate Button */}
                  <TableCell className="text-right uppercase">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(item._id)}
                        className="uppercase"
                      >
                        <Link className="mr-2 h-4 w-4" />
                        Associate Staff
                      </Button>
                    </div>
                  </TableCell>

                  {/* Edit Button */}
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleEditClick(item._id)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
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