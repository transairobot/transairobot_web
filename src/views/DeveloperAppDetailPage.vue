<template>
  <div class="developer-app-detail-page">
    <AppHeader />
    <main>
      <AppContainer>
        <div v-if="loading" class="loading-container">
          <LoadingState message="Loading application details..." />
        </div>
        <template v-else-if="app">
          <div class="app-header">
            <div class="back-button" @click="goBack">
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
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Dashboard
            </div>
            <div class="app-title">
              <div class="app-icon">
                <img :src="app.icon" :alt="app.name" />
              </div>
              <div class="app-info">
                <h1>{{ app.name }}</h1>
                <div class="app-meta">
                  <div class="app-status" :class="getStatusClass(app.status)">
                    {{ getStatusLabel(app.status) }}
                  </div>
                  <div class="app-version">Version {{ app.version }}</div>
                  <div class="app-date">Updated {{ formatDate(app.lastUpdated) }}</div>
                </div>
              </div>
            </div>
            <div class="app-actions">
              <AppButton v-if="app.status === 'published'" variant="secondary"
                >Update App</AppButton
              >
              <AppButton v-if="app.status === 'draft'" variant="primary"
                >Submit for Review</AppButton
              >
              <AppButton v-if="app.status === 'rejected'" variant="primary">Resubmit</AppButton>
            </div>
          </div>

          <div class="app-content">
            <AppAnalytics :appId="app.id" />
            <AppFeedback :appId="app.id" />
          </div>
        </template>
        <div v-else class="error-state">
          <div class="error-icon">
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
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2>Application Not Found</h2>
          <p>
            The application you're looking for doesn't exist or you don't have permission to view
            it.
          </p>
          <AppButton @click="goBack" variant="primary">Back to Dashboard</AppButton>
        </div>
      </AppContainer>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import AppContainer from '../components/common/AppContainer.vue';
import AppButton from '../components/common/AppButton.vue';
import LoadingState from '../components/common/LoadingState.vue';
import AppAnalytics from '../components/developer/AppAnalytics.vue';
import AppFeedback from '../components/developer/AppFeedback.vue';
import developerService from '../services/developer.service';

export default {
  name: 'DeveloperAppDetailPage',
  components: {
    AppHeader,
    AppFooter,
    AppContainer,
    AppButton,
    LoadingState,
    AppAnalytics,
    AppFeedback
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(true);
    const app = ref(null);

    const getStatusLabel = status => {
      const statusMap = {
        published: 'Published',
        pending: 'In Review',
        rejected: 'Rejected',
        draft: 'Draft'
      };
      return statusMap[status] || status;
    };

    const getStatusClass = status => {
      return `status-${status}`;
    };

    const formatDate = dateString => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const goBack = () => {
      router.push({ name: 'DeveloperPortal' });
    };

    const fetchAppDetails = async () => {
      const appId = route.params.id;
      loading.value = true;

      try {
        // In a real implementation, this would call the API
        // const response = await developerService.getAppDetails(appId);

        // Mock data for demonstration
        setTimeout(() => {
          // Simulate API response
          const mockApp = {
            id: appId,
            name: 'Robot Navigation Assistant',
            description:
              'Helps robots navigate complex environments with advanced pathfinding algorithms.',
            icon: '/assets/images/app-icons/navigation.png',
            status: 'published',
            downloads: 1245,
            rating: 4.7,
            lastUpdated: '2025-06-15T10:30:00Z',
            version: '1.2.0'
          };

          app.value = mockApp;
          loading.value = false;
        }, 800);
      } catch (error) {
        console.error('Error fetching app details:', error);
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchAppDetails();
    });

    return {
      loading,
      app,
      getStatusLabel,
      getStatusClass,
      formatDate,
      goBack
    };
  }
};
</script>

<style lang="scss" scoped>
.developer-app-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: 2rem 0;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    padding: 3rem 0;
  }

  .app-header {
    margin-bottom: 2rem;

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: var(--accent-primary);
      }
    }

    .app-title {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;

      .app-icon {
        width: 80px;
        height: 80px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: var(--shadow-md);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .app-info {
        h1 {
          margin: 0 0 0.5rem;
          font-size: 2rem;
        }

        .app-meta {
          display: flex;
          align-items: center;
          gap: 1rem;

          .app-status {
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.8rem;
            font-weight: 600;

            &.status-published {
              background-color: rgba(var(--success-rgb), 0.2);
              color: var(--success-color);
            }

            &.status-pending {
              background-color: rgba(var(--warning-rgb), 0.2);
              color: var(--warning-color);
            }

            &.status-rejected {
              background-color: rgba(var(--error-rgb), 0.2);
              color: var(--error-color);
            }

            &.status-draft {
              background-color: rgba(var(--info-rgb), 0.2);
              color: var(--info-color);
            }
          }

          .app-version,
          .app-date {
            color: var(--text-secondary);
            font-size: 0.9rem;
          }
        }
      }
    }

    .app-actions {
      display: flex;
      gap: 1rem;
    }
  }

  .app-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .error-state {
    text-align: center;
    padding: 4rem 0;

    .error-icon {
      margin-bottom: 1.5rem;
      color: var(--text-tertiary);
    }

    h2 {
      margin-bottom: 1rem;
    }

    p {
      color: var(--text-secondary);
      margin-bottom: 2rem;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
  }
}
</style>
