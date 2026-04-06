import apiClient from './api';
import type { AlertStats, LowStockAlert, UserPreferences } from '../types/alert';

export const alertService = {
    getAll: async (showResolved = true): Promise<LowStockAlert[]> => {
        const response = await apiClient.get('/alerts/', {
            params: { show_resolved: showResolved },
        });
        return response.data;
    },

    getActive: async (): Promise<LowStockAlert[]> => {
        const response = await apiClient.get('/alerts/', {
            params: { show_resolved: false },
        });
        return response.data;
    },

    getStats: async (): Promise<AlertStats> => {
        const response = await apiClient.get('/alerts/stats');
        return response.data;
    },

    resolveAlert: async (alertId: number): Promise<LowStockAlert> => {
        const response = await apiClient.patch(`/alerts/${alertId}/resolve`);
        return response.data;
    },

    deleteAlert: async (alertId: number): Promise<void> => {
        await apiClient.delete(`/alerts/${alertId}`);
    },

    getPreferences: async (): Promise<UserPreferences> => {
        const response = await apiClient.get('/alerts/preferences/get');
        return response.data;
    },

    updatePreferences: async (preferences: UserPreferences): Promise<UserPreferences & { message: string }> => {
        const response = await apiClient.put('/alerts/preferences/update', preferences);
        return response.data;
    },

    sendTestEmail: async (): Promise<{ message: string; recipient?: string }> => {
        const response = await apiClient.post('/alerts/test-email');
        return response.data;
    },
};
