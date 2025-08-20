import { describe, it, expect } from 'vitest';
import { isValidEmail, validatePassword, isValidUrl, validateForm } from '@/utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('accepts strong passwords', () => {
      const result = validatePassword('StrongP4ssword');
      expect(result.isValid).toBe(true);
    });

    it('rejects short passwords', () => {
      const result = validatePassword('Short1');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('requires uppercase letters', () => {
      const result = validatePassword('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('uppercase letter');
    });

    it('requires lowercase letters', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('lowercase letter');
    });

    it('requires numbers', () => {
      const result = validatePassword('NoNumbersHere');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('number');
    });
  });

  describe('isValidUrl', () => {
    it('validates correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:8080')).toBe(true);
      expect(isValidUrl('https://sub.domain.org/path?query=value')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
      expect(isValidUrl('www.example.com')).toBe(false); // Missing protocol
    });
  });

  describe('validateForm', () => {
    it('validates required fields', () => {
      const fields = { name: '', email: 'test@example.com' };
      const rules = {
        name: { required: true },
        email: { required: true }
      };

      const errors = validateForm(fields, rules);
      expect(errors).toHaveProperty('name');
      expect(errors.name).toContain('required');
      expect(errors).not.toHaveProperty('email');
    });

    it('validates email fields', () => {
      const fields = { email1: 'valid@example.com', email2: 'invalid' };
      const rules = {
        email1: { email: true },
        email2: { email: true }
      };

      const errors = validateForm(fields, rules);
      expect(errors).not.toHaveProperty('email1');
      expect(errors).toHaveProperty('email2');
      expect(errors.email2).toContain('valid email');
    });

    it('validates URL fields', () => {
      const fields = { url1: 'https://example.com', url2: 'not-a-url' };
      const rules = {
        url1: { url: true },
        url2: { url: true }
      };

      const errors = validateForm(fields, rules);
      expect(errors).not.toHaveProperty('url1');
      expect(errors).toHaveProperty('url2');
      expect(errors.url2).toContain('valid URL');
    });

    it('validates length constraints', () => {
      const fields = {
        short: 'abc',
        long: 'abcdefghijklmnopqrstuvwxyz'
      };
      const rules = {
        short: { minLength: 5 },
        long: { maxLength: 10 }
      };

      const errors = validateForm(fields, rules);
      expect(errors).toHaveProperty('short');
      expect(errors.short).toContain('at least 5');
      expect(errors).toHaveProperty('long');
      expect(errors.long).toContain('no more than 10');
    });

    it('validates with custom rules', () => {
      const fields = { password: 'password', confirmPassword: 'different' };
      const rules = {
        confirmPassword: {
          custom: (value: string, allFields: { [key: string]: any }) =>
            value !== allFields.password ? 'Passwords do not match' : null
        }
      };

      const errors = validateForm(fields, rules);
      expect(errors).toHaveProperty('confirmPassword');
      expect(errors.confirmPassword).toContain('do not match');
    });
  });
});
