import apiClient from './api';
import type { DueDashboardSummary } from '../types/bill';

export const dashboardService = {
  async getDueSummary(): Promise<DueDashboardSummary> {
    const response = await apiClient.get('/dashboard/dues-summary');
    return response.data;
  },
};
