import { Category } from './category';

export interface Item {
  id: number;
  name: string;
  quantity: number;
  buying_price: number;
  selling_price: number;
  description?: string;
  model_number: string;
  qr_code_path?: string;
  category: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface ItemCreate {
  name: string;
  quantity: number;
  buying_price: number;
  selling_price: number;
  description?: string;
  category_id: number;
}

export interface ItemUpdate extends Partial<ItemCreate> {}
