/**
 * Password Validation Schema
 * Centralized validation logic cho password forms
 * 
 * Features:
 * - Zod schema validation
 * - Custom validation rules
 * - Type-safe validation
 */

import { z } from 'zod';

/**
 * Password entry validation schema
 */
export const passwordEntrySchema = z.object({
  service: z
    .string()
    .min(1, 'Tên dịch vụ không được để trống')
    .max(100, 'Tên dịch vụ không được quá 100 ký tự')
    .trim(),
  
  username: z
    .string()
    .min(1, 'Tên đăng nhập không được để trống')
    .max(100, 'Tên đăng nhập không được quá 100 ký tự')
    .trim(),
  
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(200, 'Mật khẩu không được quá 200 ký tự'),
});

/**
 * Type inference từ schema
 */
export type PasswordEntryFormData = z.infer<typeof passwordEntrySchema>;

/**
 * Password strength validation
 */
export const validatePasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Nên có ít nhất 8 ký tự');

  // Uppercase check
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Nên có ít nhất 1 chữ hoa');

  // Lowercase check
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Nên có ít nhất 1 chữ thường');

  // Number check
  if (/\d/.test(password)) score += 1;
  else feedback.push('Nên có ít nhất 1 số');

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Nên có ít nhất 1 ký tự đặc biệt');

  return { score, feedback };
};

/**
 * Generate secure password
 * Refactor: Tách từ PasswordForm component
 */
export const generateSecurePassword = (length: number = 16): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*(),.?":{}|<>';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  // Đảm bảo có ít nhất 1 ký tự từ mỗi loại
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill remaining length
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};