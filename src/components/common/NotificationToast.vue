<template>
  <transition name="toast">
    <div v-if="visible" class="notification-toast" :class="type">
      <div class="toast-content">
        <span class="message">{{ message }}</span>
        <button class="close-btn" @click="close">×</button>
      </div>
    </div>
  </transition>
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
      validator: value => ['info', 'success', 'warning', 'error'].includes(value)
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      visible: true,
      timeout: null
    };
  },
  mounted() {
    this.startTimer();
  },
  beforeUnmount() {
    this.clearTimer();
  },
  methods: {
    startTimer() {
      if (this.duration > 0) {
        this.timeout = setTimeout(() => {
          this.close();
        }, this.duration);
      }
    },
    clearTimer() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    },
    close() {
      this.visible = false;
      this.clearTimer();
      this.$emit('close');
    }
  }
};
</script>

<style lang="scss" scoped>
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 300px;
  max-width: 450px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &.info {
    background-color: #2196f3;
    color: white;
  }

  &.success {
    background-color: #4caf50;
    color: white;
  }

  &.warning {
    background-color: #ff9800;
    color: white;
  }

  &.error {
    background-color: #f44336;
    color: white;
  }

  .toast-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .message {
      flex: 1;
      margin-right: 12px;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter,
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
