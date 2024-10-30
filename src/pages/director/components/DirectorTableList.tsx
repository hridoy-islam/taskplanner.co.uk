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

  const handleEntriesPerPageChange = (event) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

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
        <select
          value={entriesPerPage}
          onChange={handleEntriesPerPageChange}
          className="block w-[180px] rounded-md border border-gray-300 bg-white p-2 shadow-sm transition  duration-150 ease-in-out focus:border-black focus:outline-none focus:ring-black"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
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

      <DynamicPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
