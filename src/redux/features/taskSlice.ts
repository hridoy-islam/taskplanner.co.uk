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
  baseQuery: axiosBaseQuery({ baseUrl: `${import.meta.env.VITE_API_URL}` }),
  tagTypes: ['Task'],
  endpoints: (builder: EndpointBuilder<any, any, any>) => ({
    fetchDueTasks: builder.query<any, DueTaskQueryParams>({
      query: ({
        userId,
        searchTerm = '',
        sortOrder = 'desc',
        page = 1,
        limit = 15
      }) => ({
        url: `/task/duetasks/${userId}`,
        params: {
          searchTerm,
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit
        }
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.userId}-${queryArgs.searchTerm}-${queryArgs.sortOrder}`;
      },
      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `LIST-${userId}` }
      ]
    }),

    fetchAssignedTasks: builder.query({
      query: ({
        userId,
        searchTerm = '',
        sortOrder = 'desc',
        page = 1,
        limit = 15
      }) => ({
        url: `/task/assignedtasks/${userId}`,
        params: {
          searchTerm,
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit
        }
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.userId}-${queryArgs.searchTerm}-${queryArgs.sortOrder}`;
      },
      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `LIST-${userId}` }
      ]
    }),

    fetchTasksForBothUsers: builder.query({
      query: ({
        authorId,
        assignedId,
        searchTerm = '',
        sortOrder = 'desc',
        page = 1,
        limit = 15
      }) => ({
        url: `/task/getbothuser/${authorId}/${assignedId}`,
        params: {
          searchTerm,
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit,
          status: 'pending'
        }
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.authorId}-${queryArgs.assignedId}-${queryArgs.searchTerm}-${queryArgs.sortOrder}`;
      },
      providesTags: (result, error, { authorId, assignedId }) => [
        { type: 'Task', id: `BOTH-${authorId}-${assignedId}` }
      ]
    }),
    fetchPlannerMonth: builder.query({
      query: ({ year, month, userId }) => ({
        url: `/task/planner/${year}/${month}/${userId}`
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
        url: `/task/planner/week/${year}/${week}/${userId}`
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
        url: `/task/planner/day/${day}/${userId}`
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
        limit = 15
      }) => ({
        url: `/task/upcommingtasks/${userId}`,
        params: {
          searchTerm,
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit
        }
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.userId}-${queryArgs.searchTerm}-${queryArgs.sortOrder}`;
      },
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
        limit = 15
      }) => ({
        url: `/task`,
        params: {
          author: userId,
          status: 'completed',
          searchTerm,
          sort: sortOrder === 'asc' ? 'dueDate' : '-dueDate',
          page,
          limit
        }
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.userId}-${queryArgs.searchTerm}-${queryArgs.sortOrder}`;
      },
      providesTags: (result, error, { userId }) => [
        { type: 'Task', id: `COMPLETED-${userId}` }
      ]
    })
  })
});

export const {
  useFetchDueTasksQuery,
  useLazyFetchDueTasksQuery,
  useFetchAssignedTasksQuery,
  useFetchTasksForBothUsersQuery,
  useFetchPlannerMonthQuery,
  useFetchPlannerWeekQuery,
  useFetchPlannerDayQuery,
  useFetchUpcomingTasksQuery,
  useFetchCompletedTasksQuery
} = TaskSlice;
