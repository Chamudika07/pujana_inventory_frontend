import type { CustomerBasic } from './customer';
import type { SupplierBasic } from './supplier';

export interface Bill {
  id: number;
  bill_id: string;
  bill_type: 'buy' | 'sell';
  customer_id?: number | null;
  customer?: CustomerBasic | null;
  supplier_id?: number | null;
  supplier?: SupplierBasic | null;
  created_at: string;
}

export interface BillResponse {
  bill_id: string;
  bill_type: 'buy' | 'sell';
  message: string;
  total_items: number;
}

export interface BillCreateItem {
  model_number: string;
  quantity: number;
}

export interface BillCreatePayload {
  bill_type: 'buy' | 'sell';
  items: BillCreateItem[];
  customer_id?: number;
  supplier_id?: number;
}

export interface BillItem {
  item: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PrintBillResponse {
  bill_id: string;
  bill_type: 'buy' | 'sell';
  items: BillItem[];
  grand_total: number;
}
