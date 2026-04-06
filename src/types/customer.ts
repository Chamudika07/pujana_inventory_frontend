export type CustomerType = 'retail' | 'wholesale' | 'regular' | 'vip';

export interface CustomerSummary {
  number_of_bills: number;
  total_purchases: number;
  due_balance: number;
}

export interface CustomerBasic {
  id: number;
  full_name: string;
  phone_number: string;
  customer_type: CustomerType;
  email?: string | null;
}

export interface CustomerListItem {
  id: number;
  full_name: string;
  phone_number: string;
  email?: string | null;
  customer_type: CustomerType;
  loyalty_points: number;
  due_balance: number;
  is_active: boolean;
  created_at: string;
  summary: CustomerSummary;
}

export interface CustomerDetail extends CustomerListItem {
  address?: string | null;
  notes?: string | null;
  updated_at: string;
}

export interface CustomerFormData {
  full_name: string;
  phone_number: string;
  email?: string;
  address?: string;
  customer_type: CustomerType;
  notes?: string;
  loyalty_points: number;
  due_balance: number;
  is_active: boolean;
}
