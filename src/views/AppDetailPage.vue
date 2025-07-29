<template>
  <div class="app-detail-page">
    <AppHeader />
    <main>
      <div class="container">
        <div v-if="loading" class="app-detail-loading">
          <LoadingState message="Loading application details..." />
        </div>

        <div v-else-if="error" class="app-detail-error">
          <ErrorState message="Failed to load application details" :retry="fetchAppDetails" />
        </div>

        <template v-else-if="app">
          <div class="app-detail-header">
            <div class="app-detail-back">
              <button class="back-button" @click="goBack">
                <span class="back-icon">←</span>
                <span>Back to Store</span>
              </button>
            </div>

            <div class="app-detail-main">
              <div class="app-detail-icon">
                <img :src="app.iconUrl" :alt="`${app.name} icon`" />
              </div>

              <div class="app-detail-info">
                <h1 class="app-detail-name">{{ app.name }}</h1>

                <div class="app-detail-meta">
                  <div class="app-detail-developer">
                    <span class="meta-label">Developer:</span>
                    <span class="meta-value">{{ app.developerId }}</span>
                  </div>

                  <div class="app-detail-version">
                    <span class="meta-label">Version:</span>
                    <span class="meta-value">{{ app.version }}</span>
                  </div>

                  <div class="app-detail-rating" v-if="app.rating">
                    <span class="app-detail-stars">
                      <span
                        v-for="i in 5"
                        :key="i"
                        class="app-detail-star"
                        :class="{ 'app-detail-star--filled': i <= Math.round(app.rating) }"
                      >
                        ★
                      </span>
                    </span>
                    <span class="app-detail-rating-value">{{ app.rating.toFixed(1) }}</span>
                  </div>
                </div>

                <div class="app-detail-categories" v-if="app.category">
                  <span class="app-detail-category-tag">
                    {{ app.category }}
                  </span>
                </div>

                <div class="app-detail-actions">
                  <button class="app-detail-install-btn" @click="installApp">
                    Install Application
                  </button>

                  <button class="app-detail-share-btn" @click="shareApp">Share</button>
                </div>
              </div>
            </div>
          </div>

          <div class="app-detail-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </div>

          <div class="app-detail-content">
            <div v-if="activeTab === 'description'" class="app-detail-description">
              <div class="markdown-content" v-html="renderedDescription"></div>
            </div>

            <div v-else-if="activeTab === 'reviews'" class="app-detail-reviews">
              <h2>Reviews</h2>
              <p>User reviews coming soon...</p>
            </div>

            <div v-else-if="activeTab === 'related'" class="app-detail-related">
              <h2>Related Applications</h2>
              <p>Related applications coming soon...</p>
            </div>
          </div>
        </template>
      </div>
    </main>
    <AppFooter />

    <!-- Installation Modal -->
    <InstallationModal
      v-model:show="showInstallModal"
      :app="app"
      @installation-complete="handleInstallationComplete"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import LoadingState from '../components/common/LoadingState.vue';
import ErrorState from '../components/common/ErrorState.vue';
import { renderMarkdown } from '../utils/markdown';
import InstallationModal from '../components/robots/InstallationModal.vue';

