import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import  supabase  from '../supbase/config';

// Define base API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Get session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        // If session exists, add the access token to request headers
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // Any status code within the range of 2xx will trigger this function
        return response.data;
    },
    async (error) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with a status code outside of 2xx
            switch (error.response.status) {
                case 401:
                    // Handle unauthorized access
                    await supabase.auth.signOut();
                    // Redirect to login or show message
                    break;
                case 403:
                    // Handle forbidden access
                    break;
                case 404:
                    // Handle not found
                    break;
                case 500:
                    // Handle server error
                    break;
                default:
                    // Handle other errors
                    break;
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received:', error.request);
        } else {
            // Error in setting up the request
            console.error('Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
