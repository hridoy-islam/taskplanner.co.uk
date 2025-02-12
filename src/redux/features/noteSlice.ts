import { createApi, EndpointBuilder } from '@reduxjs/toolkit/query/react';
import axiosInstance from '@/lib/axios';

const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string }) =>
  async ({
    url,
    method,
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

      return { data: response.data.data.result };
    } catch (error: any) {
      return { error: error.response?.data || error.message };
    }
  };

export const NoteSlice = createApi({
  reducerPath: 'noteSlice',
  baseQuery: axiosBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/notes`
  }),

  tagTypes: ['Note'],
  endpoints: (builder: EndpointBuilder<any, any, any>) => ({
    fetchNotes: builder.query({
      query: (userId: string) => ({
        url: `/${userId}`,
        method: 'GET'
      }),

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}/${queryArgs}`;
      },

      providesTags: (result, error, userId) => {
        return [{ type: 'Note', id: `LIST-${userId}` }];
      }
    }),
    fetchShareNotes: builder.query({
      query: (userId: string) => ({
        url: `/sharednote/${userId}`,
        method: 'GET'
      }),

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}/${queryArgs}`;
      },

      providesTags: (result, error, userId) => {
        return [{ type: 'Note', id: `LIST-${userId}` }];
      }
    }),

    addNewNote: builder.mutation({
      query: (addNewNoteData) => ({
        url: `/`,
        method: 'POST',
        body: addNewNoteData
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Note', id: `LIST-${userId}` }
      ]
    }),

    updateNote: builder.mutation({
      query: ({ noteId, updatedData }) => ({
        url: `/singlenote/${noteId}`,
        method: 'PATCH',
        body: updatedData
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Note', id: `LIST-${userId}` }
      ]
    }),

    deleteNote: builder.mutation({
      query: (noteId) => ({
        url: `/singlenote/${noteId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Note', id: `LIST-${userId}` }
      ]
    })
  })
});

export const {
  useAddNewNoteMutation,
  useFetchNotesQuery,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useFetchShareNotesQuery
} = NoteSlice;
