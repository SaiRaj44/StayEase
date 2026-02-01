// Utility functions
import { clsx, type ClassValue } from 'clsx';

// Classname utility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format currency for INR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

// Calculate nights between two dates
export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Generate session ID for chatbot
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Get room type display name
export function getRoomTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    standard: 'Standard',
    deluxe: 'Deluxe',
    suite: 'Suite',
    premium: 'Premium',
  };
  return labels[type] || type;
}

// Get status badge color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-success',
    cancelled: 'badge-error',
    completed: 'badge-info',
  };
  return colors[status] || 'badge-info';
}

// Amenity icons
export const amenityIcons: Record<string, string> = {
  WiFi: '📶',
  AC: '❄️',
  TV: '📺',
  'Hot Water': '🚿',
  'Room Service': '🛎️',
  Parking: '🅿️',
  Breakfast: '🍳',
  'Temple View': '🛕',
  Balcony: '🏠',
  'Mini Fridge': '🧊',
  'Safe Locker': '🔐',
  Laundry: '👕',
};

// Get tomorrow's date in YYYY-MM-DD format
export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Get date after X days in YYYY-MM-DD format
export function getDateAfterDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate Indian phone number
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}
