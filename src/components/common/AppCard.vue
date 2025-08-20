<template>
  <div :class="['app-card', `app-card--${variant}`, { 'app-card--hoverable': hoverable }]">
    <div class="app-card__content">
      <slot></slot>
    </div>
    <div class="app-card__shine"></div>
  </div>
</template>

<script>
export default {
  name: 'AppCard',
  props: {
    hoverable: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'default',
      validator: value => ['default', 'primary', 'secondary', 'outline'].includes(value)
    }
  }
};
</script>

<style lang="scss" scoped>
.app-card {
  background: var(--card-bg);
  border-radius: 0.75rem;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--card-border);
    transition: height 0.3s ease;
  }

  &__content {
    position: relative;
    z-index: 2;
  }

  &__shine {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
    pointer-events: none;
    z-index: 1;
  }

  &--primary {
    &::before {
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    }
  }

  &--secondary {
    &::before {
      background: var(--accent-secondary);
    }
  }

  &--outline {
    border: 1px solid var(--divider);

    &::before {
      background: transparent;
    }
  }

  &--hoverable {
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);

      &::before {
        height: 5px;
      }

      .app-card__shine {
        transform: translateX(100%);
      }
    }

    &:active {
      transform: translateY(-2px);
    }
  }
}
</style>
