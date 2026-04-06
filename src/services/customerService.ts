import apiClient from './api';
import type { CustomerDetail, CustomerFormData, CustomerListItem } from '../types/customer';
import type { CustomerDueSummary, CustomerLedger } from '../types/bill';

export const customerService = {
  async getAll(includeInactive = false): Promise<CustomerListItem[]> {
    const response = await apiClient.get('/customers/', {
      params: { include_inactive: includeInactive },
    });
    return response.data;
  },

  async search(query: string, includeInactive = false): Promise<CustomerListItem[]> {
    const response = await apiClient.get('/customers/search', {
      params: { q: query, include_inactive: includeInactive },
    });
    return response.data;
  },

  async getById(id: number): Promise<CustomerDetail> {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  async create(payload: CustomerFormData): Promise<CustomerDetail> {
    const response = await apiClient.post('/customers/', payload);
    return response.data;
  },

  async update(id: number, payload: CustomerFormData): Promise<CustomerDetail> {
    const response = await apiClient.put(`/customers/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },

  async getLedger(id: number): Promise<CustomerLedger> {
    const response = await apiClient.get(`/customers/${id}/ledger`);
    return response.data;
  },

  async getDueSummary(id: number): Promise<CustomerDueSummary> {
    const response = await apiClient.get(`/customers/${id}/due-summary`);
    return response.data;
  },
};
