import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../lib/axios';

interface UserCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: any | null;
  token: any | null;
  loading: boolean;
  error: any | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

interface RegisterCredentials {
  email: string;
  password: string;
  role: string; // You can adjust the type as needed
  name: string;
}

// Define the response type for registration
interface RegisterResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserResponse {
  success: boolean;
  message?: string;
  data?: {};
}

export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterCredentials
>('auth/register', async (userCredentials) => {
  const request = await axiosInstance.post(`/auth/signup`, userCredentials);
  const response = await request.data;
  return response;
});

// Async thunk for logging in a user
export const loginUser = createAsyncThunk<UserResponse, UserCredentials>(
  'auth/login',
  async (userCredentials) => {
    const request = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      userCredentials
    );
    const response = await request.data;
    localStorage.setItem(
      'taskplanner',
      JSON.stringify(response.data.accessToken)
    );
    return response;
  }
);
export const logout = createAsyncThunk<void>('user/logout', async () => {
  localStorage.removeItem('taskplanner');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.error = null;
        state.token = null;
      })
      .addCase(loginUser.fulfilled, (state, action: any) => {
        console.log(action.payload);
        state.loading = false;
        state.token = action.payload.data.accessToken;

        const decodedUser = jwtDecode(action.payload.data.accessToken);
        console.log(decodedUser);
        state.user = decodedUser;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = 'Please Check Your Login Credentials';
        state.token = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null; // Clear user state on logout
        state.error = null;
        state.token = null;
      });
  }
});

export default authSlice.reducer;