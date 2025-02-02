import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';

interface UserState {
  users: any[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null
};

export const fetchCompanyUsers = createAsyncThunk(
  'users/fetchCompanyUsers',
  async (userId: string) => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/users/company/${userId}`
      );

      return response.data.data;
    } catch (error: any) {
      return error.response?.data || error.message;
    }
  }
);
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (userId: string) => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/users/${userId}`
      );

      return response.data.data;
    } catch (error: any) {
      return error.response?.data || error.message;
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })

      .addCase(fetchCompanyUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default userSlice.reducer;
