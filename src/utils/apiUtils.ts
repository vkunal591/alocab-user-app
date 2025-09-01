import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for API responses and errors
interface ApiError {
    message: string;
    status?: number;
}

export const API_BASE_URL = process.env.API_BASE_URL || 'https://api-alocab.wayone.site';
const API_TIMEOUT = process.env.API_TIMEOUT || '10000';

// Base configuration for Axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: parseInt(API_TIMEOUT, 10),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token from AsyncStorage
import type { InternalAxiosRequestConfig } from 'axios';

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            // Ensure Content-Type is set correctly for FormData
            if (config.data instanceof FormData) {
                config.headers['Content-Type'] = 'multipart/form-data';
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
        return response; // Return the full response
    },
    (error: any) => {
        if (error.response) {
            const errorMessage = error.response.data?.message || 'An error occurred';
            return Promise.reject({ message: errorMessage, status: error.response.status } as ApiError);
        } else if (error.request) {
            return Promise.reject({ message: 'No response from server. Please check your network.' } as ApiError);
        } else {
            return Promise.reject({ message: `Request setup error: ${error.message}` } as ApiError);
        }
    }
);

// API utility functions
const apiUtils = {
    get: async <T>(endpoint: string, params: Record<string, any> = {}): Promise<T> => {
        try {
            console.log('GET request:', API_BASE_URL, endpoint, params);
            const response = await apiClient.get<T>(endpoint, { params });
            return response.data;
        } catch (error) {
            throw error as ApiError;
        }
    },

    post: async <T>(endpoint: string, data: Record<string, any> = {}): Promise<T> => {
        try {
            console.log('POST request:', API_BASE_URL, endpoint, data);
            const response = await apiClient.post<T>(endpoint, data);
            return response.data;
        } catch (error) {
            throw error as ApiError;
        }
    },

    put: async <T>(endpoint: string, data: Record<string, any> = {}): Promise<T> => {
        try {
            console.log('PUT request:', API_BASE_URL, endpoint, data);
            const response = await apiClient.put<T>(endpoint, data);
            return response.data;
        } catch (error) {
            throw error as ApiError;
        }
    },

    // New method for file uploads
    upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
        try {
            console.log('UPLOAD request:', API_BASE_URL, endpoint, formData);
            const response = await apiClient.put<T>(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error as ApiError;
        }
    },

    delete: async <T>(endpoint: string): Promise<T> => {
        try {
            console.log('DELETE request:', API_BASE_URL, endpoint);
            const response = await apiClient.delete<T>(endpoint);
            return response.data;
        } catch (error) {
            throw error as ApiError;
        }
    },

    patch: async <T>(endpoint: string, data: Record<string, any> = {}): Promise<T> => {
        try {
            console.log('PATCH request:', API_BASE_URL, endpoint, data);
            const response = await apiClient.patch<T>(endpoint, data);
            return response.data;
        } catch (error) {
            throw error as ApiError;
        }
    },
};

export default apiUtils;