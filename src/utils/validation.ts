/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }

  return {
    isValid: true,
    message: 'Password is strong'
  };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    email?: boolean;
    url?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
    custom?: (value: any, fields: { [key: string]: any }) => string | null;
  };
}

/**
 * Validate form fields
 * @param {Object} fields - Form fields to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation errors
 */
export const validateForm = (
  fields: { [key: string]: any },
  rules: ValidationRules
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  Object.keys(rules).forEach(field => {
    const value = fields[field];
    const fieldRules = rules[field];

    if (fieldRules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = 'This field is required';
      return;
    }

    if (fieldRules.email && value && !isValidEmail(value)) {
      errors[field] = 'Please enter a valid email address';
      return;
    }

    if (fieldRules.url && value && !isValidUrl(value)) {
      errors[field] = 'Please enter a valid URL';
      return;
    }

    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = `Must be at least ${fieldRules.minLength} characters`;
      return;
    }

    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] = `Must be no more than ${fieldRules.maxLength} characters`;
      return;
    }

    if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.message || 'Invalid format';
      return;
    }

    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customError = fieldRules.custom(value, fields);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });

  return errors;
};

export default {
  isValidEmail,
  validatePassword,
  isValidUrl,
  validateForm
};
