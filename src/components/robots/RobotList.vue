<template>
  <div class="robot-list">
    <div class="robot-list__header">
      <h2 class="robot-list__title">{{ title }}</h2>
      <div class="robot-list__actions">
        <button class="add-robot-button" @click="openAddRobotModal">
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

    <app-modal v-model="isModalVisible" @close="isModalVisible = false" title="Add New Robot">
      <div class="add-robot-modal">
        <p>Enter the bind code provided by your robot to add it to your fleet.</p>
        <div class="form-group">
          <label for="bind-code">Bind Code</label>
          <input
            type="text"
            id="bind-code"
            v-model="bindCode"
            placeholder="e.g., ABCD-1234"
            :disabled="isAddingRobot"
          />
        </div>
        <div class="modal-actions">
          <app-button @click="isModalVisible = false" variant="secondary" :disabled="isAddingRobot">
            Cancel
          </app-button>
          <app-button @click="handleAddRobot" :loading="isAddingRobot" :disabled="!bindCode">
            Add Robot
          </app-button>
        </div>
      </div>
    </app-modal>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import RobotCard from './RobotCard.vue';
import LoadingState from '../common/LoadingState.vue';
import ErrorState from '../common/ErrorState.vue';
import AppModal from '../common/AppModal.vue';
import AppButton from '../common/AppButton.vue';
import robotManagementService from '../../services/robot-management.service';
import notificationService from '../../services/notification.service';

export default {
  name: 'RobotList',
  components: {
    RobotCard,
    LoadingState,
    ErrorState,
    AppModal,
    AppButton
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
  emits: ['retry', 'select', 'view', 'manage', 'robot-added'],
  setup(props, { emit }) {
    const statusFilter = ref('all');
    const typeFilter = ref('all');
    const isModalVisible = ref(false);
    const bindCode = ref('');
    const isAddingRobot = ref(false);

    const filteredRobots = computed(() => {
      return props.robots.filter(robot => {
        const statusMatch = statusFilter.value === 'all' || robot.status === statusFilter.value;
        const typeMatch =
          typeFilter.value === 'all' || (robot.type && robot.type === typeFilter.value);
        return statusMatch && typeMatch;
      });
    });

    const isFiltered = computed(() => {
      return statusFilter.value !== 'all' || typeFilter.value !== 'all';
    });

    const openAddRobotModal = () => {
      isModalVisible.value = true;
      bindCode.value = '';
    };

    const handleAddRobot = async () => {
      if (!bindCode.value.trim()) {
        notificationService.error('Please enter a bind code.');
        return;
      }
      isAddingRobot.value = true;
      try {
        const newRobot = await robotManagementService.addRobot(bindCode.value.trim());
        notificationService.success('Robot added successfully!');
        isModalVisible.value = false;
        emit('robot-added', newRobot);
      } catch (error) {
        notificationService.error('Failed to add robot. Please check the code and try again.');
        console.error('Error adding robot:', error);
      } finally {
        isAddingRobot.value = false;
      }
    };

    return {
      statusFilter,
      typeFilter,
      filteredRobots,
      isFiltered,
      isModalVisible,
      bindCode,
      isAddingRobot,
      openAddRobotModal,
      handleAddRobot
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

  &__actions {
    display: flex;
  }

  &__filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;

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
  }

  &__loading,
  &__error,
  &__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
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
    border: none;
    cursor: pointer;

    svg {
      margin-right: 0.5rem;
    }

    &:hover {
      background: var(--accent-secondary);
      transform: translateY(-2px);
    }
  }
}

.add-robot-modal {
  p {
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid var(--divider);
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
}
</style>
