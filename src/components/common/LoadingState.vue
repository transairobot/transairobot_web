<template>
  <div class="loading-state" :class="`loading-state--${size}`">
    <div class="loading-spinner" :class="`loading-spinner--${variant}`">
      <div v-if="variant === 'futuristic'" class="spinner-futuristic">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
      <div v-else-if="variant === 'dots'" class="spinner-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <div v-else class="spinner-ring"></div>
    </div>
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
    },
    variant: {
      type: String,
      default: 'ring',
      validator: value => ['ring', 'futuristic', 'dots'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
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

  &--small {
    padding: 1rem;

    .spinner-ring {
      width: 30px;
      height: 30px;
      border-width: 3px;
    }

    .spinner-futuristic .circle {
      width: 10px;
      height: 10px;
    }

    .spinner-dots .dot {
      width: 8px;
      height: 8px;
      margin: 0 3px;
    }

    .loading-message {
      font-size: 0.8rem;
    }
  }

  &--medium {
    .spinner-ring {
      width: 50px;
      height: 50px;
      border-width: 4px;
    }

    .spinner-futuristic .circle {
      width: 15px;
      height: 15px;
    }

    .spinner-dots .dot {
      width: 12px;
      height: 12px;
      margin: 0 4px;
    }
  }

  &--large {
    padding: 3rem;

    .spinner-ring {
      width: 70px;
      height: 70px;
      border-width: 5px;
    }

    .spinner-futuristic .circle {
      width: 20px;
      height: 20px;
    }

    .spinner-dots .dot {
      width: 16px;
      height: 16px;
      margin: 0 5px;
    }

    .loading-message {
      font-size: 1.1rem;
    }
  }

  .loading-spinner {
    margin-bottom: 1.5rem;

    &--futuristic {
      .spinner-ring {
        border-color: transparent;
        border-top-color: transparent;
        border-bottom-color: var(--accent-secondary);
        border-left-color: var(--accent-primary);
        border-right-color: var(--accent-primary);
        box-shadow: 0 0 15px rgba(var(--accent-primary-rgb), 0.5);
      }
    }
  }

  .spinner-ring {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 4px solid rgba(var(--accent-primary-rgb), 0.2);
    border-radius: 50%;
    border-top-color: var(--accent-primary);
    animation: spin 1s ease-in-out infinite;
  }

  .spinner-futuristic {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 60px;
    height: 60px;

    .circle {
      position: absolute;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: var(--accent-primary);
      animation: orbit 1.5s ease-in-out infinite;

      &-1 {
        animation-delay: 0s;
      }

      &-2 {
        animation-delay: 0.5s;
      }

      &-3 {
        animation-delay: 1s;
      }
    }
  }

  .spinner-dots {
    display: flex;
    align-items: center;
    justify-content: center;

    .dot {
      width: 12px;
      height: 12px;
      margin: 0 4px;
      border-radius: 50%;
      background: var(--accent-primary);
      animation: pulse 1.5s ease-in-out infinite;

      &:nth-child(1) {
        animation-delay: 0s;
      }

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }

  .loading-message {
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-align: center;
    max-width: 300px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes orbit {
  0% {
    transform: rotate(0deg) translateX(20px) rotate(0deg);
    opacity: 0.8;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: rotate(360deg) translateX(20px) rotate(-360deg);
    opacity: 0.8;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
