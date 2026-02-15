import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  UserPlus,
  Trash2,
  Mail,
  Loader2,
  Users,
  Shield,
  Briefcase,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface userDetails {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  colleagues: [];
  isDeleted: boolean;
  authroized: boolean;
  company: {
    _id: string;
    name?: string;
  };
}

export default function CompanyUserProfileDetail() {
  const { uid } = useParams();
  const [userData, setUserData] = useState<userDetails>();
  const { reset } = useForm<userDetails>();
  const [assignedMembers, setAssignedMembers] = useState<any>([]);
  const [availableMembers, setAvailableMembers] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [email, setEmail] = useState<string>('');
  const navigate = useNavigate();

  const fetchUserDetails = async () => {
    try {
      const res = await axiosInstance.get(`/users/${uid}`);
      setUserData(res.data.data);
      reset(res.data.data);
      setAssignedMembers(res.data.data.colleagues);
      setCompanyId(res.data.data.company._id);
      await fetchAvailableMembers(res.data.data.company._id);
    } catch (error) {
      console.error('Failed to fetch user details');
    }
  };

  const fetchAvailableMembers = async (company: string) => {
    try {
      const response = await axiosInstance.get(
        `/users?company=${company}&isDeleted=false`
      );
      const allMembers = response.data.data.result;
      const filteredAvailableMembers = allMembers.filter(
        (member: any) => member._id !== uid
      );
      setAvailableMembers(filteredAvailableMembers);
    } catch (error) {
      console.error('Failed to fetch available members');
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [uid]);

  const filteredMembers = availableMembers.filter((member: any) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignMember = async (member: any) => {
    const isAlreadyAssigned = assignedMembers.some(
      (assigned: any) => assigned._id === member._id
    );

    if (isAlreadyAssigned) return;

    const data = { colleagueId: member._id, action: 'add' };
    try {
      setActionLoading(member._id);
      const res = await axiosInstance.patch(`/users/addmember/${uid}`, data);
      if (res.data.success) {
        toast({ title: 'Member Assigned Successfully' });
        setAssignedMembers((prev: any) => [...prev, member]);
        await fetchAvailableMembers(companyId || '');
      }
    } catch (error) {
      toast({ title: 'Error assigning member', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setActionLoading(memberId);
      const data = { colleagueId: memberId, action: 'remove' };
      await axiosInstance.patch(`/users/addmember/${uid}`, data);
      setAssignedMembers((prev: any) =>
        prev.filter((member: any) => member._id !== memberId)
      );
      await fetchAvailableMembers(companyId || '');
      toast({ title: 'Member Removed Successfully' });
    } catch (error) {
      toast({ title: 'Error removing member', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddUserByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users?email=${email}`);
      const user = response.data.data.result[0];

      if (user?._id) {
        await axiosInstance.patch(`/users/addmember/${uid}`, {
          colleagueId: user._id, 
          action: 'add'
        });

        toast({
          title: 'User Assigned Successfully',
          description: `${user.name} has been assigned.`
        });

        setAssignedMembers((prev: any) => [...prev, user]);
        await fetchAvailableMembers(companyId || '');
        setEmail('');
      } else {
        toast({ title: 'User not found', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({
        title: 'Error Adding User',
        description: error.response?.data?.message || 'User not found',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : '??';
  };

  return (
    <div className="  space-y-6 p-5 ">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between  ">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-slate-100 shadow-sm">
            <AvatarImage
              src={userData?.image || '/placeholder.png'}
              alt={userData?.name || 'User'}
              className="object-cover"
            />
            <AvatarFallback className="bg-slate-900 text-xl text-white">
              {getInitials(userData?.name || '')}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {userData?.name}
            </h1>
            <div className="flex items-center gap-4 text-sm ">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span>{userData?.email}</span>
              </div>
              <span className="capitalize">
                {userData?.role === 'creator'
                  ? 'Manager'
                  : userData?.role === 'user'
                    ? 'Staff'
                    : userData?.role || 'User'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userData?.authroized && (
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 px-3 py-1 text-green-700"
            >
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              Authorized
            </Badge>
          )}
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="grid h-[calc(100vh-250px)] min-h-[600px] grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Left Column: Current Team List */}
        <Card className="flex h-full flex-col border border-slate-200 shadow-sm lg:col-span-7 ">
          <CardHeader className="border-b border-slate-50 bg-taskplanner py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 " />
                <CardTitle className="text-lg">Current Team</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="space-y-3 p-4">
                {assignedMembers.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center ">
                    <Users className="mb-3 h-12 w-12 opacity-10" />
                    <p>No team members assigned yet.</p>
                  </div>
                ) : (
                  assignedMembers.map((member: any) => (
                    <div
                      key={member._id}
                      className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-slate-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="h-10 w-10 border border-slate-100">
                          <AvatarFallback className="bg-slate-100 font-medium text-slate-600">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {member.name}
                          </p>
                          <p className="truncate text-xs ">{member.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8  opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={actionLoading === member._id}
                      >
                        {actionLoading === member._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column: Find & Add Members */}
        <Card className="flex h-full flex-col border border-slate-200 shadow-sm lg:col-span-5">
          <CardHeader className="border-b border-slate-50 bg-taskplanner py-4 text-white">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 " />
              <CardTitle className="text-lg">Add Members</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
            {/* 1. Quick Add by Email */}
            <div className="border-b border-slate-100 bg-white p-4">
              <Label className="mb-2 block text-xs font-bold uppercase ">
                Quick Add by Email
              </Label>
              <form onSubmit={handleAddUserByEmail} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 " />
                  <Input
                    placeholder="email@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 pl-9"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-10 px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Add'
                  )}
                </Button>
              </form>
            </div>

            {/* 2. Directory Search */}
            <div className="flex min-h-0 flex-1 flex-col bg-slate-50/30">
              <div className="p-4 pb-2">
                <Label className="mb-2 block text-xs font-bold uppercase ">
                  Directory Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 " />
                  <Input
                    placeholder="Search available members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2 p-4 pt-2">
                  {filteredMembers.length === 0 ? (
                    <p className="py-8 text-center text-sm ">
                      No matching members found.
                    </p>
                  ) : (
                    filteredMembers.map((member: any) => {
                      const isAssigned = assignedMembers.some(
                        (a: any) => a._id === member._id
                      );

                      return (
                        <div
                          key={member._id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={member.image || '/placeholder.png'}
                                alt={member.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-blue-50 text-xs font-medium text-blue-600">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {member.name}
                              </p>
                              <p className="truncate text-xs">
                                {member.role === 'creator'
                                  ? 'Manager'
                                  : member.role === 'user'
                                    ? 'Staff'
                                    : member.role}
                              </p>
                            </div>
                          </div>

                          {isAssigned ? (
                            <Badge
                              variant="secondary"
                              className="h-6 text-[10px]"
                            >
                              Assigned
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleAssignMember(member)}
                              disabled={actionLoading === member._id}
                            >
                              {actionLoading === member._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  Add <UserPlus className="ml-1 h-3 w-3" />
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}