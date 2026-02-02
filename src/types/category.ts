export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
}
