<template>
  <transition name="toast">
    <div v-if="show" class="app-toast" :class="[`toast-${type}`]">
      <div class="toast-content">
        <span class="toast-icon">
          <i :class="iconClass"></i>
        </span>
        <span class="toast-message">{{ message }}</span>
      </div>
      <button class="toast-close" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </transition>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'AppToast',
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
    show: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  emits: ['close'],
  setup(props) {
    const iconClass = computed(() => {
      switch (props.type) {
        case 'success':
          return 'fas fa-check-circle';
        case 'error':
          return 'fas fa-exclamation-circle';
        case 'warning':
          return 'fas fa-exclamation-triangle';
        case 'info':
        default:
          return 'fas fa-info-circle';
      }
    });

    return {
      iconClass
    };
  }
};
</script>

<style lang="scss" scoped>
.app-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  min-width: 300px;
  max-width: 400px;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;

  &.toast-success {
    background-color: var(--success-bg, #e6f7e6);
    color: var(--success-color, #2e7d32);
  }

  &.toast-error {
    background-color: var(--error-bg, #fde8e8);
    color: var(--error-color, #d32f2f);
  }

  &.toast-warning {
    background-color: var(--warning-bg, #fff8e6);
    color: var(--warning-color, #ed6c02);
  }

  &.toast-info {
    background-color: var(--info-bg, #e6f4ff);
    color: var(--info-color, #0288d1);
  }

  .toast-content {
    display: flex;
    align-items: center;
    flex: 1;

    .toast-icon {
      margin-right: 0.75rem;
      font-size: 1.25rem;
    }

    .toast-message {
      font-size: 0.9rem;
    }
  }

  .toast-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0.25rem;
    margin-left: 0.5rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
