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
import { Pencil, UserCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicPagination from '@/components/shared/DynamicPagination';
import { Input } from '@/components/ui/input';
import axiosInstance from '../../../lib/axios';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CreatorTableList({ refreshKey }) {
  const { user } = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);

  const fetchData = useCallback(
    async (page, entriesPerPage, searchTerm = '') => {
      try {
        let endpoint;

        // Check if the user's role is 'company'
        if (user.role === 'company') {
          endpoint = `/users?role=creator&company=${user._id}&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}`;
        } else {
          endpoint = `/users?role=creator&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}`;
        }
        const res = await axiosInstance.get(endpoint);
        setUsers(res.data.data.result);
        setTotalPages(res.data.data.meta.totalPage);
      } catch (err) {
      } finally {
      }
    },
    [user]
  );

  const fetchCompanies = useCallback(
    async (page, entriesPerPage, searchTerm = '') => {
      try {
        const res = await axiosInstance.get(
          `/users?role=company&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}&isDeleted=false`
        );

        const companyOptions = res.data.data.result.map((company) => ({
          value: company._id,
          label: company.name
        }));
        setCompanies(companyOptions);
      } catch (err) {
      } finally {
      }
    },
    []
  );

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
    fetchCompanies(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage, searchTerm, refreshKey, fetchData]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // const handleEntriesPerPageChange = (event) => {
  //   setEntriesPerPage(Number(event.target.value));
  //   setCurrentPage(1); // Reset to first page when changing entries per page
  // };

  const handleCompanyChange = async (selectedOption, userId) => {
    if (!selectedOption) return; // Handle case where selection is cleared
    const company = selectedOption.value; // Get the selected company's ID
    const updatedFields = { company }; // Create the payload

    try {
      const response = await axiosInstance.patch(
        `/users/${userId}`,
        updatedFields
      );

      if (response.data.success) {
        toast({
          title: 'Company Assigned Successfully'
        });
        fetchData(currentPage, entriesPerPage, searchTerm);
      } else {
        toast({
          title: 'Something Went Wrong',
          variant: 'destructive'
        });
      }

      // Optionally update local state and refetch data...
    } catch (err) {
      console.error('Error updating user profile:', err);
      // Handle error (e.g., set error state)
    }
  };

  const toggleIsDeleted = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await axiosInstance.patch(`/users/${userId}`, {
        isDeleted: !currentStatus
      });
      if (res.data.success) {
        fetchData(currentPage, entriesPerPage, searchTerm);
        toast({
          title: 'Updated Successfully'
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error updating user',
        variant: 'destructive'
      });
    }
  };

  const handleAddRemoveColleague = async (userId, colleagueId, action) => {
    try {
      const payload = {
        colleagueId,
        action,
      };

      const response = await axiosInstance.patch(`users/addmember/${userId}`, payload);

      if (response.data.success) {
        toast({
          title: action === 'add' ? 'User Added Successfully' : 'User Removed Successfully',
        });
        fetchData(currentPage, entriesPerPage, searchTerm); // Refresh the data
      } else {
        toast({
          title: 'Something Went Wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating colleagues:', error);
      toast({
        title: 'Error updating colleagues',
        variant: 'destructive',
      });
    }
  };

  const isColleague = (creator) => {
    return creator.colleagues && creator.colleagues.includes(user._id);
  };

  return (
    <div className="flex h-[calc(82vh-7rem)] flex-col overflow-hidden bg-transparent px-2">
      <div className="mb-6 flex gap-8">
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className='w-full'
        />
        {/* <div>
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div> */}
      </div>
      <div className="-mt-6  h-full overflow-y-auto rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              {(user.role === 'admin' || user.role === 'director') && (
                <TableHead>Assigned Company</TableHead>
              )}
              <TableHead>Actions</TableHead>
              {(user.role === 'admin' ||
                user.role === 'director' ||
                user.role === 'company') && <TableHead>User Status</TableHead>}
              {(user.role === 'admin' || user.role === 'director') && (
                <TableHead>Add User</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {users.map((creator: any) => (
              <TableRow key={creator._id}>
                <TableCell>{creator?.name}</TableCell>
                <TableCell>{creator?.email}</TableCell>
                <TableCell>
                  {creator.company ? creator.company.name : 'N/A'}
                </TableCell>
                {(user.role === 'admin' || user.role === 'director') && (
                  <TableCell>
                    <Select
                      options={companies}
                      value={null}
                      onChange={(selectedOption) =>
                        handleCompanyChange(selectedOption, creator._id)
                      }
                      isClearable
                      placeholder="Select a company"
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex space-x-2">
                    <Link to={`/dashboard/creator/${creator?._id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </TableCell>

                {(user.role === 'admin' ||
                  user.role === 'director' ||
                  user.role === 'company') && (
                  <TableCell className="flex items-center">
                    <Switch
                      checked={creator?.isDeleted}
                      onCheckedChange={() =>
                        toggleIsDeleted(creator?._id, creator?.isDeleted)
                      }
                    />
                    <span
                      className={`ml-1 font-semibold ${creator.isDeleted ? 'text-red-500' : 'text-green-500'}`}
                    >
                      {creator.isDeleted ? 'Inactive' : 'Active'}
                    </span>
                  </TableCell>
                )}

                {(user.role === 'admin' || user.role === 'director') && (
                  <TableCell>
                  <div className="flex flex-row items-center justify-center">
                    {isColleague(creator) ? (
                      <UserCheck
                        className="cursor-pointer"
                        onClick={() => handleAddRemoveColleague(creator._id, user._id, 'remove')}
                      />
                    ) : (
                      <UserPlus
                        className="cursor-pointer"
                        onClick={() => handleAddRemoveColleague(creator._id, user._id, 'add')}
                      />
                    )}
                  </div>
                </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
