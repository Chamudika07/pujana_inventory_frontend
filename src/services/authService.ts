import apiClient from './api';
import type { User, UserCreate, TokenResponse } from '../types/user';

export const authService = {
  async register(userData: UserCreate): Promise<User> {
    const response = await apiClient.post('/users/', userData);
    return response.data;
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await apiClient.post('/users/login', formData);
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  },
};
