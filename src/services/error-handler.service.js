/**
 * Error handling service for API errors
 */
import notificationService from './notification.service';
import store from '../store';

class ErrorHandlerService {
  /**
   * Handle API error
   * @param {Error} error - Error object
   * @param {boolean} showNotification - Whether to show notification
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Original error
   */
  handleError(
    error,
    showNotification = true,
    defaultMessage = 'An error occurred. Please try again.'
  ) {
    // Log error
    console.error('API Error:', error);

    // Extract error message
    const errorMessage = this.getErrorMessage(error, defaultMessage);

    // Show notification if needed
    if (showNotification) {
      notificationService.error(errorMessage);
    }

    // Return original error for further handling
    return error;
  }

  /**
   * Extract error message from error object
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   * @returns {string} Error message
   */
  getErrorMessage(error, defaultMessage = 'An error occurred. Please try again.') {
    // Handle different error formats
    if (error.response && error.response.data) {
      // Axios-like error format
      const { data } = error.response;
      if (typeof data === 'string') {
        return data;
      }
      if (data.message) {
        return data.message;
      }
      if (data.error) {
        return data.error;
      }
    }

    // Handle fetch API error format
    if (error.message) {
      return error.message;
    }

    // Handle string error
    if (typeof error === 'string') {
      return error;
    }

    // Default error message
    return defaultMessage;
  }

  /**
   * Handle authentication error
   * @param {Error} error - Error object
   * @returns {Error} Original error
   */
  handleAuthError(error) {
    // Check if error is authentication related
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes('/auth/login') &&
      !error.config.url.includes('/auth/refresh-token')
    ) {
      // Logout user
      store.dispatch('auth/logout');

      // Show notification
      notificationService.error('Your session has expired. Please log in again.');
    }

    return error;
  }

  /**
   * Handle network error
   * @param {Error} error - Error object
   * @returns {Error} Original error
   */
  handleNetworkError(error) {
    // Check if error is network related
    if (error.message === 'Network Error' || !navigator.onLine) {
      notificationService.error('Network error. Please check your internet connection.');
    }

    return error;
  }

  /**
   * Map error status code to user-friendly message
   * @param {number} statusCode - HTTP status code
   * @returns {string} User-friendly error message
   */
  getErrorMessageByStatusCode(statusCode) {
    const errorMessages = {
      400: 'Bad request. Please check your input.',
      401: 'Authentication required. Please log in.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'Conflict with the current state of the resource.',
      422: 'Validation error. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway. Please try again later.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. Please try again later.'
    };

    return errorMessages[statusCode] || 'An error occurred. Please try again.';
  }
}

export default new ErrorHandlerService();
