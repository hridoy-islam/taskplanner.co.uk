import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicPagination from '@/components/shared/DynamicPagination';
import { Input } from '@/components/ui/input';
import axiosInstance from '../../../lib/axios';
import { Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DirectorTableList({ refreshKey }) {
  const { user } = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(
    async (page, entriesPerPage, searchTerm = '') => {
      try {
        const res = await axiosInstance.get(
          `/users?role=director&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}`
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
          title: 'Updated Successfully',
          description: 'Thank You'
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

  return (
    <>
      <div className="mb-6 flex gap-10">
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
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
              {/*<TableHead>Assigned Company</TableHead> */}
              <TableHead>Actions</TableHead>
              {user.role === 'admin' && <TableHead>User Status</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((director: any) => (
              <TableRow key={director._id}>
                <TableCell>{director?.name}</TableCell>
                <TableCell>{director?.email}</TableCell>

                <TableCell>
                  <div className="flex space-x-2">
                    <Link to={`/dashboard/director/${director._id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </TableCell>
                {user.role === 'admin' && (
                  <TableCell className="flex items-center">
                    <Switch
                      checked={director?.isDeleted}
                      onCheckedChange={() =>
                        toggleIsDeleted(director?._id, director?.isDeleted)
                      }
                    />
                    <span
                      className={`ml-1 font-semibold ${director.isDeleted ? 'text-red-500' : 'text-green-500'}`}
                    >
                      {director.isDeleted ? 'Inactive' : 'Active'}
                    </span>
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
