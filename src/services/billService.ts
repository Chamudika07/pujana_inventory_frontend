import { AxiosError } from 'axios';

import apiClient from './api';
import type {
  Bill,
  BillCreatePayload,
  BillCreateResponse,
  BillDetail,
  Payment,
  PaymentCreatePayload,
  PaymentCreateResult,
} from '../types/bill';

export const billService = {
  async getAll(): Promise<Bill[]> {
    const response = await apiClient.get('/bills/');
    return response.data;
  },

  async getDueBills(): Promise<Bill[]> {
    const response = await apiClient.get('/bills/due');
    return response.data;
  },

  async getPayableBills(): Promise<Bill[]> {
    const response = await apiClient.get('/bills/payable');
    return response.data;
  },

  async getById(id: number): Promise<BillDetail> {
    const response = await apiClient.get(`/bills/${id}`);
    return response.data;
  },

  async createBill(payload: BillCreatePayload): Promise<BillCreateResponse> {
    const response = await apiClient.post('/bills/', payload);
    return response.data;
  },

  async getBillPayments(billId: number): Promise<Payment[]> {
    const response = await apiClient.get(`/bills/${billId}/payments`);
    return response.data;
  },

  async addBillPayment(billId: number, payload: PaymentCreatePayload): Promise<PaymentCreateResult> {
    const response = await apiClient.post(`/bills/${billId}/payments`, payload);
    return response.data;
  },

  async printBill(billCode: string): Promise<void> {
    try {
      const response = await apiClient.get(`/print/pdf/${billCode}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${billCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.parentNode?.removeChild(link);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Failed to download bill PDF:', axiosError.message);
      throw new Error('Failed to download bill PDF.');
    }
  },
};
