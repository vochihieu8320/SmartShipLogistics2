
import { API_BASE_URL } from '@/config/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function apiCall<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    mode: 'cors',
    credentials: 'include'
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Common API methods
export const api = {
  get: <T>(endpoint: string, options?: ApiOptions) => 
    apiCall<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body: any, options?: ApiOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'POST', body }),
    
  put: <T>(endpoint: string, body: any, options?: ApiOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'PUT', body }),
    
  delete: <T>(endpoint: string, options?: ApiOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'DELETE' })
};
