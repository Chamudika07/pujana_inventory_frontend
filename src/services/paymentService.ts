import apiClient from './api';
import type {
  CustomerPaymentCreatePayload,
  Payment,
  PaymentCreateResult,
  SupplierPaymentCreatePayload,
} from '../types/bill';

export const paymentService = {
  async addCustomerPayment(payload: CustomerPaymentCreatePayload): Promise<PaymentCreateResult> {
    const response = await apiClient.post('/payments/customer', payload);
    return response.data;
  },

  async addSupplierPayment(payload: SupplierPaymentCreatePayload): Promise<PaymentCreateResult> {
    const response = await apiClient.post('/payments/supplier', payload);
    return response.data;
  },

  async getCustomerPayments(customerId: number): Promise<Payment[]> {
    const response = await apiClient.get(`/payments/customer/${customerId}`);
    return response.data;
  },

  async getSupplierPayments(supplierId: number): Promise<Payment[]> {
    const response = await apiClient.get(`/payments/supplier/${supplierId}`);
    return response.data;
  },
};
