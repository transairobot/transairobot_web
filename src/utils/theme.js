/**
 * Theme utility functions
 */

/**
 * Initialize theme based on user preference or system preference
 */
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme && savedTheme !== 'system') {
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
  }

  // Check for system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = prefersDark ? 'dark' : 'light';

  document.documentElement.setAttribute('data-theme', theme);

  // Only save to localStorage if not using system preference
  if (!savedTheme) {
    localStorage.setItem('theme', theme);
  }

  return savedTheme === 'system' ? 'system' : theme;
};

/**
 * Toggle between light and dark themes
 */
export const toggleTheme = () => {
  const currentTheme = localStorage.getItem('theme') || 'light';

  // If using system preference, toggle between light and dark explicitly
  if (currentTheme === 'system') {
    const newTheme =
      document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    return newTheme;
  }

  // Otherwise toggle between light and dark
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  return newTheme;
};

/**
 * Set theme explicitly
 */
export const setTheme = theme => {
  if (theme === 'system') {
    // Use system preference
    localStorage.setItem('theme', 'system');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', systemTheme);
    return 'system';
  } else {
    // Set explicit theme
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
  }
};

/**
 * Get current theme
 */
export const getCurrentTheme = () => {
  return localStorage.getItem('theme') || 'light';
};

/**
 * Get current applied theme (the actual theme being displayed)
 */
export const getCurrentAppliedTheme = () => {
  return document.documentElement.getAttribute('data-theme') || 'light';
};
