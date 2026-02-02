import apiClient from './api';
import type { LowStockAlert, AlertStats, UserPreferencesUpdate } from '../types/alert';

export const alertService = {
  async getAll(showResolved: boolean = false): Promise<LowStockAlert[]> {
    const response = await apiClient.get('/alerts/', {
      params: { show_resolved: showResolved },
    });
    return response.data;
  },

  async getStats(): Promise<AlertStats> {
    const response = await apiClient.get('/alerts/stats');
    return response.data;
  },

  async getById(alertId: number): Promise<LowStockAlert> {
    const response = await apiClient.get(`/alerts/${alertId}`);
    return response.data;
  },

  async markAsResolved(alertId: number): Promise<void> {
    await apiClient.put(`/alerts/${alertId}/resolve`);
  },

  async updateUserPreferences(preferences: UserPreferencesUpdate): Promise<any> {
    const response = await apiClient.put('/alerts/preferences', preferences);
    return response.data;
  },
};
