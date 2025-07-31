<template>
  <app-card hoverable class="robot-card" @click="$emit('click', robot)">
    <div class="robot-card__content">
      <div class="robot-card__header">
        <div class="robot-card__icon">
          <img v-if="robot.icon" :src="robot.icon" :alt="robot.name" />
          <div v-else class="robot-card__icon-placeholder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" />
              <line x1="16" y1="16" x2="16" y2="16" />
            </svg>
          </div>
        </div>
        <div class="robot-card__status" :class="`robot-card__status--${robot.connection_status}`">
          <span class="status-indicator"></span>
        </div>
      </div>
      <div class="robot-card__body">
        <h3 class="robot-card__name">{{ robot.name }}</h3>
        <div class="robot-card__type">{{ typeText }}</div>
      </div>
      <div class="robot-card__footer">
        <div class="robot-card__last-connected" v-if="robot.lastConnected">
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{{ formatLastSeen }}</span>
        </div>
        <div class="robot-card__actions">
          <button class="action-button" @click.stop="$emit('view', robot)">
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
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>View</span>
          </button>
          <button class="action-button" @click.stop="$emit('manage', robot)">
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Manage</span>
          </button>
        </div>
      </div>
    </div>
  </app-card>
</template>

<script>
import AppCard from '../common/AppCard.vue';

export default {
  name: 'RobotCard',
  components: {
    AppCard
  },
  props: {
    robot: {
      type: Object,
      required: true
    }
  },
  computed: {
    typeText() {
      const typeMap = {
        mobile: 'Mobile Robot',
        arm: 'Robotic Arm',
        'mobile-arm': 'Mobile Robotic Arm'
      };
      return typeMap[this.robot.type] || 'Robot';
    },
    formatLastSeen() {
      if (!this.robot.last_seen) return 'Never connected';

      const date = new Date(this.robot.last_seen);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      return date.toLocaleDateString();
    }
  }
};
</script>

<style lang="scss" scoped>
.robot-card {
  width: 100%;
  transition: all 0.3s ease;

  &__content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  &__icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &-placeholder {
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    font-size: 0.8rem;

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    .status-text {
      font-weight: 500;
    }

    &--online {
      color: var(--success-color, #10b981);

      .status-indicator {
        background-color: var(--success-color, #10b981);
        box-shadow: 0 0 8px var(--success-color, #10b981);
        animation: pulse 2s infinite;
      }
    }

    &--offline {
      color: var(--error-color, #ef4444);

      .status-indicator {
        background-color: var(--error-color, #ef4444);
      }
    }

    &--maintenance {
      color: var(--warning-color, #f59e0b);

      .status-indicator {
        background-color: var(--warning-color, #f59e0b);
      }
    }
  }

  &__body {
    flex: 1;
  }

  &__name {
    font-size: 1.2rem;
    margin-bottom: 0.25rem;
    color: var(--text-primary);
  }

  &__type {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: auto;
  }

  &__last-connected {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    color: var(--text-secondary);

    svg {
      margin-right: 0.5rem;
    }
  }

  &__actions {
    display: flex;
    gap: 0.5rem;

    .action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 0.75rem;
      background: var(--bg-secondary);
      border-radius: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-primary);
      transition: all 0.2s ease;

      svg {
        margin-right: 0.25rem;
      }

      &:hover {
        background: var(--accent-primary);
        color: white;
      }
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
