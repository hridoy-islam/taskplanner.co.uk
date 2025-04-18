import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';

// Interfaces
interface TTask {
  _id: string;
  taskName: string;
  description?: string;
  author: string | { _id: string; name: string };
  assigned?: string | { _id: string; name: string };
  company?: string | null;
  status: "pending" | "completed";
  isDeleted?: boolean;
  important?: boolean;
  dueDate?: Date | string;
  createdAt: Date;
  updatedAt: Date;
  seen: boolean;
  tempId?: string; // Add to track optimistic updates
}

interface TaskState {
  tasks: TTask[];
  loading: boolean;
  error: string | null;
  polling: boolean;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  polling: false
};

export const fetchAllTasks = createAsyncThunk<
  TTask[],
  { userId: string; query?: Record<string, any> }
>(
  'tasks/fetchAllTasks',
  async ({ userId, query }) => {
    const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
    const response = await axiosInstance.get(`/task/alltasks/${userId}${queryString}`);
    return response.data.data.result;
  }
);

export const createNewTask = createAsyncThunk<TTask, Partial<TTask>>(
  'tasks/createNewTask',
  async (taskData) => {
    const response = await axiosInstance.post('/task/', taskData);
    return response.data.data;
  }
);

export const updateTask = createAsyncThunk<TTask, { taskId: string; taskData: Partial<TTask> }>(
  'tasks/updateTask',
  async ({ taskId, taskData }) => {
    const response = await axiosInstance.patch(`/task/${taskId}`, taskData);
    return response.data.data;
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.tasks = [];
    },
    updateTaskLocally: (state, action) => {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...action.payload
        };
      }
    },
    startPolling: (state) => {
      state.polling = true;
    },
    stopPolling: (state) => {
      state.polling = false;
    },
    // Add new reducer to remove optimistic task
    removeOptimisticTask: (state, action) => {
      const { tempId } = action.payload;
      state.tasks = state.tasks.filter(task => task.tempId !== tempId);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Tasks
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        // Filter out deleted tasks and merge with existing ones
        const newTasks = action.payload.filter(task => !task.isDeleted);
        
        // Create a map of existing tasks for quick lookup
        const existingTasksMap = new Map(
          state.tasks.map(task => [task._id, task])
        );
        
        // Merge new tasks while preserving local modifications
        state.tasks = newTasks.map(newTask => {
          const existingTask = existingTasksMap.get(newTask._id);
          return existingTask 
            ? { 
                ...newTask, 
                important: existingTask.important,
              } 
            : newTask;
        });
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })

      // Create New Task
      .addCase(createNewTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
        state.loading = false;
        
        // Add a timestamp to help with deduplication
        const newTask = {
          ...action.payload,
          _createdAt: Date.now() // Add timestamp for matching
        };
        
        // Preserve the populated author and assigned objects if they're missing
        // This is crucial for the UI to display names correctly
        if (typeof newTask.author === 'string') {
          // Try to find author info in existing tasks
          const authorInfo = state.tasks.find(task => 
            typeof task.author === 'object' &&
            task.author?._id === newTask.author
          )?.author;
          
          if (authorInfo && typeof authorInfo === 'object') {
            newTask.author = authorInfo;
          }
        }
        
        if (typeof newTask.assigned === 'string') {
          const assignedInfo = state.tasks.find(task => 
            typeof task.assigned === 'object' &&
            task.assigned?._id === newTask.assigned
          )?.assigned;
          
          if (assignedInfo && typeof assignedInfo === 'object') {
            newTask.assigned = assignedInfo;
          }
        }
        
        state.tasks.unshift(newTask); 
      })
      .addCase(createNewTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      })

      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
      
        if (index !== -1) {
          const existingTask = state.tasks[index];
          
          const author = typeof existingTask.author === 'object' 
            ? existingTask.author 
            : (typeof updatedTask.author === 'object' 
                ? updatedTask.author 
                : { _id: updatedTask.author || existingTask.author, name: 'Unknown' });
          
          const assigned = existingTask.assigned 
            ? (typeof existingTask.assigned === 'object' 
                ? existingTask.assigned 
                : (typeof updatedTask.assigned === 'object' 
                    ? updatedTask.assigned 
                    : { _id: updatedTask.assigned || existingTask.assigned, name: 'Unassigned' }))
            : undefined;
      
          state.tasks[index] = {
            ...existingTask,
            ...updatedTask,
            author, 
            assigned,
            seen: true
          };
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task';
      })
  }
});

// Export actions
export const { 
  clearTasks, 
  updateTaskLocally, 
  startPolling, 
  stopPolling, 
  removeOptimisticTask 
} = taskSlice.actions;

export default taskSlice.reducer;