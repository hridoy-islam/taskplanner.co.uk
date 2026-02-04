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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Pencil
} from 'lucide-react';
import axiosInstance from '../../../../lib/axios';
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import CreateCompany from './CreateCompany';
import UpdateCompany from './UpdateCompany';
import { BlinkingDots } from '@/components/shared/blinking-dots';

export default function CompanyTableList() {
  const { user } = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Separate Input State from Search Trigger State
  const [inputValue, setInputValue] = useState(''); // Stores text as you type
  const [searchTerm, setSearchTerm] = useState(''); // Stores value only when 'Search' is clicked

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(100);
  const [refreshKey, setRefreshKey] = useState(0);

  // Edit State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const handleUserRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const fetchData = useCallback(
    async (page, entriesPerPage, term = '') => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(
          `/users?role=company&page=${page}&limit=${entriesPerPage}&searchTerm=${term}`
        );
        setUsers(res.data.data.result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Effect only runs when 'searchTerm' (committed value) changes, not on every keystroke
  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage, searchTerm, refreshKey, fetchData]);

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
    setSelectedCompanyId(id);
    setIsUpdateDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name?.slice(0, 2).toUpperCase() || 'CO';
  };

  // --- ACTIONS ---

  const toggleIsDeleted = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await axiosInstance.patch(`/users/${userId}`, {
        isDeleted: !currentStatus
      });
      if (res.data.success) {
        handleUserRefresh();
        toast({
          title: currentStatus ? 'Company activated' : 'Company deactivated'
        });
      }
    } catch (error) {
      toast({ title: 'Error updating user', variant: 'destructive' });
    }
  };

  const toggleAuthorization = async (company: any) => {
    const newStatus = !(company.isValided && company.authorized);
    try {
      const response = await axiosInstance.patch(`/users/${company._id}`, {
        isValided: newStatus,
        authorized: newStatus
      });
      if (response.data.success) {
        handleUserRefresh();
        toast({ title: `Authorization ${newStatus ? 'granted' : 'revoked'}` });
      }
    } catch (error) {
      toast({ title: 'Authorization failed', variant: 'destructive' });
    }
  };

  const isAdmin = user.role === 'admin' || user.role === 'director';

  return (
    <div className="w-full space-y-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      
      {/* --- Minimal Header --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-taskplanner">
              Company List
            </h2>
          </div>
          
          {/* 3. Updated Search Section */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search company"
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
        <CreateCompany onUserCreated={handleUserRefresh} />
      </div>

      {/* --- Flat Table --- */}
      <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 bg-taskplanner/5">
              <TableHead className="w-[300px] pl-6 text-xs font-semibold uppercase tracking-wider text-black">
                View Company
              </TableHead>
              {isAdmin && (
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-black">
                  Status
                </TableHead>
              )}
              {isAdmin && (
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
                <TableCell colSpan={5}>
                 <BlinkingDots/>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-taskplanner font-bold"
                >
                  No companies found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((company: any) => (
                <TableRow
                  key={company._id}
                  className="group border-b border-gray-100 transition-colors hover:bg-gray-50/50"
                >
                  {/* Company Info */}
                  <TableCell className="py-3 pl-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9 border border-gray-100 bg-white">
                        <AvatarImage src={company.image} />
                        <AvatarFallback className="bg-taskplanner/5 text-[10px] font-bold text-taskplanner">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-tight text-gray-900">
                          {company.name}
                        </span>
                        <span className="text-xs text-black">
                          {company.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status Switch */}
                  {isAdmin && (
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Switch
                          checked={!company.isDeleted}
                          onCheckedChange={() =>
                            toggleIsDeleted(company._id, company.isDeleted)
                          }
                        />
                      </div>
                    </TableCell>
                  )}

                  {/* Auth Checkbox */}
                  {isAdmin && (
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Checkbox
                            checked={!!(company.isValided && company.authorized)}
                            onCheckedChange={() => toggleAuthorization(company)}
                        />
                      </div>
                    </TableCell>
                  )}

                  {/* Edit Button */}
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="default"
                      size="icon"
                      className='h-8 w-8'
                      onClick={() => handleEditClick(company._id)}
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

      <UpdateCompany 
        companyId={selectedCompanyId}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUserUpdated={handleUserRefresh}
      />
    </div>
  );
}