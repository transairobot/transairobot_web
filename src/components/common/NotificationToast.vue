<template>
  <Transition name="toast" appear>
    <div class="notification-toast" :class="type">
      <div class="toast-content">
        <div class="toast-icon">
          <i v-if="type === 'success'" class="fas fa-check-circle"></i>
          <i v-else-if="type === 'error'" class="fas fa-exclamation-circle"></i>
          <i v-else-if="type === 'warning'" class="fas fa-exclamation-triangle"></i>
          <i v-else class="fas fa-info-circle"></i>
        </div>
        <div class="toast-message">{{ message }}</div>
        <button class="toast-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'NotificationToast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000 // 3 seconds
    }
  },
  emits: ['close'],
  mounted() {
    // Auto-close after specified duration
    if (this.duration > 0) {
      setTimeout(() => {
        this.$emit('close');
      }, this.duration);
    }
  }
};
</script>

<style lang="scss" scoped>
.notification-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  min-width: 300px;
  max-width: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;

  &.success {
    background-color: #d4edda;
    border-left: 4px solid #28a745;
    color: #155724;
  }

  &.error {
    background-color: #f8d7da;
    border-left: 4px solid #dc3545;
    color: #721c24;
  }

  &.warning {
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
    color: #856404;
  }

  &.info {
    background-color: #d1ecf1;
    border-left: 4px solid #17a2b8;
    color: #0c5460;
  }

  .toast-content {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 0.75rem;

    .toast-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      color: inherit;
      opacity: 0.7;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 1;
      }
    }
  }
}

// Transition animations
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-enter-to,
.toast-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
