import apiClient from './api';
import type { Item, ItemCreate, ItemUpdate, QrResolveResponse } from '../types/item';
import { buildApiUrl } from './api';

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
      return await this.getByModelNumber(modelNumber);
    } catch (error) {
      console.error('Error searching item:', error);
      return null;
    }
  },

  async getByModelNumber(modelNumber: string): Promise<Item> {
    const response = await apiClient.get(`/items/by-model/${encodeURIComponent(modelNumber)}`);
    return response.data;
  },

  async resolveQrCode(scannedValue: string): Promise<QrResolveResponse> {
    const response = await apiClient.post('/items/resolve-qr', {
      scanned_value: scannedValue,
    });
    return response.data;
  },

  getQrCodeUrl(itemId: number): string {
    return buildApiUrl(`/items/${itemId}/qr-code`);
  },
};
