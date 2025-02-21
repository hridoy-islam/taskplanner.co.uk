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

export const TagSlice = createApi({
  reducerPath: 'tagSlice',
  baseQuery: axiosBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/tags`
  }),

  tagTypes: ['Tag'],
  endpoints: (builder: EndpointBuilder<any, any, any>) => ({
    addNewTag: builder.mutation({
      query: (addNewTagData) => ({
        url: `/`,
        method: 'POST',
        body: addNewTagData
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Tag', id: `LIST-${userId}` }
      ]
    }),

    fetchTags: builder.query({
      query: (userId) => ({
        url: `/user/${userId}`,
        method: 'GET'
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}/${queryArgs.userId}`,
      
      providesTags: (result, error, userId) => [
        { type: 'Tag', id: `LIST-${userId}` }
      ]
    })
  })
});

export const { useAddNewTagMutation, useFetchTagsQuery } = TagSlice;
