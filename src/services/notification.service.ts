import { createApp, h, App as VueApp } from 'vue';
import AppToast from '../components/common/AppToast.vue';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  app: VueApp;
}

class NotificationService {
  private toasts: Toast[];
  private toastContainer: HTMLElement | null;

  constructor() {
    this.toasts = [];
    this.toastContainer = null;
    if (typeof window !== 'undefined') {
      this.initToastContainer();
    }
  }

  private initToastContainer(): void {
    if (!document.getElementById('toast-container')) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      document.body.appendChild(this.toastContainer);
    } else {
      this.toastContainer = document.getElementById('toast-container');
    }
  }

  showToast(message: string, type: ToastType = 'info', duration = 5000): string {
    if (!this.toastContainer) {
      this.initToastContainer();
    }
    const toastId = Date.now().toString();

    const closeToast = () => {
      const index = this.toasts.findIndex(toast => toast.id === toastId);
      if (index !== -1) {
        const toast = this.toasts[index];
        toast.app.unmount();
        const toastElement = document.getElementById(`toast-${toastId}`);
        if (toastElement) {
          toastElement.remove();
        }
        this.toasts.splice(index, 1);
      }
    };

    const ToastApp = createApp({
      render: () =>
        h(AppToast, {
          message,
          type,
          show: true,
          duration,
          onClose: closeToast
        })
    });

    const toastElement = document.createElement('div');
    toastElement.id = `toast-${toastId}`;
    this.toastContainer!.appendChild(toastElement);

    ToastApp.mount(toastElement);

    this.toasts.push({
      id: toastId,
      app: ToastApp
    });

    if (duration > 0) {
      setTimeout(closeToast, duration);
    }

    return toastId;
  }

  success(message: string, duration = 5000): string {
    return this.showToast(message, 'success', duration);
  }

  error(message: string, duration = 5000): string {
    return this.showToast(message, 'error', duration);
  }

  warning(message: string, duration = 5000): string {
    return this.showToast(message, 'warning', duration);
  }

  info(message: string, duration = 5000): string {
    return this.showToast(message, 'info', duration);
  }
}

export default new NotificationService();
