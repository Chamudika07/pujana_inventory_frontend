import apiClient from './api';
import type { Bill, BillCreateItem, BillResponse } from '../types/bill';
import { AxiosError } from 'axios';

export const billService = {
  async getAll(): Promise<Bill[]> {
    const response = await apiClient.get('/bill/');
    return response.data;
  },

  async createBill(
    billType: 'buy' | 'sell',
    items: BillCreateItem[],
    customerId?: number
  ): Promise<BillResponse> {
    const response = await apiClient.post('/bill/', {
      bill_type: billType,
      items,
      customer_id: customerId,
    });
    return response.data;
  },

  async printBill(billId: string): Promise<void> {
    try {
      // Ensure you are calling the correct PDF endpoint: /print/pdf/{billId}
      const response = await apiClient.get(`/print/pdf/${billId}`, {
        responseType: 'blob', // This is crucial for handling file downloads
      });

      // Create a temporary URL from the binary data (blob)
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a hidden link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${billId}.pdf`); // Set the desired filename
      document.body.appendChild(link);
      link.click();

      // Clean up by revoking the object URL and removing the link
      window.URL.revokeObjectURL(url);
      link.parentNode?.removeChild(link);

    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Failed to download bill PDF:', axiosError.message);
      // You can re-throw the error to be handled by the component
      throw new Error('Failed to download bill PDF.');
    }
  },
};
