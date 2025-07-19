/**
 * Notification service for managing toast notifications
 */
import { createApp, h } from 'vue';
import AppToast from '../components/common/AppToast.vue';

class NotificationService {
  constructor() {
    this.toasts = [];
    this.toastContainer = null;
    this.initToastContainer();
  }

  /**
   * Initialize toast container
   */
  initToastContainer() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      document.body.appendChild(this.toastContainer);
    } else {
      this.toastContainer = document.getElementById('toast-container');
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds
   */
  showToast(message, type = 'info', duration = 5000) {
    const toastId = Date.now().toString();

    // Create toast instance
    const ToastApp = createApp({
      render() {
        return h(AppToast, {
          message,
          type,
          show: true,
          duration,
          onClose: () => this.closeToast(toastId)
        });
      },
      methods: {
        closeToast(id) {
          const index = this.toasts.findIndex(toast => toast.id === id);
          if (index !== -1) {
            const toastElement = document.getElementById(`toast-${id}`);
            if (toastElement) {
              toastElement.remove();
            }
            this.toasts.splice(index, 1);
          }
        }
      },
      data() {
        return {
          toasts: this.toasts
        };
      }
    });

    // Create toast element
    const toastElement = document.createElement('div');
    toastElement.id = `toast-${toastId}`;
    this.toastContainer.appendChild(toastElement);

    // Mount toast
    ToastApp.mount(toastElement);

    // Add to toasts array
    this.toasts.push({
      id: toastId,
      app: ToastApp
    });

    // Auto-close after duration
    if (duration > 0) {
      setTimeout(() => {
        const index = this.toasts.findIndex(toast => toast.id === toastId);
        if (index !== -1) {
          const toast = this.toasts[index];
          toast.app.unmount();
          toastElement.remove();
          this.toasts.splice(index, 1);
        }
      }, duration);
    }

    return toastId;
  }

  /**
   * Show success notification
   * @param {string} message - Success message
   * @param {number} duration - Duration in milliseconds
   */
  success(message, duration = 5000) {
    return this.showToast(message, 'success', duration);
  }

  /**
   * Show error notification
   * @param {string} message - Error message
   * @param {number} duration - Duration in milliseconds
   */
  error(message, duration = 5000) {
    return this.showToast(message, 'error', duration);
  }

  /**
   * Show warning notification
   * @param {string} message - Warning message
   * @param {number} duration - Duration in milliseconds
   */
  warning(message, duration = 5000) {
    return this.showToast(message, 'warning', duration);
  }

  /**
   * Show info notification
   * @param {string} message - Info message
   * @param {number} duration - Duration in milliseconds
   */
  info(message, duration = 5000) {
    return this.showToast(message, 'info', duration);
  }
}

export default new NotificationService();
