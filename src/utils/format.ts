/**
 * Formatting utility functions
 */

/**
 * Format date to localized string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // 如果没有提供选项，使用 toLocaleDateString() 的默认行为
  if (Object.keys(options).length === 0) {
    return dateObj.toLocaleDateString();
  }

  // 否则使用 Intl.DateTimeFormat 和提供的选项
  return new Intl.DateTimeFormat(undefined, options).format(dateObj);
};

/**
 * Format number with thousands separators
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (number: number | null | undefined, decimals = 0): string => {
  if (number === null || number === undefined) return '';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Format version string
 * @param {string} version - Version string (e.g., "1.2.3")
 * @returns {string} Formatted version string
 */
export const formatVersion = (version: string | null | undefined): string => {
  if (!version) return '';

  // Add "v" prefix if not present
  return version.startsWith('v') ? version : `v${version}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text: string | null | undefined, length = 100): string => {
  if (!text) return '';

  if (text.length <= length) return text;

  return text.substring(0, length) + '...';
};

export default {
  formatDate,
  formatNumber,
  formatFileSize,
  formatVersion,
  truncateText
};
