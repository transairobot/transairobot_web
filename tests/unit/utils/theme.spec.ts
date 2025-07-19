import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initializeTheme,
  toggleTheme,
  setTheme,
  getCurrentTheme,
  getCurrentAppliedTheme
} from '@/utils/theme';

describe('Theme Utilities', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn(key => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      })
    };
  })();

  // Mock document.documentElement
  const documentElementMock = {
    setAttribute: vi.fn(),
    getAttribute: vi.fn()
  };

  // Mock matchMedia
  const matchMediaMock = vi.fn();

  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(document, 'documentElement', { value: documentElementMock });
    window.matchMedia = matchMediaMock;

    // Clear mocks
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeTheme', () => {
    it('uses saved theme from localStorage if available', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const result = initializeTheme();

      expect(result).toBe('dark');
      expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('uses system preference if no saved theme', () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({ matches: true }); // Prefer dark

      const result = initializeTheme();

      expect(result).toBe('dark');
      expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('uses system preference when theme is set to "system"', () => {
      localStorageMock.getItem.mockReturnValue('system');
      matchMediaMock.mockReturnValue({ matches: false }); // Prefer light

      const result = initializeTheme();

      expect(result).toBe('system');
      expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });
  });

  describe('toggleTheme', () => {
    it('toggles from light to dark', () => {
      localStorageMock.getItem.mockReturnValue('light');

      const result = toggleTheme();

      expect(result).toBe('dark');
      expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('toggles from dark to light', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const result = toggleTheme();

      expect(result).toBe('light');
      expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('toggles when using system preference', () => {
      localStorageMock.getItem.mockReturnValue('system');
      documentElementMock.getAttribute.mockReturnValue('light');

      const result = toggleTheme();

      expect(result).toBe('dark');
      expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('setTheme', () => {
    it('sets theme to light', () => {
      const result = setTheme('light');

      expect(result).toBe('light');
      expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('sets theme to dark', () => {
      const result = setTheme('dark');

      expect(result).toBe('dark');
      expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('sets theme to system and applies system preference', () => {
      matchMediaMock.mockReturnValue({ matches: true }); // Prefer dark

      const result = setTheme('system');

      expect(result).toBe('system');
      expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'system');
    });
  });

  describe('getCurrentTheme', () => {
    it('returns theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const result = getCurrentTheme();

      expect(result).toBe('dark');
    });

    it('returns default theme if not in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getCurrentTheme();

      expect(result).toBe('light');
    });
  });

  describe('getCurrentAppliedTheme', () => {
    it('returns theme from document attribute', () => {
      documentElementMock.getAttribute.mockReturnValue('dark');

      const result = getCurrentAppliedTheme();

      expect(result).toBe('dark');
    });

    it('returns default theme if attribute not set', () => {
      documentElementMock.getAttribute.mockReturnValue(null);

      const result = getCurrentAppliedTheme();

      expect(result).toBe('light');
    });
  });
});