export default {
  name: 'AppDetailPage',
  components: {
    AppHeader,
    AppFooter,
    LoadingState,
    ErrorState,
    InstallationModal
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();

    const appId = computed(() => route.params.id);
    const loading = computed(() => store.getters['apps/isLoading']);
    const app = computed(() => store.getters['apps/currentApp']);
    const error = computed(() => store.state.apps.error);

    const activeTab = ref('description');
    const tabs = [
      { id: 'description', name: 'Description' },
      { id: 'reviews', name: 'Reviews' },
      { id: 'related', name: 'Related Apps' }
    ];

    const renderedDescription = computed(() => {
      if (!app.value || !app.value.description) return '';
      return renderMarkdown(app.value.description);
    });

    const fetchAppDetails = async () => {
      try {
        await store.dispatch('apps/fetchAppDetails', appId.value);
      } catch (err) {
        console.error('Failed to fetch app details:', err);
        // Error is handled in the store
      }
    };

    const goBack = () => {
      router.push('/app-store');
    };

    const showInstallModal = ref(false);

    const installApp = () => {
      showInstallModal.value = true;
    };

    const handleInstallationComplete = result => {
      if (result.success) {
        // You could show a toast notification here
        console.log(`Successfully installed ${app.value.name} on robot ${result.robotId}`);
      } else {
        console.error('Installation failed:', result.error);
      }
    };

    const shareApp = () => {
      // This would typically open a share dialog
      // For now, just copy the URL to clipboard
      const url = window.location.href;
      navigator.clipboard
        .writeText(url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Failed to copy link:', err));
    };

    onMounted(() => {
      fetchAppDetails();
    });

    return {
      app,
      loading,
      error,
      activeTab,
      tabs,
      renderedDescription,
      fetchAppDetails,
      goBack,
      installApp,
      shareApp,
      showInstallModal,
      handleInstallationComplete
    };
  }
};
</script>

<style lang="scss" scoped>
.app-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: 2rem 0;
  }

  .app-detail-loading,
  .app-detail-error {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  .app-detail-back {
    margin-bottom: 1.5rem;

    .back-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: var(--accent-primary);
      }

      .back-icon {
        font-size: 1.25rem;
      }
    }
  }

  .app-detail-main {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }

  .app-detail-icon {
    flex-shrink: 0;
    width: 128px;
    height: 128px;
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg-secondary);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .app-detail-info {
    flex: 1;
  }

  .app-detail-name {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

  .app-detail-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;

    .meta-label {
      color: var(--text-tertiary);
      margin-right: 0.25rem;
    }

    .meta-value {
      color: var(--text-secondary);
      font-weight: 500;
    }

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .app-detail-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .app-detail-stars {
    display: flex;
  }

  .app-detail-star {
    color: var(--text-tertiary);

    &--filled {
      color: var(--accent-primary);
    }
  }

  .app-detail-rating-value {
    font-weight: 600;
    color: var(--text-primary);
  }

  .app-detail-downloads {
    color: var(--text-tertiary);
  }

  .app-detail-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .app-detail-category-tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    border-radius: 1rem;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: var(--accent-primary);
      color: white;
    }
  }

  .app-detail-actions {
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .app-detail-install-btn {
    padding: 0.75rem 1.5rem;
    background-color: var(--accent-primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;

    &:hover {
      // background-color: var(--accent-primary-dark, #1ccb97ff);
      background-color: var(--accent-primary-dark, #1ccb97ff);
      transform: translateY(-2px);
    }
  }

  .app-detail-share-btn {
    padding: 0.75rem 1.5rem;
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
  }

  .app-detail-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 2rem;

    .tab-button {
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-secondary);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        color: var(--text-primary);
      }

      &.active {
        color: var(--accent-primary);
        border-bottom-color: var(--accent-primary);
      }
    }

    @media (max-width: 768px) {
      justify-content: center;
      flex-wrap: wrap;

      .tab-button {
        flex: 1;
        min-width: 120px;
        text-align: center;
      }
    }
  }

  .app-detail-content {
    margin-bottom: 3rem;
  }

  .app-detail-description {
    line-height: 1.6;
    color: var(--text-secondary);

    :deep(h1),
    :deep(h2),
    :deep(h3) {
      color: var(--text-primary);
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }

    :deep(p) {
      margin-bottom: 1rem;
    }

    :deep(ul),
    :deep(ol) {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    :deep(li) {
      margin-bottom: 0.5rem;
    }

    :deep(a) {
      color: var(--accent-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(code) {
      background-color: var(--bg-secondary);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: monospace;
    }

    :deep(pre) {
      background-color: var(--bg-secondary);
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-bottom: 1.5rem;

      code {
        background: none;
        padding: 0;
      }
    }
  }
}
</style>
