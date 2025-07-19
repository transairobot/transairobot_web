<template>
  <div class="developer-dashboard">
    <div class="dashboard-tabs">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        Overview
      </div>
      <div class="tab-item" :class="{ active: activeTab === 'apps' }" @click="activeTab = 'apps'">
        Applications
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'settings' }"
        @click="activeTab = 'settings'"
      >
        Settings
      </div>
    </div>

    <div class="tab-content">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="overview-tab">
        <div class="welcome-section">
          <h2>Welcome to your Developer Dashboard</h2>
          <p>Manage your applications, track performance, and get insights about your users.</p>
        </div>

        <div class="quick-stats">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalApps }}</div>
            <div class="stat-label">Total Applications</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.publishedApps }}</div>
            <div class="stat-label">Published</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.pendingApps }}</div>
            <div class="stat-label">Pending Review</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalDownloads }}</div>
            <div class="stat-label">Total Downloads</div>
          </div>
        </div>

        <div class="action-cards">
          <AppCard class="action-card" hoverable @click="navigateToSubmitApp">
            <div class="action-content">
              <div class="action-icon">
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
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h3>Submit New Application</h3>
              <p>Create a new application for TransAIRobot devices</p>
            </div>
          </AppCard>

          <AppCard class="action-card" hoverable @click="activeTab = 'apps'">
            <div class="action-content">
              <div class="action-icon">
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
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <h3>Manage Applications</h3>
              <p>View and manage your existing applications</p>
            </div>
          </AppCard>

          <AppCard class="action-card" hoverable @click="activeTab = 'settings'">
            <div class="action-content">
              <div class="action-icon">
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
                  <circle cx="12" cy="12" r="3"></circle>
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                  ></path>
                </svg>
              </div>
              <h3>Developer Settings</h3>
              <p>Update your developer profile and preferences</p>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- Applications Tab -->
      <div v-else-if="activeTab === 'apps'" class="apps-tab">
        <AppManagementDashboard />
      </div>

      <!-- Settings Tab -->
      <div v-else-if="activeTab === 'settings'" class="settings-tab">
        <div class="settings-placeholder">
          <h3>Developer Settings</h3>
          <p>Developer settings functionality will be implemented in a future update.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppCard from '../common/AppCard.vue';
import AppManagementDashboard from './AppManagementDashboard.vue';

export default {
  name: 'DeveloperDashboard',
  components: {
    AppCard,
    AppManagementDashboard
  },
  setup() {
    const router = useRouter();
    const activeTab = ref('overview');

    const stats = reactive({
      totalApps: 0,
      publishedApps: 0,
      pendingApps: 0,
      totalDownloads: 0
    });

    const navigateToSubmitApp = () => {
      router.push({ name: 'AppSubmission' });
    };

    const fetchDeveloperStats = () => {
      // This would be replaced with an actual API call
      // Simulating API call with setTimeout
      setTimeout(() => {
        // Mock data
        stats.totalApps = 5;
        stats.publishedApps = 2;
        stats.pendingApps = 1;
        stats.totalDownloads = 2121;
      }, 500);
    };

    onMounted(() => {
      fetchDeveloperStats();
    });

    return {
      activeTab,
      stats,
      navigateToSubmitApp
    };
  }
};
</script>

<style lang="scss" scoped>
.developer-dashboard {
  width: 100%;

  .dashboard-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 2rem;

    .tab-item {
      padding: 1rem 1.5rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        color: var(--text-primary);
      }

      &.active {
        color: var(--accent-primary);

        &:after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent-primary);
        }
      }
    }
  }

  .tab-content {
    min-height: 400px;

    .welcome-section {
      text-align: center;
      margin-bottom: 2rem;

      h2 {
        margin-bottom: 0.5rem;
        font-size: 1.75rem;
      }

      p {
        color: var(--text-secondary);
        font-size: 1.1rem;
      }
    }

    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;

      .stat-card {
        background: var(--bg-secondary);
        border-radius: 0.75rem;
        padding: 1.5rem;
        text-align: center;
        box-shadow: var(--shadow-sm);
        transition: transform 0.3s ease, box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }
      }
    }

    .action-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;

      .action-card {
        height: 100%;

        .action-content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;

          .action-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(
              135deg,
              var(--accent-primary-light),
              var(--accent-secondary-light)
            );
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;

            svg {
              color: var(--accent-primary);
            }
          }

          h3 {
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
          }

          p {
            color: var(--text-secondary);
            font-size: 0.9rem;
          }
        }
      }
    }

    .settings-placeholder {
      text-align: center;
      padding: 4rem 0;

      h3 {
        margin-bottom: 1rem;
      }

      p {
        color: var(--text-secondary);
      }
    }
  }
}
</style>
