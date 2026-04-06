import type { CustomerBasic } from './customer';
import type { SupplierBasic } from './supplier';

export type BillType = 'buy' | 'sell';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'other';
export type PaymentDirection = 'incoming' | 'outgoing';
export type PaymentType = 'customer_payment' | 'supplier_payment' | 'bill_initial_payment';

export interface BillFinancials {
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_status: PaymentStatus;
  payment_mode_summary?: string | null;
}

export interface Payment {
  id: number;
  bill_id: number;
  customer_id?: number | null;
  supplier_id?: number | null;
  payment_direction: PaymentDirection;
  payment_type: PaymentType;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string | null;
  notes?: string | null;
  paid_at: string;
  created_at: string;
  created_by?: number | null;
}

export interface BillLineItem {
  id: number;
  item_id: number;
  item_name: string;
  model_number: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  transaction_type: BillType;
  created_at: string;
}

export interface Bill extends BillFinancials {
  id: number;
  bill_id: string;
  bill_code: string;
  bill_type: BillType;
  customer_id?: number | null;
  customer?: CustomerBasic | null;
  supplier_id?: number | null;
  supplier?: SupplierBasic | null;
  notes?: string | null;
  finalized_at?: string | null;
  created_by?: number | null;
  created_at: string;
}

export interface BillDetail extends Bill {
  items: BillLineItem[];
  payments: Payment[];
}

export interface BillCreateItem {
  model_number: string;
  quantity: number;
}

export interface BillCreatePayload {
  bill_type: BillType;
  items: BillCreateItem[];
  customer_id?: number;
  supplier_id?: number;
  discount_amount?: number;
  tax_amount?: number;
  initial_paid_amount?: number;
  payment_method?: PaymentMethod;
  payment_mode_summary?: string;
  notes?: string;
  finalized_at?: string;
}

export interface BillCreateResponse extends BillFinancials {
  bill_id: string;
  bill_type: BillType;
  message: string;
  total_items: number;
}

export interface PaymentCreatePayload {
  bill_id?: number;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  notes?: string;
  paid_at?: string;
}

export interface CustomerPaymentCreatePayload extends PaymentCreatePayload {
  customer_id: number;
}

export interface SupplierPaymentCreatePayload extends PaymentCreatePayload {
  supplier_id: number;
}

export interface PaymentCreateResult {
  payments: Payment[];
  total_allocated_amount: number;
}

export interface CustomerDueSummary {
  customer_id: number;
  total_billed: number;
  total_paid: number;
  total_outstanding: number;
  unpaid_bills_count: number;
  partially_paid_bills_count: number;
}

export interface SupplierPayableSummary {
  supplier_id: number;
  total_purchased: number;
  total_paid: number;
  total_outstanding: number;
  unpaid_bills_count: number;
  partially_paid_bills_count: number;
}

export interface LedgerEntry {
  entry_type: 'bill' | 'payment';
  bill_id?: number | null;
  bill_code?: string | null;
  payment_id?: number | null;
  payment_type?: PaymentType | null;
  payment_method?: PaymentMethod | null;
  payment_direction?: PaymentDirection | null;
  amount: number;
  paid_amount?: number | null;
  due_amount?: number | null;
  total_amount?: number | null;
  payment_status?: PaymentStatus | null;
  notes?: string | null;
  reference_number?: string | null;
  happened_at: string;
  running_balance: number;
}

export interface CustomerLedger {
  customer_id: number;
  customer_name: string;
  phone_number: string;
  email?: string | null;
  address?: string | null;
  is_active: boolean;
  summary: CustomerDueSummary;
  entries: LedgerEntry[];
}

export interface SupplierLedger {
  supplier_id: number;
  supplier_name: string;
  phone_number: string;
  email?: string | null;
  address?: string | null;
  is_active: boolean;
  summary: SupplierPayableSummary;
  entries: LedgerEntry[];
}

export interface DashboardPartyBalance {
  id: number;
  name: string;
  phone_number?: string | null;
  balance: number;
  bills_count: number;
}

export interface DueDashboardSummary {
  total_customer_dues: number;
  total_supplier_payables: number;
  unpaid_sell_bills_count: number;
  unpaid_buy_bills_count: number;
  partially_paid_bills_count: number;
  recent_payments: Payment[];
  top_customers_with_dues: DashboardPartyBalance[];
  top_suppliers_with_payables: DashboardPartyBalance[];
}

export interface PrintBillResponse {
  bill_id: string;
  bill_type: BillType;
  items: Array<{
    item: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  grand_total: number;
}
