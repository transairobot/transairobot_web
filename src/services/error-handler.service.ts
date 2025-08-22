import notificationService from './notification.service';
import store from '../store';
import { AxiosError } from 'axios';

interface ApiErrorData {
  message?: string;
  error?: string;
}

class ErrorHandlerService {
  handleError(
    error: any,
    showNotification = true,
    defaultMessage = 'An error occurred. Please try again.'
  ): Error {
    console.error('API Error:', error);

    // Don't show notification for authentication failures
    if (error.message === 'AUTHENTICATION_FAILED') {
      return error;
    }

    const errorMessage = this.getErrorMessage(error, defaultMessage);
    if (showNotification) {
      notificationService.error(errorMessage);
    }
    return error;
  }

  getErrorMessage(error: any, defaultMessage = 'An error occurred. Please try again.'): string {
    if (error.response && error.response.data) {
      const data: ApiErrorData = error.response.data;
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

    if (error.message) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return defaultMessage;
  }

  handleAuthError(error: AxiosError): AxiosError {
    if (
      error.response &&
      error.response.status === 401 &&
      error.config &&
      !error.config.url?.includes('/auth/login') &&
      !error.config.url?.includes('/auth/refresh-token')
    ) {
      store.dispatch('auth/logout');
      notificationService.error('Your session has expired. Please log in again.');
    }
    return error;
  }

  handleNetworkError(error: Error): Error {
    if (error.message === 'Network Error' || !navigator.onLine) {
      notificationService.error('Network error. Please check your internet connection.');
    }
    return error;
  }

  getErrorMessageByStatusCode(statusCode: number): string {
    const errorMessages: { [key: number]: string } = {
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
