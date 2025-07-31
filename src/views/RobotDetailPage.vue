<template>
  <div class="robot-detail-page">
    <AppHeader />
    <main class="container">
      <div v-if="loading" class="loading-state">
        <LoadingState variant="futuristic" message="Loading robot details..." />
      </div>
      <div v-else-if="error" class="error-state">
        <ErrorState
          title="Failed to load robot details"
          :message="error"
          variant="network"
          @retry="fetchRobotDetails"
        />
      </div>
      <div v-else-if="robot" class="robot-details-content">
        <!-- Back button -->
        <div class="back-navigation">
          <button class="back-button" @click="goBack">
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
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to My Robots
          </button>
        </div>

        <!-- Robot Information Section -->
        <div class="robot-info-section">
          <div class="robot-info-header">
            <div class="robot-avatar">
              <img :src="robot.icon" :alt="robot.name" />
              <div class="robot-status-indicator" :class="robot.status"></div>
            </div>
            <div class="robot-header-text">
              <h1>{{ robot.name }}</h1>
              <div class="robot-meta">
                <p class="robot-type">{{ formatRobotType }}</p>
                <div class="robot-status" :class="robot.status">
                  {{ formatRobotStatus }}
                </div>
              </div>
              <div class="robot-last-connected" v-if="robot.lastConnected">
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Last connected {{ formatLastSeen }}
              </div>
            </div>
          </div>

          <div class="robot-details-grid">
            <div class="robot-detail-card">
              <h3>Robot Information</h3>
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">{{ robot.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">{{ formatRobotType }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value status-badge" :class="robot.status">{{
                  formatRobotStatus
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Connected:</span>
                <span class="detail-value">{{ formatLastSeen }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Applications:</span>
                <span class="detail-value"
                  >{{ robot.installedApps ? robot.installedApps.length : 0 }} installed</span
                >
              </div>
            </div>

            <div class="robot-detail-card">
              <h3>System Health</h3>
              <div class="health-metrics">
                <div class="metric">
                  <div class="metric-value">98%</div>
                  <div class="metric-label">Battery</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 98%"></div>
                  </div>
                </div>
                <div class="metric">
                  <div class="metric-value">23%</div>
                  <div class="metric-label">CPU Usage</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 23%"></div>
                  </div>
                </div>
                <div class="metric">
                  <div class="metric-value">45%</div>
                  <div class="metric-label">Memory</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 45%"></div>
                  </div>
                </div>
                <div class="metric">
                  <div class="metric-value">12%</div>
                  <div class="metric-label">Storage</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 12%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="robot-actions">
            <AppButton variant="primary">
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
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Manage Robot
            </AppButton>
            <AppButton variant="secondary">
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              View Logs
            </AppButton>
            <AppButton variant="outline" @click="showInstallModal = true">
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Install App
            </AppButton>
          </div>
        </div>

        <!-- Installed Applications Section -->
        <div class="installed-apps-section">
          <div class="section-header">
            <h2>Installed Applications</h2>
            <div class="section-actions">
              <SearchBar
                placeholder="Search applications..."
                @search="searchApps"
                size="small"
                class="app-search"
              />
              <AppButton variant="outline" size="small" @click="showInstallModal = true">
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
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Install New
              </AppButton>
            </div>
          </div>

          <RobotAppList
            :apps="filteredApps"
            @uninstall="uninstallApp"
            @update="updateApp"
            @view-details="viewAppDetails"
            @install-app="showInstallModal = true"
          />
        </div>
      </div>
    </main>
    <AppFooter />

    <!-- Installation Modal -->
    <InstallationModal
      v-model:show="showInstallModal"
      :pre-selected-robot-id="robotId"
      @installation-complete="handleInstallationComplete"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import RobotAppList from '../components/robots/RobotAppList.vue';
import InstallationModal from '../components/robots/InstallationModal.vue';
import LoadingState from '../components/common/LoadingState.vue';
import ErrorState from '../components/common/ErrorState.vue';
import AppButton from '../components/common/AppButton.vue';
import SearchBar from '../components/common/SearchBar.vue';

export default {
  name: 'RobotDetailPage',
  components: {
    AppHeader,
    AppFooter,
    RobotAppList,
    InstallationModal,
    LoadingState,
    ErrorState,
    AppButton,
    SearchBar
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const robotId = route.params.id;

    const robot = computed(() => store.getters['robots/getRobotById'](robotId));
    const loading = ref(false);
    const error = ref('');
    const showInstallModal = ref(false);
    const searchQuery = ref('');

    // Format robot type for display
    const formatRobotType = computed(() => {
      if (!robot.value) return '';

      const typeMap = {
        mobile: 'Mobile Robot',
        arm: 'Robotic Arm',
        'mobile-arm': 'Mobile Robotic Arm'
      };

      return typeMap[robot.value.type] || 'Robot';
    });

    // Format robot status for display
    const formatRobotStatus = computed(() => {
      if (!robot.value) return '';

      const statusMap = {
        online: 'Online',
        offline: 'Offline',
        maintenance: 'Maintenance'
      };
      console.log('robot=' + robot.value.toString());
      return statusMap[robot.value.connection_status] || 'Unknown';
    });

    // Format last connected time
    const formatLastSeen = computed(() => {
      if (!robot.value || !robot.value.last_seen) return 'Never';

      const date = new Date(robot.value.last_seen * 1000);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      return date.toLocaleDateString();
    });

    // Filter apps based on search query
    const filteredApps = computed(() => {
      if (!robot.value || !robot.value.installedApps) return [];
      if (!searchQuery.value) return robot.value.installedApps;

      const query = searchQuery.value.toLowerCase();
      return robot.value.installedApps.filter(
        app =>
          app.name.toLowerCase().includes(query) ||
          (app.description && app.description.toLowerCase().includes(query))
      );
    });

    const fetchRobotDetails = async () => {
      loading.value = true;
      error.value = '';
      try {
        await store.dispatch('robots/fetchRobotById', robotId);
      } catch (err) {
        error.value = 'Failed to load robot details. Please check your connection and try again.';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const uninstallApp = appId => {
      store
        .dispatch('robots/uninstallApp', { robotId, appId })
        .then(() => {
          console.log(`Successfully uninstalled app ${appId}`);
          // You could show a toast notification here
        })
        .catch(error => {
          console.error(`Failed to uninstall app: ${error}`);
          // You could show an error notification here
        });
    };

    const updateApp = appId => {
      store
        .dispatch('robots/updateApp', { robotId, appId })
        .then(() => {
          console.log(`Successfully updated app ${appId}`);
          // You could show a toast notification here
        })
        .catch(error => {
          console.error(`Failed to update app: ${error}`);
          // You could show an error notification here
        });
    };

    const viewAppDetails = appId => {
      router.push(`/app/${appId}`);
    };

    const handleInstallationComplete = result => {
      if (result.success) {
        // You could show a toast notification here
        console.log(`Successfully installed app on robot ${robotId}`);
        // Refresh robot details to show the newly installed app
        fetchRobotDetails();
      } else {
        console.error('Installation failed:', result.error);
      }
    };

    const searchApps = query => {
      searchQuery.value = query;
    };

    const goBack = () => {
      router.push('/my-robots');
    };

    onMounted(() => {
      if (!robot.value) {
        fetchRobotDetails();
      }
    });

    return {
      robot,
      robotId,
      loading,
      error,
      fetchRobotDetails,
      uninstallApp,
      updateApp,
      viewAppDetails,
      showInstallModal,
      handleInstallationComplete,
      formatRobotType,
      formatRobotStatus,
      formatLastSeen,
      searchApps,
      filteredApps,
      goBack
    };
  }
};
</script>

<style lang="scss" scoped>
.robot-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: 2rem 0;
  }

  .loading-state,
  .error-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  .back-navigation {
    margin-bottom: 1.5rem;

    .back-button {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        margin-right: 0.5rem;
      }

      &:hover {
        color: var(--accent-primary);
        transform: translateX(-3px);
      }
    }
  }

  .robot-info-section {
    margin-bottom: 3rem;
  }

  .robot-info-header {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    position: relative;
  }

  .robot-avatar {
    position: relative;
    margin-right: 1.5rem;

    img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--bg-secondary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .robot-status-indicator {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid var(--bg-primary);

      &.online {
        background-color: #4caf50;
        box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
        animation: pulse 2s infinite;
      }

      &.offline {
        background-color: #f44336;
      }

      &.maintenance {
        background-color: #ff9800;
      }
    }
  }

  .robot-header-text {
    h1 {
      margin: 0 0 0.5rem;
      font-size: 2rem;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .robot-meta {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .robot-type {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
  }

  .robot-status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: bold;
    font-size: 0.85rem;

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

  .robot-last-connected {
    display: flex;
    align-items: center;
    color: var(--text-tertiary);
    font-size: 0.85rem;

    svg {
      margin-right: 0.5rem;
    }
  }

  .robot-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .robot-detail-card {
    background-color: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.2rem;
      color: var(--text-primary);
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--divider);

      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
    }

    .detail-label {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .detail-value {
      color: var(--text-primary);
      font-weight: 500;
    }

    .status-badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: bold;

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
  }

  .health-metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;

    .metric {
      margin-bottom: 1rem;

      .metric-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--text-primary);
      }

      .metric-label {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
      }

      .progress-bar {
        height: 6px;
        background-color: var(--bg-tertiary);
        border-radius: 3px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 3px;
        }
      }
    }
  }

  .robot-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;

    :deep(.app-button) {
      display: flex;
      align-items: center;

      svg {
        margin-right: 0.5rem;
      }
    }
  }

  .installed-apps-section {
    margin-top: 3rem;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;

      h2 {
        margin: 0;
      }

      .section-actions {
        display: flex;
        align-items: center;
        gap: 1rem;

        .app-search {
          width: 250px;
        }

        @media (max-width: 768px) {
          width: 100%;

          .app-search {
            flex: 1;
          }
        }
      }

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
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

@media (max-width: 768px) {
  .robot-detail-page {
    .robot-info-header {
      flex-direction: column;
      align-items: flex-start;

      .robot-avatar {
        margin-bottom: 1.5rem;
      }
    }

    .robot-details-grid {
      grid-template-columns: 1fr;
    }

    .health-metrics {
      grid-template-columns: 1fr;
    }
  }
}
</style>
