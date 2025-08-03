<template>
  <div class="robot-app-list">
    <div v-if="!apps || apps.length === 0" class="empty-state">
      <p>No applications installed on this robot.</p>
      <button class="install-app-btn" @click="$emit('install-app')">Install an Application</button>
    </div>

    <div v-else class="app-grid">
      <div v-for="app in apps" :key="app.id" class="app-item">
        <div class="app-icon">
          <img :src="app.iconUrl" :alt="`${app.name} icon`" />
        </div>

        <div class="app-info">
          <h4 class="app-name">{{ app.name }}</h4>
          <div class="app-version">v{{ app.version }}</div>
        </div>

        <div class="app-actions">
          <button
            class="action-btn run-btn"
            @click="runApp(app.id)"
            title="Run Application"
            :disabled="runningApps.has(app.id)"
          >
            <svg
              v-if="!runningApps.has(app.id)"
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
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="loading-spinner"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56"></path>
            </svg>
          </button>

          <button
            class="action-btn view-btn"
            @click="$emit('view-details', app.id)"
            title="View Details"
          >
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
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>

          <button class="action-btn update-btn" @click="$emit('update', app.id)" title="Update">
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
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path>
            </svg>
          </button>

          <button class="action-btn uninstall-btn" @click="confirmUninstall(app)" title="Uninstall">
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
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <AppModal v-model="showConfirmDialog" title="Confirm Uninstallation" size="small">
      <div class="confirm-dialog">
        <p>
          Are you sure you want to uninstall
          <strong>{{ appToUninstall ? appToUninstall.name : '' }}</strong
          >?
        </p>
        <p class="warning">This action cannot be undone.</p>
      </div>

      <template #footer>
        <button class="btn-secondary" @click="showConfirmDialog = false">Cancel</button>
        <button class="btn-danger" @click="uninstallConfirmed">Uninstall</button>
      </template>
    </AppModal>

    <!-- Success Dialog -->
    <AppModal v-model="showSuccessDialog" title="Task Submitted" size="small">
      <div class="success-dialog">
        <div class="success-icon">
          <svg
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
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <p>已提交运行任务给Robot</p>
      </div>

      <template #footer>
        <button class="btn-primary" @click="showSuccessDialog = false">确定</button>
      </template>
    </AppModal>
  </div>
</template>

<script>
import { ref } from 'vue';
import AppModal from '../common/AppModal.vue';
import robotManagementService from '../../services/robot-management.service';

export default {
  name: 'RobotAppList',
  components: {
    AppModal
  },
  props: {
    apps: {
      type: Array,
      default: () => []
    },
    robotId: {
      type: String,
      required: true
    }
  },
  emits: ['uninstall', 'update', 'view-details', 'install-app', 'app-run', 'app-run-error'],
  setup(props, { emit }) {
    const showConfirmDialog = ref(false);
    const showSuccessDialog = ref(false);
    const appToUninstall = ref(null);
    const runningApps = ref(new Set());

    const confirmUninstall = app => {
      appToUninstall.value = app;
      showConfirmDialog.value = true;
    };

    const uninstallConfirmed = () => {
      if (appToUninstall.value) {
        emit('uninstall', appToUninstall.value.id);
        showConfirmDialog.value = false;
        appToUninstall.value = null;
      }
    };

    const runApp = async appId => {
      if (runningApps.value.has(appId)) return;

      runningApps.value.add(appId);

      try {
        await robotManagementService.runRobotApp(props.robotId, appId);
        emit('app-run', appId);
        showSuccessDialog.value = true;
      } catch (error) {
        console.error('Failed to run app:', error);
        // You could emit an error event or show a notification here
        emit('app-run-error', { appId, error });
      } finally {
        runningApps.value.delete(appId);
      }
    };

    return {
      showConfirmDialog,
      showSuccessDialog,
      appToUninstall,
      runningApps,
      confirmUninstall,
      uninstallConfirmed,
      runApp
    };
  }
};
</script>

<style lang="scss" scoped>
.robot-app-list {
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  color: var(--text-secondary);

  p {
    margin-bottom: 1rem;
  }

  .install-app-btn {
    padding: 0.75rem 1.5rem;
    background-color: var(--accent-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--accent-primary-dark, #1a7fd1);
      transform: translateY(-2px);
    }
  }
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.app-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--bg-secondary);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 1rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.app-info {
  flex: 1;
}

.app-name {
  margin: 0 0 0.25rem;
  color: var(--text-primary);
}

.app-version {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.app-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &.run-btn {
    background-color: var(--success-color, #22c55e);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--success-color-dark, #16a34a);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-spinner {
      animation: spin 1s linear infinite;
    }
  }

  &.view-btn {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);

    &:hover {
      background-color: var(--bg-quaternary);
      color: var(--text-primary);
    }
  }

  &.update-btn {
    background-color: var(--accent-primary);
    color: white;

    &:hover {
      background-color: var(--accent-primary-dark, #1a7fd1);
    }
  }

  &.uninstall-btn {
    background-color: var(--error-color, #ef4444);
    color: white;

    &:hover {
      background-color: var(--error-color-dark, #dc2626);
    }
  }
}

.confirm-dialog {
  text-align: center;
  padding: 1rem 0;

  .warning {
    color: var(--error-color, #ef4444);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
}

.btn-secondary,
.btn-danger,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);

  &:hover {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }
}

.btn-danger {
  background-color: var(--error-color, #ef4444);
  color: white;
  border: none;

  &:hover {
    background-color: var(--error-color-dark, #dc2626);
  }
}

.btn-primary {
  background-color: var(--accent-primary);
  color: white;
  border: none;

  &:hover {
    background-color: var(--accent-primary-dark, #1a7fd1);
  }
}

.success-dialog {
  text-align: center;
  padding: 1rem 0;

  .success-icon {
    color: var(--success-color, #22c55e);
    margin-bottom: 1rem;

    svg {
      width: 48px;
      height: 48px;
    }
  }

  p {
    font-size: 1rem;
    color: var(--text-primary);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
