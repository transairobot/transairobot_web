<template>
  <div class="robot-list">
    <div class="robot-list__header">
      <h2 class="robot-list__title">{{ title }}</h2>
      <div class="robot-list__filters" v-if="showFilters">
        <div class="filter-group">
          <label for="status-filter">Status:</label>
          <select id="status-filter" v-model="statusFilter">
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="type-filter">Type:</label>
          <select id="type-filter" v-model="typeFilter">
            <option value="all">All</option>
            <option value="mobile">Mobile</option>
            <option value="arm">Arm</option>
            <option value="mobile-arm">Mobile Arm</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="robot-list__loading">
      <loading-state variant="futuristic" message="Loading your robots..." />
    </div>

    <div v-else-if="error" class="robot-list__error">
      <error-state
        title="Failed to load robots"
        :message="error"
        variant="network"
        @retry="$emit('retry')"
      />
    </div>

    <div v-else-if="filteredRobots.length === 0" class="robot-list__empty">
      <div class="empty-state">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" />
          <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
        <h3>No robots found</h3>
        <p v-if="isFiltered">Try adjusting your filters or add a new robot.</p>
        <p v-else>You don't have any robots yet. Add your first robot to get started.</p>
        <button class="add-robot-button" @click="$emit('add')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Robot
        </button>
      </div>
    </div>

    <div v-else class="robot-list__grid">
      <robot-card
        v-for="robot in filteredRobots"
        :key="robot.id"
        :robot="robot"
        @click="$emit('select', robot)"
        @view="$emit('view', robot)"
        @manage="$emit('manage', robot)"
      />
    </div>

    <div class="robot-list__actions" v-if="filteredRobots.length > 0">
      <button class="add-robot-button" @click="$emit('add')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Robot
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import RobotCard from './RobotCard.vue';
import LoadingState from '../common/LoadingState.vue';
import ErrorState from '../common/ErrorState.vue';

export default {
  name: 'RobotList',
  components: {
    RobotCard,
    LoadingState,
    ErrorState
  },
  props: {
    robots: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'My Robots'
    },
    showFilters: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const statusFilter = ref('all');
    const typeFilter = ref('all');

    const filteredRobots = computed(() => {
      return props.robots.filter(robot => {
        const statusMatch = statusFilter.value === 'all' || robot.status === statusFilter.value;
        const typeMatch = typeFilter.value === 'all' || robot.type === typeFilter.value;
        return statusMatch && typeMatch;
      });
    });

    const isFiltered = computed(() => {
      return statusFilter.value !== 'all' || typeFilter.value !== 'all';
    });

    return {
      statusFilter,
      typeFilter,
      filteredRobots,
      isFiltered
    };
  }
};
</script>

<style lang="scss" scoped>
.robot-list {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__title {
    margin-bottom: 0;
  }

  &__filters {
    display: flex;
    gap: 1rem;

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      label {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      select {
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: 1px solid var(--divider);
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
      }
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  &__loading,
  &__error,
  &__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  &__actions {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem;

    svg {
      color: var(--text-secondary);
      margin-bottom: 1rem;
      opacity: 0.7;
    }

    h3 {
      margin-bottom: 0.5rem;
    }

    p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      max-width: 300px;
    }
  }

  .add-robot-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background: var(--accent-primary);
    color: white;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s ease;

    svg {
      margin-right: 0.5rem;
    }

    &:hover {
      background: var(--accent-secondary);
      transform: translateY(-2px);
    }
  }
}
</style>
