// Shared utility functions for StockSense application
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a readable format
 */
export function formatDate(date: string | Date, includeTime = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a quantity with unit
 */
export function formatQuantity(quantity: number, unit?: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(quantity);
  
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Generate a unique reference number for documents
 * Format: TYPE-YYYYMMDD-XXXXX (e.g., REC-20260926-00001)
 */
export function generateReference(type: string, sequence: number): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seqStr = sequence.toString().padStart(5, '0');
  return `${type.toUpperCase()}-${dateStr}-${seqStr}`;
}

/**
 * Calculate stock status based on quantity and thresholds
 */
export function getStockStatus(
  quantity: number,
  minQuantity: number | null,
  maxQuantity: number | null
): 'out_of_stock' | 'low_stock' | 'in_stock' | 'overstock' {
  if (quantity === 0) return 'out_of_stock';
  if (minQuantity !== null && quantity < minQuantity) return 'low_stock';
  if (maxQuantity !== null && quantity > maxQuantity) return 'overstock';
  return 'in_stock';
}

/**
 * Get status badge color for document status
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'gray',
    waiting: 'yellow',
    ready: 'blue',
    done: 'green',
    canceled: 'red',
  };
  return colors[status.toLowerCase()] || 'gray';
}

/**
 * Validate SKU format (alphanumeric, dashes, underscores)
 */
export function isValidSKU(sku: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(sku);
}

/**
 * Slugify a string (for URLs, IDs, etc.)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Convert enum value to readable label
 */
export function formatEnumLabel(value: string): string {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
