import apiClient from './api';
import type { SupplierDetail, SupplierFormData, SupplierListItem } from '../types/supplier';
import type { SupplierLedger, SupplierPayableSummary } from '../types/bill';

export const supplierService = {
  async getAll(includeInactive = false): Promise<SupplierListItem[]> {
    const response = await apiClient.get('/suppliers/', {
      params: { include_inactive: includeInactive },
    });
    return response.data;
  },

  async search(query: string, includeInactive = false): Promise<SupplierListItem[]> {
    const response = await apiClient.get('/suppliers/search', {
      params: { q: query, include_inactive: includeInactive },
    });
    return response.data;
  },

  async getById(id: number): Promise<SupplierDetail> {
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  },

  async create(payload: SupplierFormData): Promise<SupplierDetail> {
    const response = await apiClient.post('/suppliers/', payload);
    return response.data;
  },

  async update(id: number, payload: SupplierFormData): Promise<SupplierDetail> {
    const response = await apiClient.put(`/suppliers/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/suppliers/${id}`);
  },

  async getLedger(id: number): Promise<SupplierLedger> {
    const response = await apiClient.get(`/suppliers/${id}/ledger`);
    return response.data;
  },

  async getPayableSummary(id: number): Promise<SupplierPayableSummary> {
    const response = await apiClient.get(`/suppliers/${id}/payable-summary`);
    return response.data;
  },
};
