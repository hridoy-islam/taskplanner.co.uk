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
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicPagination from '@/components/shared/DynamicPagination';
import { Input } from '@/components/ui/input';
import axiosInstance from '../../../lib/axios';
import { toast } from '@/components/ui/use-toast';

export default function CreatorTableList({ refreshKey }) {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);

  const fetchData = useCallback(
    async (page, entriesPerPage, searchTerm = '') => {
      try {
        const res = await axiosInstance.get(
          `/users?role=creator&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}`
        );
        setUsers(res.data.data.result);
        setTotalPages(res.data.data.meta.totalPage);
      } catch (err) {
      } finally {
      }
    },
    []
  );

  const fetchCompanies = useCallback(
    async (page, entriesPerPage, searchTerm = '') => {
      try {
        const res = await axiosInstance.get(
          `/users?role=company&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}`
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

  const handleEntriesPerPageChange = (event) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  const handleEditClick = (user) => {
    // setSelectedUser(user);
    // setIsDialogOpen(true);
  };

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
            <TableHead>Company</TableHead>
            <TableHead>Assigned Company</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: any) => (
            <TableRow key={user._id}>
              <TableCell>{user?.name}</TableCell>
              <TableCell>{user?.email}</TableCell>
              <TableCell>{user.company ? user.company.name : 'N/A'}</TableCell>
              <TableCell>
                <Select
                  options={companies}
                  value={null}
                  onChange={(selectedOption) =>
                    handleCompanyChange(selectedOption, user._id)
                  }
                  isClearable
                  placeholder="Select a company"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </TableCell>

              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(user)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </TableCell>
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
