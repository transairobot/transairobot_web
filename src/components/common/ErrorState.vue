<template>
  <div class="error-state">
    <div class="error-icon">
      <i class="fas fa-exclamation-circle"></i>
    </div>
    <h3 class="error-title">{{ title }}</h3>
    <p class="error-message">{{ message }}</p>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ErrorState',
  props: {
    title: {
      type: String,
      default: 'Error'
    },
    message: {
      type: String,
      default: 'Something went wrong. Please try again.'
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
    font-size: 3rem;
    color: var(--error-color);
    margin-bottom: 1rem;
  }

  .error-title {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  .error-message {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }
}
</style>
