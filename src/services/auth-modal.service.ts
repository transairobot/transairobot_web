import { createApp, h, App as VueApp } from 'vue';
import AuthModal from '../components/common/AuthModal.vue';

interface AuthModalInstance {
  id: string;
  app: VueApp;
}

class AuthModalService {
  private modals: AuthModalInstance[];
  private modalContainer: HTMLElement | null;

  constructor() {
    this.modals = [];
    this.modalContainer = null;
    if (typeof window !== 'undefined') {
      this.initModalContainer();
    }
  }

  private initModalContainer(): void {
    if (!document.getElementById('auth-modal-container')) {
      this.modalContainer = document.createElement('div');
      this.modalContainer.id = 'auth-modal-container';
      document.body.appendChild(this.modalContainer);
    } else {
      this.modalContainer = document.getElementById('auth-modal-container');
    }
  }

  showAuthModal(message = 'You are not logged in. Please login to continue.'): Promise<boolean> {
    if (!this.modalContainer) {
      this.initModalContainer();
    }

    // Close any existing modals first
    this.closeAllModals();

    const modalId = Date.now().toString();

    return new Promise(resolve => {
      const closeModal = () => {
        const index = this.modals.findIndex(modal => modal.id === modalId);
        if (index !== -1) {
          const modal = this.modals[index];
          modal.app.unmount();
          const modalElement = document.getElementById(`auth-modal-${modalId}`);
          if (modalElement) {
            modalElement.remove();
          }
          this.modals.splice(index, 1);
        }
      };

      const handleLogin = () => {
        closeModal();
        // Navigate to login page
        if (typeof window !== 'undefined' && window.location) {
          const currentPath = window.location.pathname;
          // Don't redirect if already on login page
          if (currentPath !== '/login') {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
        resolve(true);
      };

      const handleClose = () => {
        closeModal();
        resolve(false);
      };

      const ModalApp = createApp({
        render: () =>
          h(AuthModal, {
            show: true,
            message,
            onLogin: handleLogin,
            onClose: handleClose
          })
      });

      const modalElement = document.createElement('div');
      modalElement.id = `auth-modal-${modalId}`;
      this.modalContainer!.appendChild(modalElement);

      ModalApp.mount(modalElement);

      this.modals.push({
        id: modalId,
        app: ModalApp
      });
    });
  }

  closeAllModals(): void {
    this.modals.forEach(modal => {
      modal.app.unmount();
      const modalElement = document.getElementById(`auth-modal-${modal.id}`);
      if (modalElement) {
        modalElement.remove();
      }
    });
    this.modals = [];
  }
}

export default new AuthModalService();
