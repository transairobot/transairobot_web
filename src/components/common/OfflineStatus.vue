<template>
  <div v-if="!isOnline" class="offline-notification">
    <div class="offline-content">
      <svg
        class="offline-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
        <line x1="12" y1="20" x2="12.01" y2="20"></line>
      </svg>
      <span>You are currently offline. Some features may be unavailable.</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OfflineStatus',
  data() {
    return {
      isOnline: navigator.onLine
    };
  },
  mounted() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
    }
  }
};
</script>

<style lang="scss" scoped>
.offline-notification {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--bg-primary);
  padding: 10px 20px;
  z-index: 1000;
  display: flex;
  justify-content: center;
  animation: slideUp 0.3s ease-out;
}

.offline-content {
  display: flex;
  align-items: center;
  max-width: 600px;
}

.offline-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  flex-shrink: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
