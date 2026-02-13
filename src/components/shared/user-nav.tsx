import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useEffect, useState } from 'react';
import axiosInstance from '../../lib/axios';
import { fetchUsers } from '@/redux/features/userSlice';

export default function UserNav() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user } = useSelector((state: any) => state.auth);
  const [profileData, setProfileData] = useState(null);

  const fetchProfileData = async () => {
    try {
      // Dispatch the fetchUsers action to get the data
      const response = await dispatch(fetchUsers(user?._id));

      if (fetchUsers.fulfilled.match(response)) {
        const data = response.payload;
        setProfileData(data); // Set the profile data once fetched
      } else {
        console.error('Error fetching users:', response.payload);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    // const fetchProfileData = async () => {
    //   try {
    //     const response = await axiosInstance.get(`/users/${user?._id}`);
    //     const data = response.data.data;
    //     setProfileData(data);

    //   } catch (error) {
    //     console.error('Error fetching profile data:', error);

    //   }
    // };

    fetchProfileData();
    const interval = setInterval(() => {
      fetchProfileData();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/'); // Redirect to login after logout
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-14 w-14 rounded-full">
          <Avatar className="h-10 w-10 border border-gray-200">
            <AvatarImage src={profileData?.image} alt="Profile picture" />
            <AvatarFallback className="p-0 border border-gray-200">
              <img
                src="/placeholder.png"
                alt="User placeholder"
                className="h-full w-full object-cover border border-gray-200"
              />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link to="profile">Profile</Link>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
