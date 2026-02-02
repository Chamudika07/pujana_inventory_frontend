import apiClient from './api';
import type { Item, ItemCreate, ItemUpdate } from '../types/item';

export const itemService = {
  async getAll(): Promise<Item[]> {
    const response = await apiClient.get('/items/');
    return response.data;
  },

  async getById(id: number): Promise<Item> {
    const response = await apiClient.get(`/items/${id}`);
    return response.data;
  },

  async create(itemData: ItemCreate): Promise<Item> {
    const response = await apiClient.post('/items/', itemData);
    return response.data;
  },

  async update(id: number, itemData: ItemUpdate): Promise<Item> {
    const response = await apiClient.put(`/items/${id}`, itemData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/items/${id}`);
  },

  async searchByModel(modelNumber: string): Promise<Item | null> {
    try {
      const items = await this.getAll();
      return items.find(item => item.model_number === modelNumber) || null;
    } catch (error) {
      console.error('Error searching item:', error);
      return null;
    }
  },
};
