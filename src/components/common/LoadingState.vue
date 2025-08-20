<template>
  <div class="loading-state">
    <div class="loading-spinner"></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingState',
  props: {
    message: {
      type: String,
      default: 'Loading...'
    }
  }
};
</script>

<style lang="scss" scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(var(--accent-primary-rgb), 0.2);
    border-radius: 50%;
    border-top-color: var(--accent-primary);
    animation: spin 1s linear infinite;
  }

  .loading-message {
    margin-top: 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
