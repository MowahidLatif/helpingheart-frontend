import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './constants';
import { API_ENDPOINTS } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send HttpOnly auth cookies automatically
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Let browser set Content-Type with boundary for FormData
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// On 401: try cookie-based refresh, then retry; else logout
let refreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as { _retry?: boolean } & NonNullable<AxiosError['config']>;
    if (error.response?.status !== 401 || originalRequest._retry) {
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/signin';
      }
      return Promise.reject(error);
    }
    if (refreshing) {
      await new Promise<void>((resolve) => {
        queue.push(resolve);
      });
      return api(originalRequest);
    }
    originalRequest._retry = true;
    refreshing = true;
    try {
      // Refresh token is in an HttpOnly cookie — no Authorization header needed
      await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
        {},
        { withCredentials: true }
      );
      queue.forEach((resolve) => resolve());
      queue = [];
      return api(originalRequest);
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
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
