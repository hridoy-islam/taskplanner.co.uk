import { createApi, EndpointBuilder } from '@reduxjs/toolkit/query/react';
import axiosInstance from '@/lib/axios';

// Custom axios base query to integrate axiosInstance
const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string }) =>
  async ({
    url,
    method = 'GET',
    params,
    body
  }: {
    url: string;
    method?: string;
    params?: any;
    body?: any;
  }) => {
    try {
      const response = await axiosInstance({
        url: baseUrl + url,
        method,
        params,
        data: body
      });

      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data || error.message };
    }
  };

interface DueTaskQueryParams {
  userId: string;
  searchTerm?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export const TaskSlice = createApi({
  reducerPath: 'taskSlice',
  baseQuery: axiosBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/task`
  }),

  tagTypes: ['Task'],
  endpoints: (builder: EndpointBuilder<any, any, any>) => ({
    fetchDueTasks: builder.query<any, DueTaskQueryParams>({
      query: ({
        userId,
        searchTerm = '',
        sortOrder = 'desc',
        page,
        limit
      }) => ({
        url: `/duetasks/${userId}`,
        params: {
          searchTerm,
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit,
          status: 'pending'
        }
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.userId}?sort=${queryArgs.sortOrder}&page=${queryArgs.page}&limit=${queryArgs.limit}`;
      },
      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `LIST-${userId}` }
      ]
    }),
    fetchTasksForBothUsers: builder.query({
      query: ({
        authorId,
        assignedId,
        sortOrder = 'desc',
        page = 1,
        limit
      }) => ({
        url: `/getbothuser/${authorId}/${assignedId}`,
        params: {
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit,
          status: 'pending'
        }
      }),
      // serializeQueryArgs: ({ endpointName, queryArgs }) => {
      //   return `${endpointName}-${queryArgs.authorId}/${queryArgs.assignedId}?sort=${queryArgs.sortOrder}&page=${queryArgs.page}&limit=${queryArgs.limit}`;
      // },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { authorId, assignedId, sortOrder, page, limit } = queryArgs;
        return `${endpointName}-${authorId}-${assignedId}-${sortOrder}-${page}-${limit}`;
      },

      providesTags: (result, error, { authorId, assignedId }) => [
        { type: 'Task', id: `BOTH-${authorId}-${assignedId}` }
      ]
    }),

    fetchAssignedTasks: builder.query({
      query: ({
        userId,
        searchTerm = '',
        sortOrder = 'desc',
        page,
        limit
      }) => ({
        url: `/assignedtasks/${userId}`,
        params: {
          searchTerm,
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit
        }
      }),

      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `LIST-${userId}` }
      ]
    }),

    fetchPlannerMonth: builder.query({
      query: ({ year, month, userId }) => ({
        url: `/planner/${year}/${month}/${userId}`
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.year}-${queryArgs.month}-${queryArgs.userId}`;
      },
      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `MONTH-${userId}` }
      ]
    }),
    fetchPlannerWeek: builder.query({
      query: ({ year, week, userId }) => ({
        url: `/planner/week/${year}/${week}/${userId}`
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.year}-${queryArgs.week}-${queryArgs.userId}`;
      },
      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `WEEK-${userId}` }
      ]
    }),
    fetchPlannerDay: builder.query({
      query: ({ day, userId }) => ({
        url: `/planner/day/${day}/${userId}`
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.day}-${queryArgs.userId}`;
      },
      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `DAY-${userId}` }
      ]
    }),

    fetchUpcomingTasks: builder.query({
      query: ({
        userId,
        searchTerm = '',
        sortOrder = 'desc',
        page = 1,
        limit
      }) => ({
        url: `/upcommingtasks/${userId}`,
        params: {
          searchTerm,
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit
        }
      }),

      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `UPCOMING-${userId}` }
      ]
    }),
    fetchCompletedTasks: builder.query({
      query: ({
        userId,
        searchTerm = '',
        sortOrder = 'desc',
        page = 1,
        limit
      }) => ({
        url: ``,
        params: {
          author: userId,
          status: 'completed',
          searchTerm,
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit
        }
      }),
      // serializeQueryArgs: ({ endpointName, queryArgs }) => {
      //   return `${endpointName}-${queryArgs.userId}-${queryArgs.searchTerm}-${queryArgs.sortOrder}`;
      // },
      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `COMPLETED-${userId}` }
      ]
    }),

    fetchImportantTasks: builder.query({
      query: ({ userId, sortOrder = 'desc', page = 1, limit }) => ({
        url: ``,
        params: {
          author: userId,
          important: true,
          status: 'pending',
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit
        }
      }),
      // serializeQueryArgs: ({ endpointName, queryArgs }) => {
      //   return `${endpointName}-${queryArgs.userId}-${queryArgs.sortOrder}`;
      // },
      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `IMPORTANT-${userId}` }
      ]
    }),
    fetchTodayTasks: builder.query({
      query: ({
        userId,
        searchTerm = '',
        sortOrder = 'desc',
        page = 1,
        limit
      }) => ({
        url: `/today/${userId}`,
        params: {
          searchTerm,
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit,
          status: 'completed'
        }
      }),

      // Adjusted to match the pattern in fetchAssignedTasks
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.userId}-${queryArgs.searchTerm}-${queryArgs.sortOrder}`;
      },

      // Updated providesTags to match the pattern
      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `TODAY-${userId}` } // Ensures cache updates for today-specific tasks
      ]
    }),

    updateTask: builder.mutation({
      query: ({ taskId, updates }) => ({
        url: `/${taskId}`,
        method: 'PATCH',
        body: updates
      }),

      invalidatesTags: (result, error, { updates, taskId }) => [
        { type: 'Task', id: 'LIST' },
        { type: 'Task', id: taskId },
        { type: 'Task', id: `BOTH-${updates.authorId}-${updates.assignedId}` },
        { type: 'Task', id: `WEEK-${updates.userId}` },
        { type: 'Task', id: `DAY-${updates.userId}` },
        { type: 'Task', id: `MONTH-${updates.userId}` }
      ]
    }),

    createTask: builder.mutation({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data
      }),

      invalidatesTags: [{ type: 'Task', id: 'LIST' }]
    })
  })
});

export const {
  useFetchDueTasksQuery,
  useLazyFetchDueTasksQuery,
  useCreateTaskMutation,
  useFetchAssignedTasksQuery,
  useFetchTasksForBothUsersQuery,
  useFetchPlannerMonthQuery,
  useFetchPlannerWeekQuery,
  useFetchPlannerDayQuery,
  useFetchUpcomingTasksQuery,
  useFetchCompletedTasksQuery,
  useFetchImportantTasksQuery,
  useFetchTodayTasksQuery,
  useUpdateTaskMutation,
  useLazyFetchPlannerWeekQuery
} = TaskSlice;
