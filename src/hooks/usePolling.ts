import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  fetchAllTasks, 
  startPolling, 
  stopPolling 
} from '@/redux/features/allTaskSlice';

export const usePollTasks = ({ 
  userId, 
  tasks, 
  setOptimisticTasks 
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    dispatch(fetchAllTasks({ userId }));
    
    dispatch(startPolling());
    
    const intervalId = setInterval(() => {
      dispatch(fetchAllTasks({ userId }))
        .unwrap()
        .then(newTasks => {
          setOptimisticTasks(prev => {
            const optimisticTasksCopy = { ...prev };
            const optimisticTaskArray = Object.values(optimisticTasksCopy);
            
            for (const optimisticTask of optimisticTaskArray) {
              const matchingTask = newTasks?.find(serverTask => 
                serverTask.taskName === optimisticTask.taskName &&
                (
                  (typeof serverTask.assigned === 'object' && typeof optimisticTask.assigned === 'object'
                    ? serverTask.assigned?._id === optimisticTask.assigned?._id
                    : serverTask.assigned === optimisticTask.assigned) || 
                  (typeof serverTask.assigned === 'string' && typeof optimisticTask.assigned === 'object'
                    ? serverTask.assigned === optimisticTask.assigned?._id
                    : false)
                ) &&
                new Date(serverTask.updatedAt).getTime() > Date.now() - 30000
              );
              
              if (matchingTask) {
                delete optimisticTasksCopy[optimisticTask._id];
                
                if (matchingTask && 
                    (typeof matchingTask.author === 'string' || 
                     typeof matchingTask.assigned === 'string')) {
                  
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
    }, 10000); 
    
    return () => {
      clearInterval(intervalId);
      dispatch(stopPolling());
    };
  }, [userId, dispatch]);
  
  return null;
};