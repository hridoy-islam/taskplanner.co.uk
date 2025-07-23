import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../lib/axios';

interface UserCredentials {
  email: string;
  password: string;
}

interface forgetCredentials {
  email: string;
}

interface validateOtpCredentials {
  email: string;
  otp: string;
}

interface ChangePasswordCredentials {
  userId: string;
  token: string;
  password: string;
}

interface ChangePasswordResponse {
  message?: string;
}

interface GoogleUserCredentials {
  googleUid: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
}

interface AuthState {
  user: any | null;
  refreshToken: any | null;
  token: any | null;
  loading: boolean;
  error: any | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  refreshToken: null
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
  authorized:boolean
  isValided: boolean
}

interface UserResponse {
  success: boolean;
  message?: string;
  data?: object;
}

interface ForgetResponse {
  message?: string;
}

interface ValidateOtpResponse {
  success: boolean;
  message?: string;
  data?: object;
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
      userCredentials,
      {
        withCredentials: true ,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' //this line solved cors
        }
      }
    );
    const response = await request.data;
    localStorage.setItem(
      'taskplanner',
      JSON.stringify(response.data.accessToken)
    );
    
    return response;
  }
);

export const authWithFbORGoogle = createAsyncThunk<
  UserResponse,
  GoogleUserCredentials
>('auth/google', async (googleUserCredentials) => {
  const request = await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/google`,
    googleUserCredentials,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json' //this line solved cors
      }
    }
  );
  const response = await request.data;
  localStorage.setItem(
    'taskplanner',
    JSON.stringify(response.data.accessToken)
  );
  return response;
});
// forgot password

export const requestOtp = createAsyncThunk<ForgetResponse, forgetCredentials>(
  'auth/forget',
  async (userCredentials) => {
    const request = await axios.patch(
      `${import.meta.env.VITE_API_URL}/auth/forget`,
      userCredentials,
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' //this line solved cors
        }
      }
    );
    const response = await request.data;

    return response;
  }
);

// validate request OTP
export const validateRequestOtp = createAsyncThunk<
  ValidateOtpResponse,
  validateOtpCredentials
>('auth/validate', async (userCredentials) => {
  const request = await axios.patch(
    `${import.meta.env.VITE_API_URL}/auth/validate`,
    userCredentials,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json' //this line solved cors
      }
    }
  );
  const response = await request.data;

  return response;
});

// patch new password
export const changePassword = createAsyncThunk<
  ChangePasswordResponse,
  ChangePasswordCredentials
>('auth/reset', async (userCredentials) => {
  const request = await axios.patch(
    `${import.meta.env.VITE_API_URL}/auth/reset`,
    userCredentials,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json', //this line solved cors
        // Authorization: `Bearer ${userCredentials.token}`
      }
    }
  );
  const response = await request.data;

  return response;
});



export const logout = createAsyncThunk<void>('user/logout', async () => {
  localStorage.removeItem('taskplanner');
  localStorage.removeItem('taskplannerRefresh');
});

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
    `${import.meta.env.VITE_API_URL}/auth/verifyemail`, { email, otp });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async ({ email}: { email: string}, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
    `${import.meta.env.VITE_API_URL}/auth/resend-otp`, { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);


export const personalInformation = createAsyncThunk(
  'auth/personalInformation', 
  async ({ userId, profileData }: { userId: string; profileData: Record<string, any> }) => {
    try {
      const response = await axiosInstance.patch(`/auth/users/${userId}`, profileData);
      return response.data.data; 
    } catch (error) {
      
      throw new Error('Failed to update profile');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError(state) {
      state.error = null; // Reset the error state
    },
   
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.error = null;
        state.token = null;
        state.refreshToken = null;
      })
      .addCase(loginUser.fulfilled, (state, action: any) => {
        
        state.loading = false;
        state.token = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
        const decodedUser = jwtDecode(action.payload.data.accessToken);
        state.user = decodedUser;
        state.error = null;
      
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = 'Please Check Your Login Credentials';
        state.token = null;
        state.refreshToken = null;
      })
      .addCase(authWithFbORGoogle.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.error = null;
        state.token = null;
      })
      .addCase(authWithFbORGoogle.fulfilled, (state, action: any) => {
        state.loading = false;
        state.token = action.payload.data.accessToken;
        const decodedUser = jwtDecode(action.payload.data.accessToken);
        state.user = decodedUser;
        state.error = null;
      })
      .addCase(authWithFbORGoogle.rejected, (state, action) => {
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
        state.refreshToken = null;
      }).addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        const { accessToken, refreshToken } = action.payload.data;
        const decoded = jwtDecode(accessToken);
        
        state.loading = false;
        state.token = accessToken;
        state.refreshToken = refreshToken;
        state.user = {
          ...decoded,
          isValided: true
        };
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Verification failed';
      })
      // .addCase(resendOtp.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(resendOtp.fulfilled, (state,action) => {
      //   const { accessToken, refreshToken } = action.payload.data;
      //   const decoded = jwtDecode(accessToken);
        
      //   state.loading = false;
      //   state.token = accessToken;
      //   state.refreshToken = refreshToken;
      //   state.user = {
      //     ...decoded,
      //   };
      //   state.error = null;
      // })
      // .addCase(resendOtp.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload?.message || 'Failed to resend OTP';
      // })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally handle the response from the changePassword API here (e.g., reset token or user state)
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to change password';
      }).addCase(personalInformation.pending, (state) => {
        state.loading = true;
        state.error = null; // Reset errors
      })
      .addCase(personalInformation.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = {
          ...action.payload, // assuming the payload contains user data
          authorized: true,   // adding the 'authorized' field to the user object
        };
        state.error = null;
      })
      
      .addCase(personalInformation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to update profile information';
      });
  }
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer;
