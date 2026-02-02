import apiClient from './api';
import type { Bill, BillItemAction, BillResponse } from '../types/bill';

export const billService = {
  async getAll(): Promise<Bill[]> {
    const response = await apiClient.get('/bill/');
    return response.data;
  },

  async startBill(billType: 'buy' | 'sell'): Promise<BillResponse> {
    const response = await apiClient.post('/bill/start', null, {
      params: { bill_type: billType },
    });
    return response.data;
  },

  async addItemToBill(billItemData: BillItemAction): Promise<any> {
    const response = await apiClient.post('/bill/item', billItemData);
    return response.data;
  },

  async printBill(billId: string): Promise<any> {
    const response = await apiClient.get(`/bill/${billId}`);
    return response.data;
  },
};
