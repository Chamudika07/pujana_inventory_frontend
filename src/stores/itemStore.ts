import { create } from 'zustand';
import type { Item } from '../types/item';
import { itemService } from '@services/itemService';

interface ItemStore {
  items: Item[];
  isLoading: boolean;
  error: string | null;
  
  fetchItems: () => Promise<void>;
  addItem: (item: Item) => void;
  updateItem: (id: number, item: Item) => void;
  removeItem: (id: number) => void;
  setItems: (items: Item[]) => void;
  clearError: () => void;
}

export const useItemStore = create<ItemStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await itemService.getAll();
      set({ items, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch items',
        isLoading: false 
      });
    }
  },

  addItem: (item: Item) => {
    set((state) => ({
      items: [...state.items, item],
    }));
  },

  updateItem: (id: number, updatedItem: Item) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? updatedItem : item
      ),
    }));
  },

  removeItem: (id: number) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  setItems: (items: Item[]) => {
    set({ items });
  },

  clearError: () => {
    set({ error: null });
  },
}));
