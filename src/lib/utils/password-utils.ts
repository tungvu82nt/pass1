/**
 * Password Utility Functions
 * Các hàm tiện ích để xử lý password operations
 */

import { PasswordEntry } from '@/lib/types/models';

/**
 * Tạo animation delay cho password cards
 * @param index - Index của password trong danh sách
 * @param staggerDelay - Delay giữa các animation (ms)
 * @param maxDelay - Delay tối đa (ms)
 * @returns Animation delay string
 */
export function createAnimationDelay(
  index: number,
  staggerDelay: number = 100,
  maxDelay: number = 1000
): string {
  return `${Math.min(index * staggerDelay, maxDelay)}ms`;
}

/**
 * Lọc passwords theo search query
 * @param passwords - Danh sách passwords
 * @param query - Search query
 * @returns Filtered passwords
 */
export function filterPasswordsByQuery(
  passwords: PasswordEntry[],
  query: string
): PasswordEntry[] {
  if (!query.trim()) return passwords;

  const lowercaseQuery = query.toLowerCase();
  return passwords.filter(password =>
    password.service.toLowerCase().includes(lowercaseQuery) ||
    password.username.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Sắp xếp passwords theo tiêu chí
 * @param passwords - Danh sách passwords
 * @param sortBy - Tiêu chí sắp xếp
 * @param order - Thứ tự sắp xếp
 * @returns Sorted passwords
 */
export function sortPasswords(
  passwords: PasswordEntry[],
  sortBy: 'service' | 'username' | 'updatedAt' = 'updatedAt',
  order: 'asc' | 'desc' = 'desc'
): PasswordEntry[] {
  return [...passwords].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'service':
        comparison = a.service.localeCompare(b.service);
        break;
      case 'username':
        comparison = a.username.localeCompare(b.username);
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Validate password entry data
 * @param entry - Password entry data
 * @returns Validation result
 */
export function validatePasswordEntry(
  entry: Partial<PasswordEntry>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!entry.service?.trim()) {
    errors.push('Tên dịch vụ không được để trống');
  }

  if (!entry.username?.trim()) {
    errors.push('Tên đăng nhập không được để trống');
  }

  if (!entry.password?.trim()) {
    errors.push('Mật khẩu không được để trống');
  }

  if (entry.service && entry.service.length > 100) {
    errors.push('Tên dịch vụ không được vượt quá 100 ký tự');
  }

  if (entry.username && entry.username.length > 100) {
    errors.push('Tên đăng nhập không được vượt quá 100 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate password strength score
 * @param password - Password string
 * @returns Strength score (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;

  // Length check
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  return Math.min(score, 100);
}

/**
 * Get password strength label
 * @param score - Password strength score
 * @returns Strength label
 */
export function getPasswordStrengthLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 80) return { label: 'Rất mạnh', color: 'text-green-600' };
  if (score >= 60) return { label: 'Mạnh', color: 'text-blue-600' };
  if (score >= 40) return { label: 'Trung bình', color: 'text-yellow-600' };
  if (score >= 20) return { label: 'Yếu', color: 'text-orange-600' };
  return { label: 'Rất yếu', color: 'text-red-600' };
}