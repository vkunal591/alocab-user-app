import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT } from '@env'; // ← Use @env to import

// Define types for API responses and errors
interface ApiError {
    message: string;
    status?: number;
}

// const API_BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';
// const API_TIMEOUT = process.env.API_TIMEOUT || '10000';

// Base configuration for Axios
const apiClient = axios.create({
    baseURL:"https://api-alocab.wayone.site",// API_BASE_URL || 'https://api.example.com', // Fallback if env variable is not set
    timeout: parseInt(API_TIMEOUT || '10000', 10), // Convert string to number, default to 10000ms
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token from AsyncStorage
apiClient.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn('Failed to retrieve token from AsyncStorage:', error);
        }
        return config;
    },
    (error: unknown) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data; // Return only the data part of the response
    },
    (error: any) => {
        // Handle common error cases
        if (error.response) {
            // Server responded with a status other than 2xx
            const errorMessage = error.response.data?.message || 'An error occurred';
            return Promise.reject({ message: errorMessage, status: error.response.status } as ApiError);
        } else if (error.request) {
            // No response received
            return Promise.reject({ message: 'No response from server. Please check your network.' } as ApiError);
        } else {
            // Other errors
            return Promise.reject({ message: `Request setup error: ${error.message}` } as ApiError);
        }
    }
);

// API utility functions
const apiUtils = {
    // GET request
    get: async <T>(endpoint: string, params: Record<string, any> = {}): Promise<T> => {
        try {
            return await apiClient.get<T>(endpoint, { params });
        } catch (error) {
            throw error as ApiError;
        }
    },

    // POST request
    post: async <T>(endpoint: string, data: Record<string, any> = {}): Promise<T> => {
        try {
            console.log('POST request data:', API_BASE_URL,endpoint,data);
            return await apiClient.post<T>(endpoint, data);
        } catch (error) {
            throw error as ApiError;
        }
    },

    // PUT request
    put: async <T>(endpoint: string, data: Record<string, any> = {}): Promise<T> => {
        try {
            return await apiClient.put<T>(endpoint, data);
        } catch (error) {
            throw error as ApiError;
        }
    },

    // DELETE request
    delete: async <T>(endpoint: string): Promise<T> => {
        try {
            return await apiClient.delete<T>(endpoint);
        } catch (error) {
            throw error as ApiError;
        }
    },

    // PATCH request
    patch: async <T>(endpoint: string, data: Record<string, any> = {}): Promise<T> => {
        try {
            return await apiClient.patch<T>(endpoint, data);
        } catch (error) {
            throw error as ApiError;
        }
    },
};

// Export the utility
export default apiUtils;