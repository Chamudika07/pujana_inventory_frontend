import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Alert {
    id: string;
    item_id: string;
    item_name: string;
    current_stock: number;
    minimum_stock: number;
    status: 'active' | 'resolved';
    created_at: string;
    resolved_at?: string;
}

export interface AlertStats {
    total_alerts: number;
    active_alerts: number;
    resolved_alerts: number;
}

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
};

// Create axios instance with auth header
const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const alertService = {
    getAll: async (): Promise<Alert[]> => {
        const response = await apiClient.get('/alerts');
        return response.data;
    },

    getActive: async (): Promise<Alert[]> => {
        const response = await apiClient.get('/alerts?status=active');
        return response.data;
    },

    getStats: async (): Promise<AlertStats> => {
        const response = await apiClient.get('/alerts/stats');
        return response.data;
    },

    resolveAlert: async (alertId: string): Promise<Alert> => {
        const response = await apiClient.patch(`/alerts/${alertId}/resolve`);
        return response.data;
    },

    deleteAlert: async (alertId: string): Promise<void> => {
        await apiClient.delete(`/alerts/${alertId}`);
    }
};
