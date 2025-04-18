import React from 'react';

const TaskSkeleton = () => {
  return (
    <div className=" mx-auto">
      

      {/* Task list */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <TaskItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

const TaskItemSkeleton = () => {
    return (
      <div className="flex items-center justify-between px-4 py-5 border-gray-200 rounded-md shadow-lg bg-white animate-pulse">
       
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
  
        {/* Skeleton Tags */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gray-200 rounded-full h-6 w-36 px-2"></div>
          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          <div className="flex items-center bg-gray-200 rounded-full h-6 w-36 px-2"></div>
          <div className="bg-gray-200 text-white rounded-full h-6 w-24"></div>
        </div>
  
        <div className="flex items-center space-x-6">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  };
  

export default TaskSkeleton;