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
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '@/redux/features/profileSlice';
import { AppDispatch } from '@/redux/store';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

export default function UserTableList({ refreshKey }) {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(500);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const { profileData } = useSelector((state: any) => state.profile);

  const fetchData = useCallback(
    async (page, entriesPerPage, searchTerm = '') => {
      try {
        let endpoint;
        // Check if the user's role is 'company'
        if (user.role === 'company') {
          endpoint = `/users?role=user&company=${user._id}&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}`;
        } else if (user.role === 'creator') {
          dispatch(fetchUserProfile(user?._id));

          endpoint = `/users?role=user&company=${profileData.company._id}&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}`;
        } else {
          endpoint = `/users?role=user&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}`;
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
    [user]
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
        action
      };

      const response = await axiosInstance.patch(
        `users/addmember/${userId}`,
        payload
      );

      if (response.data.success) {
        toast({
          title:
            action === 'add'
              ? 'User Added Successfully'
              : 'User Removed Successfully'
        });
        fetchData(currentPage, entriesPerPage, searchTerm); // Refresh the data
      } else {
        toast({
          title: 'Something Went Wrong',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating colleagues:', error);
      toast({
        title: 'Error updating colleagues',
        variant: 'destructive'
      });
    }
  };

  const isColleague = (userData) => {
    return userData.colleagues && userData.colleagues.includes(user._id);
  };

  return (
    <div className="flex h-[calc(82vh-7rem)] flex-col overflow-hidden bg-transparent px-2">
      <div className="mb-8 flex gap-8">
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full"
        />
        {/* <div>
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div> */}
      </div>
      <div className="-mt-6  h-full overflow-y-auto rounded-md ">
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
                user.role === 'company' ||
                user.role === 'creator') && <TableHead>User Status</TableHead>}

              {(user.role === 'admin' || user.role === 'director') && (
                <TableHead>Authorized</TableHead>
              )}
              {(user.role === 'admin' || user.role === 'director') && (
                <TableHead>Add User</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {users.map((stuff: any) => (
              <TableRow key={stuff._id}>
                <TableCell>{stuff?.name}</TableCell>
                <TableCell>{stuff?.email}</TableCell>
                <TableCell>
                  {stuff.company ? stuff.company.name : 'N/A'}
                </TableCell>
                {(user.role === 'admin' || user.role === 'director') && (
                  <TableCell>
                    <Select
                      options={companies}
                      value={null}
                      onChange={(selectedOption) =>
                        handleCompanyChange(selectedOption, stuff._id)
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
                    <Link to={`/dashboard/users/${stuff._id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </TableCell>
                {(user.role === 'admin' ||
                  user.role === 'director' ||
                  user.role === 'company' ||
                  user.role === 'creator') && (
                  <TableCell className="flex items-center">
                    <Switch
                      checked={stuff?.isDeleted}
                      onCheckedChange={() =>
                        toggleIsDeleted(stuff?._id, stuff?.isDeleted)
                      }
                    />
                    <span
                      className={`ml-1 font-semibold ${stuff.isDeleted ? 'text-red-500' : 'text-green-500'}`}
                    >
                      {stuff.isDeleted ? 'Inactive' : 'Active'}
                    </span>
                  </TableCell>
                )}
                {(user.role === 'admin' || user.role === 'director') && (
                  <TableCell className="items-center">
                    <div className="flex flex-row items-center justify-center">
                      <input
                        type="checkbox"
                        checked={!!(stuff.isValided && stuff.authorized)}
                        onChange={async (e) => {
                          const isChecked = e.target.checked;

                          try {
                            const response = await axiosInstance.patch(
                              `/users/${stuff._id}`,
                              {
                                isValided: isChecked,
                                authorized: isChecked
                              }
                            );

                            if (response.data.success) {
                              toast({
                                title: `User ${isChecked ? 'authorized' : 'unauthorized'} successfully`
                              });
                              // Refresh data to reflect updated state
                              fetchData(
                                currentPage,
                                entriesPerPage,
                                searchTerm
                              );
                            } else {
                              throw new Error('Update failed');
                            }
                          } catch (error) {
                            toast({
                              title: 'Failed to update authorization',
                              variant: 'destructive'
                            });
                          }
                        }}
                        className="h-5 w-5 cursor-pointer rounded border-2 border-gray-400 bg-transparent accent-gray-700 focus:ring-0"
                        aria-label={`Authorize ${stuff.name}`}
                      />
                    </div>
                  </TableCell>
                )}
                {(user.role === 'admin' || user.role === 'director') && (
                  <TableCell>
                    <div className="flex flex-row items-center justify-center">
                      {isColleague(stuff) ? (
                        <UserCheck
                          className="cursor-pointer"
                          onClick={() =>
                            handleAddRemoveColleague(
                              stuff._id,
                              user._id,
                              'remove'
                            )
                          }
                        />
                      ) : (
                        <UserPlus
                          className="cursor-pointer"
                          onClick={() =>
                            handleAddRemoveColleague(stuff._id, user._id, 'add')
                          }
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
