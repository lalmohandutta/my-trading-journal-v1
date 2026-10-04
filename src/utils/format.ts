export const formatCurrency = (value: number | null | undefined, minimumFractionDigits = 0) => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(safeValue);
};

export const formatNumber = (value: number | null | undefined, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? Number(value) : 0);

export const formatPercentage = (value: number | null | undefined) => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;
  return `${safeValue.toFixed(1)}%`;
};

export const formatDate = (value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
};

export const formatPnl = (value: number | null | undefined) => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;
  const prefix = safeValue < 0 ? '-₹' : '₹';
  const absValue = Math.abs(safeValue);
  return `${prefix}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(absValue)}`;
};
