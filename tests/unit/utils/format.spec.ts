import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatNumber,
  formatFileSize,
  formatVersion,
  truncateText
} from '@/utils/format';

describe('Format Utilities', () => {
  describe('formatDate', () => {
    // Mock Intl.DateTimeFormat
    const originalDateTimeFormat = Intl.DateTimeFormat;

    beforeEach(() => {
      // Mock the DateTimeFormat to return a predictable value
      Intl.DateTimeFormat = vi.fn().mockImplementation(() => ({
        format: () => 'Jan 1, 2023'
      })) as any;
    });

    afterEach(() => {
      // Restore original DateTimeFormat
      Intl.DateTimeFormat = originalDateTimeFormat;
    });

    it('formats date string', () => {
      const result = formatDate('2023-01-01');
      expect(result).toBe('Jan 1, 2023');
      expect(Intl.DateTimeFormat).toHaveBeenCalledWith('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    });

    it('formats Date object', () => {
      const date = new Date(2023, 0, 1); // Jan 1, 2023
      const result = formatDate(date);
      expect(result).toBe('Jan 1, 2023');
    });

    it('handles custom options', () => {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      } as const;

      formatDate('2023-01-01', options);

      expect(Intl.DateTimeFormat).toHaveBeenCalledWith('en-US', options);
    });

    it('returns empty string for null or undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('formats number with default options', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000.5)).toBe('1,001'); // Rounds to 0 decimals by default
    });

    it('formats number with specified decimals', () => {
      expect(formatNumber(1000.123, 2)).toBe('1,000.12');
      expect(formatNumber(1000, 2)).toBe('1,000.00');
    });

    it('returns empty string for null or undefined', () => {
      expect(formatNumber(null)).toBe('');
      expect(formatNumber(undefined)).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(100)).toBe('100 Bytes');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(2097152)).toBe('2 MB');
    });

    it('formats gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('handles zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('respects decimal places', () => {
      expect(formatFileSize(1500, 0)).toBe('1 KB');
      expect(formatFileSize(1500, 1)).toBe('1.5 KB');
      expect(formatFileSize(1500, 3)).toBe('1.465 KB');
    });
  });

  describe('formatVersion', () => {
    it('adds v prefix if not present', () => {
      expect(formatVersion('1.0.0')).toBe('v1.0.0');
    });

    it('keeps v prefix if already present', () => {
      expect(formatVersion('v1.0.0')).toBe('v1.0.0');
    });

    it('returns empty string for null or undefined', () => {
      expect(formatVersion(null)).toBe('');
      expect(formatVersion(undefined)).toBe('');
    });
  });

  describe('truncateText', () => {
    it('truncates text longer than specified length', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 10)).toBe('This is a ...');
    });

    it('does not truncate text shorter than specified length', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe(shortText);
    });

    it('uses default length of 100 if not specified', () => {
      const text = 'A'.repeat(101);
      const result = truncateText(text);
      expect(result.length).toBe(103); // 100 chars + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('returns empty string for null or undefined', () => {
      expect(truncateText(null)).toBe('');
      expect(truncateText(undefined)).toBe('');
    });
  });
});
