<template>
  <div class="error-state" :class="`error-state--${variant}`">
    <div class="error-icon" :class="{ 'animate-pulse': animated }">
      <svg
        v-if="variant === 'default'"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <svg
        v-else-if="variant === 'warning'"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        ></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <svg
        v-else-if="variant === 'critical'"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <svg
        v-else-if="variant === 'network'"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
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
    </div>
    <h3 class="error-title">{{ title }}</h3>
    <p class="error-message">{{ message }}</p>
    <div class="error-details" v-if="details">
      <button class="details-toggle" @click="toggleDetails">
        {{ showDetails ? 'Hide Details' : 'Show Details' }}
      </button>
      <div class="details-content" v-if="showDetails">
        <pre>{{ details }}</pre>
      </div>
    </div>
    <div class="error-actions">
      <app-button v-if="showRetry" @click="$emit('retry')" variant="primary" class="retry-button">
        <span class="retry-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M23 4v6h-6"></path>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </span>
        Retry
      </app-button>
      <app-button v-if="showHome" @click="$emit('home')" variant="outline" class="home-button">
        Go Home
      </app-button>
    </div>
  </div>
</template>

<script>
import AppButton from './AppButton.vue';
import { ref } from 'vue';

export default {
  name: 'ErrorState',
  components: {
    AppButton
  },
  props: {
    title: {
      type: String,
      default: 'Something went wrong'
    },
    message: {
      type: String,
      default: 'An error occurred while processing your request. Please try again.'
    },
    details: {
      type: String,
      default: ''
    },
    showRetry: {
      type: Boolean,
      default: true
    },
    showHome: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'default',
      validator: value => ['default', 'warning', 'critical', 'network'].includes(value)
    },
    animated: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const showDetails = ref(false);

    const toggleDetails = () => {
      showDetails.value = !showDetails.value;
    };

    return {
      showDetails,
      toggleDetails
    };
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
  animation: fadeIn 0.5s ease-in-out;

  .error-icon {
    margin-bottom: 1.5rem;
    color: var(--error-color);

    &.animate-pulse {
      animation: pulse 2s infinite;
    }
  }

  &--warning .error-icon {
    color: var(--warning-color, #f59e0b);
  }

  &--critical .error-icon {
    color: var(--error-color, #ef4444);
  }

  &--network .error-icon {
    color: var(--info-color, #3b82f6);
  }

  .error-title {
    margin-bottom: 0.75rem;
    color: var(--text-primary);
    font-size: 1.5rem;
  }

  .error-message {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
    max-width: 400px;
    line-height: 1.6;
  }

  .error-details {
    width: 100%;
    max-width: 500px;
    margin-bottom: 1.5rem;

    .details-toggle {
      background: none;
      border: none;
      color: var(--accent-primary);
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0.5rem;
      transition: color 0.3s ease;

      &:hover {
        color: var(--accent-secondary);
        text-decoration: underline;
      }
    }

    .details-content {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 0.5rem;
      text-align: left;
      overflow-x: auto;

      pre {
        margin: 0;
        font-family: monospace;
        font-size: 0.85rem;
        color: var(--text-secondary);
        white-space: pre-wrap;
      }
    }
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;

    .retry-button {
      display: flex;
      align-items: center;

      .retry-icon {
        margin-right: 0.5rem;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
