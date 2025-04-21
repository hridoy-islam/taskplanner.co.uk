import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';

// Interfaces
export interface TTags {
  _id: string;
  name: string;
  author: string | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
  __optimistic?: boolean; // For optimistic tag state
}

interface TagState {
  tags: TTags[];
  loading: boolean;
  error: string | null;
  polling: boolean;
}

const initialState: TagState = {
  tags: [],
  loading: false,
  error: null,
  polling: false,
};

// Async Thunks
export const fetchTags = createAsyncThunk<
  TTags[],
  { userId: string; query?: Record<string, any> },
  { rejectValue: string }
>(
  'tags/fetchTags',
  async ({ userId, query }, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue('User ID is required');
      }

      const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
      const response = await axiosInstance.get(`/tags/user/${userId}${queryString}`);
      
      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || 'Failed to fetch tags');
      }
      
      return response.data.data?.result || [];
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || 'API Error');
      }
      return rejectWithValue(error.message || 'Failed to fetch tags');
    }
  }
);

export const addNewTag = createAsyncThunk<
  TTags,
  Partial<TTags>,
  { rejectValue: string }
>(
  'tags/addNewTag',
  async (tagData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/tags', tagData);
      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || 'Failed to add tag');
      }
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || 'API Error');
      }
      return rejectWithValue(error.message || 'Failed to add tag');
    }
  }
);

export const updateTag = createAsyncThunk<
  TTags,
  { tagId: string; tagData: Partial<TTags> },
  { rejectValue: string }
>(
  'tags/updateTag',
  async ({ tagId, tagData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/tags/${tagId}`, tagData);
      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || 'Failed to update tag');
      }
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || 'API Error');
      }
      return rejectWithValue(error.message || 'Failed to update tag');
    }
  }
);

export const deleteTag = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'tags/deleteTag',
  async (tagId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tags/${tagId}`);
      return tagId;
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || 'API Error');
      }
      return rejectWithValue(error.message || 'Failed to delete tag');
    }
  }
);

// Create Slice with Polling
const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    startPolling: (state) => {
      state.polling = true;
    },
    stopPolling: (state) => {
      state.polling = false;
    },
    updateTagLocally: (state, action) => {
      const index = state.tags.findIndex((tag) => tag._id === action.payload._id);
      if (index !== -1) {
        state.tags[index] = {
          ...state.tags[index],
          ...action.payload,
        };
      }
    },
    clearTags: (state) => {
      state.tags = [];
    },
    addOptimisticTag: (state, action) => {
      state.tags = [action.payload, ...state.tags];
    },
    removeOptimisticTag: (state, action) => {
      state.tags = state.tags.filter(tag => tag._id !== action.payload);
    },
    mergeTags: (state, action) => {
      const uniqueTags = action.payload.reduce((acc, tag) => {
        // Check if tag exists based on _id or title (for optimistic tags)
        const existingIndex = acc.findIndex(
          (t) =>
            t._id === tag._id ||
            (tag.__optimistic && t.name === tag.name && !t.__optimistic)
        );

        if (existingIndex >= 0) {
          if (!tag.__optimistic) {
            // Replace the optimistic tag with the real tag
            acc[existingIndex] = tag;
          }
        } else {
          acc.push(tag);
        }

        return acc;
      }, []);

      state.tags = uniqueTags;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tags
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tags';
      })

      // Add New Tag
      .addCase(addNewTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewTag.fulfilled, (state, action) => {
        state.loading = false;
        // Replace the optimistic tag with the real one
        state.tags = state.tags.map(tag => 
          tag.__optimistic && tag.name === action.payload.name 
            ? action.payload 
            : tag
        );
      })
      .addCase(addNewTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add tag';
      })

      // Update Tag
      .addCase(updateTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tags.findIndex(tag => tag._id === action.payload._id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update tag';
      })

      // Delete Tag
      .addCase(deleteTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = state.tags.filter(tag => tag._id !== action.payload);
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete tag';
      });
  },
});

export const {
  startPolling,
  stopPolling,
  updateTagLocally,
  clearTags,
  addOptimisticTag,
  removeOptimisticTag,
  mergeTags,
} = tagSlice.actions;

export default tagSlice.reducer;
