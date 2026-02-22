import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './constants';
import { API_ENDPOINTS } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let browser set Content-Type with boundary for FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// On 401: try refresh token, then retry; else logout
let refreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as { _retry?: boolean } & NonNullable<AxiosError['config']>;
    if (error.response?.status !== 401 || originalRequest._retry) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      }
      return Promise.reject(error);
    }
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
      return Promise.reject(error);
    }
    if (refreshing) {
      await new Promise<void>((resolve) => {
        queue.push((newToken: string) => {
          if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve();
        });
      });
      return api(originalRequest);
    }
    originalRequest._retry = true;
    refreshing = true;
    try {
      const res = await axios.post<{ access_token: string }>(
        `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );
      const newToken = res.data.access_token;
      localStorage.setItem('token', newToken);
      queue.forEach((cb) => cb(newToken));
      queue = [];
      if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/signin';
      return Promise.reject(error);
    } finally {
      refreshing = false;
    }
  }
);

export default api;

// Helper for handling API errors
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
