<template>
  <AppModal v-model="showModal" title="Install Application" @close="handleClose">
    <div class="installation-modal">
      <!-- Step 1: Select Robot -->
      <div v-if="currentStep === 'select-robot'" class="installation-step">
        <h4 class="step-title">Select Robot</h4>
        <p class="step-description">
          Choose a robot to install "{{ app ? app.name : 'this application' }}" on:
        </p>

        <div v-if="loadingRobots" class="loading-container">
          <LoadingState message="Loading your robots..." variant="futuristic" size="small" />
        </div>

        <div v-else-if="robotsError" class="error-container">
          <ErrorState
            title="Couldn't load robots"
            :message="robotsError"
            variant="network"
            @retry="fetchUserRobots"
          />
        </div>

        <div v-else-if="robots.length === 0" class="empty-state">
          <p>You don't have any robots yet. Add a robot first to install applications.</p>
        </div>

        <div v-else class="robot-selection">
          <div
            v-for="robot in robots"
            :key="robot.id"
            class="robot-option"
            :class="{ selected: selectedRobot && selectedRobot.id === robot.id }"
            @click="selectRobot(robot)"
          >
            <div class="robot-icon">
              <img :src="robot.icon" :alt="robot.name" />
            </div>
            <div class="robot-info">
              <h5 class="robot-name">{{ robot.name }}</h5>
              <div class="robot-status" :class="robot.status">{{ robot.status }}</div>
            </div>
            <div class="robot-select-indicator">
              <svg
                v-if="selectedRobot && selectedRobot.id === robot.id"
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
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Installation Progress -->
      <div v-else-if="currentStep === 'installing'" class="installation-step">
        <div class="installation-progress">
          <LoadingState message="Installing application..." variant="futuristic" size="medium" />

          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${installProgress}%` }"></div>
            </div>
            <div class="progress-text">{{ installProgress }}%</div>
          </div>

          <div class="progress-status">
            <p>{{ progressStatus }}</p>
          </div>
        </div>
      </div>

      <!-- Step 3: Installation Result -->
      <div v-else-if="currentStep === 'result'" class="installation-step">
        <div v-if="installationSuccess" class="installation-success">
          <div class="success-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h4 class="result-title">Installation Successful!</h4>
          <p class="result-message">
            {{ app ? app.name : 'Application' }} has been successfully installed on
            {{ selectedRobot ? selectedRobot.name : 'your robot' }}.
          </p>
        </div>

        <div v-else class="installation-error">
          <ErrorState
            title="Installation Failed"
            :message="
              installationError ||
              'There was an error installing the application. Please try again.'
            "
            variant="critical"
            :show-retry="true"
            @retry="retryInstallation"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <button v-if="currentStep === 'select-robot'" class="btn-secondary" @click="handleClose">
        Cancel
      </button>
      <button
        v-if="currentStep === 'select-robot'"
        class="btn-primary"
        :disabled="!selectedRobot || loadingRobots"
        @click="startInstallation"
      >
        Install
      </button>

      <button v-if="currentStep === 'installing'" class="btn-secondary" @click="cancelInstallation">
        Cancel
      </button>

      <button
        v-if="currentStep === 'result' && installationSuccess"
        class="btn-primary"
        @click="viewRobot"
      >
        View Robot
      </button>
      <button v-if="currentStep === 'result'" class="btn-secondary" @click="handleClose">
        Close
      </button>
    </template>
  </AppModal>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import AppModal from '../common/AppModal.vue';
import LoadingState from '../common/LoadingState.vue';
import ErrorState from '../common/ErrorState.vue';

export default {
  name: 'InstallationModal',
  components: {
    AppModal,
    LoadingState,
    ErrorState
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    app: {
      type: Object,
      default: null
    },
    preSelectedRobotId: {
      type: String,
      default: null
    }
  },
  emits: ['update:show', 'installation-complete'],
  setup(props, { emit }) {
    const store = useStore();
    const router = useRouter();

    const showModal = computed({
      get: () => props.show,
      set: value => emit('update:show', value)
    });

    // Robot selection
    const robots = ref([]);
    const loadingRobots = ref(false);
    const robotsError = ref('');
    const selectedRobot = ref(null);

    // Installation state
    const currentStep = ref('select-robot');
    const installProgress = ref(0);
    const progressStatus = ref('Preparing installation...');
    const installationSuccess = ref(false);
    const installationError = ref('');
    const installationCancelled = ref(false);

    // Fetch user's robots
    const fetchUserRobots = async () => {
      loadingRobots.value = true;
      robotsError.value = '';

      try {
        await store.dispatch('robots/fetchRobots');
        robots.value = store.getters['robots/allRobots'];

        // If a robot ID was pre-selected, select it
        if (props.preSelectedRobotId) {
          const preSelectedRobot = robots.value.find(
            robot => robot.id === props.preSelectedRobotId
          );
          if (preSelectedRobot) {
            selectedRobot.value = preSelectedRobot;
          }
        }
      } catch (error) {
        console.error('Failed to fetch robots:', error);
        robotsError.value = 'Could not load your robots. Please try again.';
      } finally {
        loadingRobots.value = false;
      }
    };

    const selectRobot = robot => {
      selectedRobot.value = robot;
    };

    // Installation process
    const startInstallation = () => {
      if (!selectedRobot.value || !props.app) return;

      currentStep.value = 'installing';
      installProgress.value = 0;
      progressStatus.value = 'Preparing installation...';
      installationCancelled.value = false;

      // Simulate installation progress
      const progressInterval = setInterval(() => {
        if (installationCancelled.value) {
          clearInterval(progressInterval);
          return;
        }

        if (installProgress.value < 100) {
          installProgress.value += 10;

          if (installProgress.value <= 20) {
            progressStatus.value = 'Downloading application...';
          } else if (installProgress.value <= 50) {
            progressStatus.value = 'Verifying package...';
          } else if (installProgress.value <= 80) {
            progressStatus.value = 'Installing on robot...';
          } else {
            progressStatus.value = 'Finalizing installation...';
          }
        } else {
          clearInterval(progressInterval);
          completeInstallation();
        }
      }, 500);

      // Actual API call would happen here
      store
        .dispatch('robots/installApp', {
          robotId: selectedRobot.value.id,
          appId: props.app.id
        })
        .catch(error => {
          clearInterval(progressInterval);
          handleInstallationError(error);
        });
    };

    const completeInstallation = () => {
      currentStep.value = 'result';
      installationSuccess.value = true;
      emit('installation-complete', {
        success: true,
        robotId: selectedRobot.value.id,
        appId: props.app.id
      });
    };

    const handleInstallationError = error => {
      currentStep.value = 'result';
      installationSuccess.value = false;
      installationError.value =
        error.message || 'Failed to install the application. Please try again.';
      emit('installation-complete', {
        success: false,
        error: installationError.value
      });
    };

    const cancelInstallation = () => {
      installationCancelled.value = true;
      handleClose();
    };

    const retryInstallation = () => {
      currentStep.value = 'select-robot';
      installationError.value = '';
    };

    const viewRobot = () => {
      if (selectedRobot.value) {
        router.push(`/robot/${selectedRobot.value.id}`);
        showModal.value = false;
      }
    };

    const handleClose = () => {
      showModal.value = false;

      // Reset state after animation completes
      setTimeout(() => {
        currentStep.value = 'select-robot';
        selectedRobot.value = null;
        installProgress.value = 0;
        progressStatus.value = 'Preparing installation...';
        installationSuccess.value = false;
        installationError.value = '';
      }, 300);
    };

    // Watch for modal opening
    watch(
      () => showModal.value,
      newVal => {
        if (newVal) {
          fetchUserRobots();
        }
      }
    );

    return {
      showModal,
      robots,
      loadingRobots,
      robotsError,
      selectedRobot,
      currentStep,
      installProgress,
      progressStatus,
      installationSuccess,
      installationError,
      fetchUserRobots,
      selectRobot,
      startInstallation,
      cancelInstallation,
      retryInstallation,
      viewRobot,
      handleClose
    };
  }
};
</script>

<style lang="scss" scoped>
.installation-modal {
  min-height: 300px;
}

.installation-step {
  animation: fade-in 0.3s ease-out;
}

.step-title {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.step-description {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.loading-container,
.error-container,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.empty-state {
  text-align: center;
  color: var(--text-tertiary);
}

.robot-selection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.robot-option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bg-secondary);
  }

  &.selected {
    border-color: var(--accent-primary);
    background-color: rgba(var(--accent-primary-rgb), 0.05);
  }
}

.robot-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.robot-info {
  flex: 1;
}

.robot-name {
  margin: 0 0 0.25rem;
  color: var(--text-primary);
}

.robot-status {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;

  &.online {
    background-color: #4caf50;
    color: white;
  }

  &.offline {
    background-color: #f44336;
    color: white;
  }

  &.maintenance {
    background-color: #ff9800;
    color: white;
  }
}

.robot-select-indicator {
  color: var(--accent-primary);
}

.installation-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.progress-container {
  width: 100%;
  margin: 1.5rem 0;
}

.progress-bar {
  height: 8px;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: right;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.progress-status {
  text-align: center;
  color: var(--text-secondary);
}

.installation-success,
.installation-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  text-align: center;
}

.success-icon {
  color: #4caf50;
  margin-bottom: 1.5rem;
  animation: scale-in 0.5s ease-out;
}

.result-title {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.result-message {
  color: var(--text-secondary);
  max-width: 400px;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background-color: var(--accent-primary-dark, #1a7fd1);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>
