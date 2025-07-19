<template>
  <div class="error-state">
    <div class="error-icon">
      <i class="fas fa-exclamation-circle"></i>
    </div>
    <p class="error-message">{{ message }}</p>
    <button v-if="showRetry" @click="$emit('retry')" class="retry-button">Try Again</button>
  </div>
</template>

<script>
export default {
  name: 'ErrorState',
  props: {
    message: {
      type: String,
      default: 'Something went wrong'
    },
    showRetry: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style lang="scss" scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;

  .error-icon {
    font-size: 2.5rem;
    color: var(--danger);
    margin-bottom: 1rem;
  }

  .error-message {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .retry-button {
    padding: 0.5rem 1.5rem;
    background-color: var(--accent-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--accent-primary-dark);
    }
  }
}
</style>
