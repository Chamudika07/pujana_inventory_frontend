import apiClient from './api';
import type { Category, CategoryCreate } from '../types/category';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get('/categories/');
    return response.data;
  },

  async getById(id: number): Promise<Category> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  async create(categoryData: CategoryCreate): Promise<Category> {
    const response = await apiClient.post('/categories/', categoryData);
    return response.data;
  },

  async update(id: number, categoryData: CategoryCreate): Promise<Category> {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
