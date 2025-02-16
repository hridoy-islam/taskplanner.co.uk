import axios from 'axios';
import store from '../redux/store';

// Create an instance of axios with custom configurations
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Add a request interceptor to attach the bearer token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Fetch the token from wherever you have stored it (e.g., localStorage, Redux store)
    // const token = localStorage.getItem('garirmela'); // Example using localStorage

    const { auth } = store.getState();
    const token = auth.token;

    // If a token exists, set the Authorization header with the token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
// axiosInstance.interceptors.response.use(
//   (response) => {
//     // Return the response if everything is fine
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 || (500 && !originalRequest._retry)) {
//       originalRequest._retry = true; // Mark the request as retried to avoid infinite loops

//       try {
//         const { auth } = store.getState();
//         const refreshToken = auth.refreshToken;

//         // Call the refresh token endpoint to get a new access token
//         const response = await axios.post(
//           `${import.meta.env.VITE_API_URL}/auth/refreshtoken`,
//           {
//             refreshToken
//           }
//         );

//         const { accessToken, refreshToken: newRefreshToken } = response.data; // Assuming the response contains the new access token

//         console.log('hjjaejh');
//         // Store the new tokens in localStorage
//         localStorage.setItem('accessToken', accessToken);
//         localStorage.setItem('refreshToken', newRefreshToken);

//         // Update the Redux store with the new token
//         store.dispatch(setToken(accessToken));

//         // Update the Authorization header with the new token
//         originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

//         // Retry the original request with the new token
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         // Handle refresh token failure (e.g., redirect to login)
//         console.error('Failed to refresh token:', refreshError);
//         store.dispatch(setToken(null)); // Clear the token in Redux
//         window.location.href = '/login'; // Redirect to login page
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
