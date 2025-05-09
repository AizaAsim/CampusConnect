import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Define the base URL for the API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create an axios instance with default config
export const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials (cookies) with requests
});

// Add request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle expired tokens, network errors, etc.
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('auth_token');
      // If not on auth page already, redirect to login
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// Type for API response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Generic API request function
export const apiRequest = async <T>(
  method: string,
  url: string,
  data?: any,
  options?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axiosClient({
      method,
      url,
      data,
      ...options,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
    throw error;
  }
};

// Convenience wrappers for HTTP methods
export const get = <T>(url: string, options?: AxiosRequestConfig) => 
  apiRequest<T>('GET', url, undefined, options);

export const post = <T>(url: string, data: any, options?: AxiosRequestConfig) => 
  apiRequest<T>('POST', url, data, options);

export const put = <T>(url: string, data: any, options?: AxiosRequestConfig) => 
  apiRequest<T>('PUT', url, data, options);

export const patch = <T>(url: string, data: any, options?: AxiosRequestConfig) => 
  apiRequest<T>('PATCH', url, data, options);

export const del = <T>(url: string, options?: AxiosRequestConfig) => 
  apiRequest<T>('DELETE', url, undefined, options);