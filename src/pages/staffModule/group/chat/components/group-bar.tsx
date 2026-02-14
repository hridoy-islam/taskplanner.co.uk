'use client';

import { ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const GroupBar = ({ groupDetails }) => {
  const groupName = groupDetails?.groupName || 'Group Name';
  const groupImg = groupDetails?.image || '/group-placeholder.svg';
  const navigate = useNavigate();

  return (
    <div className="flex flex-col border-b border-gray-300">
      <div className="flex items-center justify-between bg-white p-3">
        <div className="flex flex-row items-center gap-8">
          <Button
          size={'icon'}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft  className='h-4 w-4 '/>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border-2 border-gray-200">
  <AvatarImage 
    src={groupImg || '/group-placeholder.jpg'} 
    alt={groupName || "Group"} 
    className="object-cover"
  />
  <AvatarFallback className="relative bg-gray-50 overflow-hidden">
    {/* The placeholder image serves as the fallback visual */}
    <img 
      src="/group-placeholder.jpg" 
      alt="placeholder" 
      className="h-full w-full object-cover opacity-50" 
    />
    
  </AvatarFallback>
</Avatar>
            <h2 className="text-lg font-semibold">{groupName}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupBar;