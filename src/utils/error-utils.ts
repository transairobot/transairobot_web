import notificationService from '../services/notification.service';

/**
 * Handle service errors with authentication failure check
 * @param error - The error object
 * @param businessErrorMessage - The business error message to show if not auth failure
 * @param showNotification - Whether to show notification (default: true)
 */
export function handleServiceError(
  error: any,
  businessErrorMessage: string,
  showNotification = true
): void {
  console.error('Service error:', error);

  // Don't show business error for authentication failures
  if (showNotification && error.message !== 'AUTHENTICATION_FAILED') {
    notificationService.error(businessErrorMessage);
  }
}

/**
 * Check if error is authentication failure
 * @param error - The error object
 * @returns true if it's an authentication failure
 */
export function isAuthenticationError(error: any): boolean {
  return error.message === 'AUTHENTICATION_FAILED';
}
