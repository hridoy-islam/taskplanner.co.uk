import { Link } from 'react-router-dom';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useEffect, useState } from 'react';

import { useDispatch} from 'react-redux';
import { fetchUsers } from '@/redux/features/userSlice';


export default function UserList({ user, filteredUsers }) {
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState(null);



  const fetchUserData = async () => {
    try {
      // Dispatch the fetchUsers action to get the data
      const actionResult = await dispatch(fetchUsers(user?._id));

      if (fetchUsers.fulfilled.match(actionResult)) {
        const data = actionResult.payload;
        setProfileData(data); // Set the profile data once fetched
      } else {
        console.error('Error fetching users:', actionResult.payload);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  // const fetchUserData = async () => {
  //   try {
  //     const response = await axiosInstance.get(`/users/${user?._id}`);
   
  //     const data = response.data.data;
  //     setProfileData(data);
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //   }
  // };

  useEffect(() => {
    if (
      user?.role === 'user' ||
      user?.role === 'creator' ||
      user?.role === 'company'
    ) {
      fetchUserData();
      const interval = setInterval(() => {
        fetchUserData();
      }, 10000);
  
      return () => clearInterval(interval);
    } // Fetch users on component mount
  }, [user, dispatch]);

  return (
    <ScrollArea className="h-full max-h-[220px] overflow-auto">
    {/* Exclude deleted user */}
    
      <Link to={`/dashboard/task/${user?._id}`}>
        <Button variant="ghost" className="mb-2 w-full justify-start">
          <Avatar className="mr-2 h-6 w-6">
            <AvatarImage src={profileData?.image} alt="Profile picture" />
            <AvatarFallback>
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('') || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="text-left">{user?.name}</span>
            <span className="text-left text-xs text-gray-500">
              {user?.image}
            </span>
            <span className="text-left text-xs text-gray-500">
                {user?.role}
              </span>
          </div>
        </Button>
      </Link>
    

    {/* {(user?.role === 'creator' || user?.role === 'user') &&
      companyData?.isDeleted !== true && (
        <Link to={`/dashboard/task/${companyData?._id}`}>
          <Button variant="ghost" className="mb-2 w-full justify-start">
            <Avatar className="mr-2 h-6 w-6 rounded-full">
              <AvatarImage src={companyData?.image} alt="Profile picture" />
              <AvatarFallback>
                {companyData?.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-left">{companyData?.name}</span>
              <span className="text-left text-xs text-gray-500">
                {companyData?.role}
              </span>
            </div>
          </Button>
        </Link>
      )} */}

    {filteredUsers
      // Exclude deleted users
      .map((user) => (
        <Link key={user._id} to={`/dashboard/task/${user?._id}`}>
          <Button variant="ghost" className="mb-2 w-full justify-start">
            <Avatar className="mr-2 h-6 w-6 rounded-full">
              <AvatarFallback>
                {user?.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-left">{user?.name}</span>
              <span className="text-left text-xs text-gray-500">
                {user?.role}
              </span>
            </div>
          </Button>
        </Link>
      ))}
  </ScrollArea>
  );
}
