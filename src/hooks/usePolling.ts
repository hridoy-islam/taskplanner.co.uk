import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  fetchAllTasks, 
  startPolling, 
  stopPolling 
} from '@/redux/features/allTaskSlice';

// Improved polling hook that helps with task deduplication
export const usePollTasks = ({ 
  userId, 
  tasks, 
  setOptimisticTasks 
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    dispatch(fetchAllTasks({ userId }));
    
    // Start polling
    dispatch(startPolling());
    
    const intervalId = setInterval(() => {
      dispatch(fetchAllTasks({ userId }))
        .unwrap()
        .then(newTasks => {
          setOptimisticTasks(prev => {
            const optimisticTasksCopy = { ...prev };
            const optimisticTaskArray = Object.values(optimisticTasksCopy);
            
            // Identify tasks that have been created on the server
            for (const optimisticTask of optimisticTaskArray) {
              // Look for a matching task in the fetched server tasks
              const matchingTask = newTasks.find(serverTask => 
                // Match by name and assigned user
                serverTask.taskName === optimisticTask.taskName &&
                (
                  (typeof serverTask.assigned === 'object' && typeof optimisticTask.assigned === 'object'
                    ? serverTask.assigned?._id === optimisticTask.assigned?._id
                    : serverTask.assigned === optimisticTask.assigned) || 
                  (typeof serverTask.assigned === 'string' && typeof optimisticTask.assigned === 'object'
                    ? serverTask.assigned === optimisticTask.assigned?._id
                    : false)
                ) &&
                // Only match recently created tasks (within last 30 seconds)
                new Date(serverTask.updatedAt).getTime() > Date.now() - 30000
              );
              
              if (matchingTask) {
                // Task exists on server - we can remove the optimistic version
                delete optimisticTasksCopy[optimisticTask._id];
                
                // Also transfer any missing name information to the server task
                if (matchingTask && 
                    (typeof matchingTask.author === 'string' || 
                     typeof matchingTask.assigned === 'string')) {
                  
                  // Copy the author and assigned name information if available
                  if (typeof matchingTask.author === 'string' && 
                      typeof optimisticTask.author === 'object') {
                    matchingTask.author = {
                      _id: matchingTask.author,
                      name: optimisticTask.author.name
                    };
                  }
                  
                  if (typeof matchingTask.assigned === 'string' && 
                      typeof optimisticTask.assigned === 'object') {
                    matchingTask.assigned = {
                      _id: matchingTask.assigned,
                      name: optimisticTask.assigned.name
                    };
                  }
                }
              }
            }
            
            return optimisticTasksCopy;
          });
        });
    }, 10000); // Poll every 5 seconds
    
    return () => {
      clearInterval(intervalId);
      dispatch(stopPolling());
    };
  }, [userId, dispatch]);
  
  return null;
};