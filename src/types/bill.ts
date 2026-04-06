export interface Bill {
  id: number;
  bill_id: string;
  bill_type: 'buy' | 'sell';
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
