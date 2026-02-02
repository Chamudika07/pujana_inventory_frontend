export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const calculateProfit = (buyingPrice: number, sellingPrice: number, quantity: number): number => {
  return (sellingPrice - buyingPrice) * quantity;
};

export const formatQuantity = (quantity: number): string => {
  if (quantity < 0) return 'Out of Stock';
  if (quantity === 0) return 'No Stock';
  return quantity.toString();
};

export const isLowStock = (quantity: number, threshold: number = 5): boolean => {
  return quantity < threshold && quantity > 0;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
