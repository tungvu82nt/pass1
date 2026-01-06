/**
 * Unit Tests cho usePasswordForm Hook
 * Test template cho custom hooks
 */

import { renderHook, act } from '@testing-library/react';
import { usePasswordForm } from '../use-password-form';
import { PasswordEntry } from '@/lib/types/models';

// Mock dependencies
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/validation/password-validation', () => ({
  passwordEntrySchema: jest.fn(),
  generateSecurePassword: jest.fn(() => 'generated-password-123'),
  validatePasswordStrength: jest.fn(() => ({
    score: 4,
    feedback: ['Strong password']
  }))
}));

describe('usePasswordForm', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty form values', () => {
    const { result } = renderHook(() => 
      usePasswordForm({ onSave: mockOnSave, onClose: mockOnClose })
    );

    expect(result.current.form.getValues()).toEqual({
      service: '',
      username: '',
      password: ''
    });
  });

  it('should populate form when editing existing entry', () => {
    const editEntry: PasswordEntry = {
      id: '1',
      service: 'Test Service',
      username: 'test@example.com',
      password: 'test-password',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    };

    const { result } = renderHook(() => 
      usePasswordForm({ 
        editEntry, 
        onSave: mockOnSave, 
        onClose: mockOnClose 
      })
    );

    expect(result.current.form.getValues()).toEqual({
      service: 'Test Service',
      username: 'test@example.com',
      password: 'test-password'
    });
    expect(result.current.isEdit).toBe(true);
  });

  it('should generate secure password', () => {
    const { result } = renderHook(() => 
      usePasswordForm({ onSave: mockOnSave, onClose: mockOnClose })
    );

    act(() => {
      result.current.handleGeneratePassword();
    });

    expect(result.current.form.getValues().password).toBe('generated-password-123');
  });

  it('should calculate password strength', () => {
    const { result } = renderHook(() => 
      usePasswordForm({ onSave: mockOnSave, onClose: mockOnClose })
    );

    act(() => {
      result.current.form.setValue('password', 'strong-password');
    });

    expect(result.current.passwordStrength).toEqual({
      score: 4,
      feedback: ['Strong password']
    });
  });

  it('should handle form submission successfully', async () => {
    mockOnSave.mockResolvedValue(undefined);

    const { result } = renderHook(() => 
      usePasswordForm({ onSave: mockOnSave, onClose: mockOnClose })
    );

    // Set form values
    act(() => {
      result.current.form.setValue('service', 'Test Service');
      result.current.form.setValue('username', 'test@example.com');
      result.current.form.setValue('password', 'test-password');
    });

    // Submit form
    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockOnSave).toHaveBeenCalledWith({
      service: 'Test Service',
      username: 'test@example.com',
      password: 'test-password'
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle form submission error', async () => {
    const error = new Error('Save failed');
    mockOnSave.mockRejectedValue(error);

    const { result } = renderHook(() => 
      usePasswordForm({ onSave: mockOnSave, onClose: mockOnClose })
    );

    // Set form values
    act(() => {
      result.current.form.setValue('service', 'Test Service');
      result.current.form.setValue('username', 'test@example.com');
      result.current.form.setValue('password', 'test-password');
    });

    // Submit form and expect error
    await expect(async () => {
      await act(async () => {
        await result.current.onSubmit();
      });
    }).rejects.toThrow('Save failed');

    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});