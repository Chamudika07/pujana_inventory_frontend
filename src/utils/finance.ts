import type { PaymentStatus } from '../types/bill';

export const formatCurrency = (value: number | string | null | undefined): string => {
  const numericValue = Number(value ?? 0);
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isNaN(numericValue) ? 0 : numericValue);
};

export const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const paymentStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'partially_paid':
      return 'Partially Paid';
    default:
      return 'Unpaid';
  }
};

export const paymentStatusVariant = (status: PaymentStatus): 'success' | 'warning' | 'secondary' => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'partially_paid':
      return 'warning';
    default:
      return 'secondary';
  }
};
