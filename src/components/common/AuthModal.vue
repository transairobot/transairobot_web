<template>
  <div v-if="show" class="auth-modal-overlay" @click="handleOverlayClick">
    <div class="auth-modal" @click.stop>
      <div class="auth-modal-header">
        <h3>Authentication Required</h3>
      </div>
      <div class="auth-modal-body">
        <p>{{ message }}</p>
      </div>
      <div class="auth-modal-footer">
        <button class="btn btn-secondary" @click="handleCancel">Cancel</button>
        <button class="btn btn-primary" @click="handleLogin">Go to Login</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'You are not logged in. Please login to continue.'
    }
  },
  emits: ['close', 'login'],
  methods: {
    handleOverlayClick() {
      this.$emit('close');
    },
    handleCancel() {
      this.$emit('close');
    },
    handleLogin() {
      this.$emit('login');
    }
  }
};
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.auth-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.auth-modal-header {
  padding: 20px 24px 0;
  border-bottom: 1px solid #e5e7eb;
}

.auth-modal-header h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.auth-modal-body {
  padding: 20px 24px;
}

.auth-modal-body p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.auth-modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .auth-modal {
    background: #1f2937;
    color: #f9fafb;
  }

  .auth-modal-header {
    border-bottom-color: #374151;
  }

  .auth-modal-header h3 {
    color: #f9fafb;
  }

  .auth-modal-body p {
    color: #d1d5db;
  }

  .btn-secondary {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .btn-secondary:hover {
    background: #4b5563;
    border-color: #6b7280;
  }
}
</style>
