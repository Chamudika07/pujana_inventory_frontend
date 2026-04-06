export interface SupplierSummary {
  number_of_purchase_bills: number;
  total_purchased_amount: number;
  payable_balance: number;
  total_paid: number;
}

export interface SupplierBasic {
  id: number;
  supplier_name: string;
  phone_number: string;
  company_name?: string | null;
  email?: string | null;
}

export interface SupplierListItem {
  id: number;
  supplier_name: string;
  company_name?: string | null;
  contact_person?: string | null;
  phone_number: string;
  email?: string | null;
  payable_balance: number;
  is_active: boolean;
  created_at: string;
  summary: SupplierSummary;
}

export interface SupplierDetail extends SupplierListItem {
  address?: string | null;
  notes?: string | null;
  updated_at: string;
}

export interface SupplierFormData {
  supplier_name: string;
  company_name?: string;
  contact_person?: string;
  phone_number: string;
  email?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
}
