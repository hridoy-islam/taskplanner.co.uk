import { useEffect, useState, useCallback } from 'react';
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
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CompanyTableList({ refreshKey }) {
  const { user } = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(
    async (page, entriesPerPage, searchTerm = '') => {
      try {
        const res = await axiosInstance.get(
          `/users?role=company&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}`
        );
        setUsers(res.data.data.result);
        setTotalPages(res.data.data.meta.totalPage);
      } catch (err) {
      } finally {
      }
    },
    []
  );

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage, searchTerm, refreshKey, fetchData]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // const handleEntriesPerPageChange = (event) => {
  //   setEntriesPerPage(Number(event.target.value));
  //   setCurrentPage(1); // Reset to first page when changing entries per page
  // };

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

  const isColleague = (company) => {
    return company.colleagues && company.colleagues.includes(user._id);
  };

  return (
    <>
      <div className="mb-6 flex gap-10">
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
      <ScrollArea className="h-[calc(76vh-7rem)] rounded-md ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
              {(user.role === 'admin' || user.role === 'director') && (
                <TableHead>Company Status</TableHead>
              )}
                {(user.role === 'admin' || user.role === 'director') && (
                              <TableHead>Authorized</TableHead>
                            )}
              {(user.role === 'admin' || user.role === 'director') && (
                <TableHead className='text-center'>Add User</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((company: any) => (
              <TableRow key={company._id}>
                <TableCell>{company?.name}</TableCell>
                <TableCell>{company?.email}</TableCell>

                <TableCell>
                  <div className="flex space-x-2">
                    <Link to={`/dashboard/company/${company._id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </TableCell>

                {(user.role === 'admin' || user.role === 'director') && (
                  <TableCell className="flex items-center">
                    <Switch
                      checked={company?.isDeleted}
                      onCheckedChange={() =>
                        toggleIsDeleted(company?._id, company?.isDeleted)
                      }
                    />
                    <span
                      className={`ml-1 font-semibold ${company.isDeleted ? 'text-red-500' : 'text-green-500'}`}
                    >
                      {company.isDeleted ? 'Inactive' : 'Active'}
                    </span>
                  </TableCell>
                )}

                   {(user.role === 'admin' || user.role === 'director') && (
                                  <TableCell className="items-center">
                                    <div className="flex flex-row items-center justify-center">
                                      <input
                                        type="checkbox"
                                        checked={!!(company.isValided && company.authorized)}
                                        onChange={async (e) => {
                                          const isChecked = e.target.checked;
                
                                          try {
                                            const response = await axiosInstance.patch(
                                              `/users/${company._id}`,
                                              {
                                                isValided: isChecked,
                                                authorized: isChecked
                                              }
                                            );
                
                                            if (response.data.success) {
                                              toast({
                                                title: `company ${isChecked ? 'authorized' : 'unauthorized'} successfully`
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
                                        aria-label={`Authorize ${company.name}`}
                                      />
                                    </div>
                                  </TableCell>
                                )}
                

                {(user.role === 'admin' || user.role === 'director') && (
                  <TableCell>
                    <div className="flex flex-row items-center justify-center">
                      {isColleague(company) ? (
                        <UserCheck
                          className="cursor-pointer"
                          onClick={() =>
                            handleAddRemoveColleague(
                              company._id,
                              user._id,
                              'remove'
                            )
                          }
                        />
                      ) : (
                        <UserPlus
                          className="cursor-pointer"
                          onClick={() =>
                            handleAddRemoveColleague(
                              company._id,
                              user._id,
                              'add'
                            )
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
      </ScrollArea>
    </>
  );
}
