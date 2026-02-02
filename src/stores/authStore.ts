import { create } from 'zustand';
import type { User } from '../types/user';
import { authService } from '@services/authService';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      authService.setToken(response.access_token);
      set({ isAuthenticated: true, isLoading: false, error: null });
    } catch (error: any) {
      let errorMessage = 'Login failed';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      } else if (error.response?.data) {
        if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data
            .map((err: any) => err.msg || JSON.stringify(err))
            .join(', ');
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      set({ 
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false 
      });
      throw error;
    }
  },

  register: async (email: string, password: string, phone?: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register({
        email,
        password,
        phone_number: phone,
      });
      set({ isLoading: false });
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      } else if (error.response?.data) {
        if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data
            .map((err: any) => err.msg || JSON.stringify(err))
            .join(', ');
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, isInitialized: true });
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: () => {
    const token = authService.getToken();
    if (token) {
      set({ isAuthenticated: true, isInitialized: true });
    } else {
      set({ isAuthenticated: false, isInitialized: true });
    }
  },
}));

