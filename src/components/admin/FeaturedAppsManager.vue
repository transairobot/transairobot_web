<template>
  <div class="featured-apps-manager">
    <div class="section-header">
      <h2>Featured Applications</h2>
      <p>Manage which applications are featured in the store</p>
    </div>

    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search applications..."
        @input="searchApps"
      />
    </div>

    <div class="app-list">
      <LoadingState v-if="loading" />
      <ErrorState v-else-if="error" :message="error" @retry="fetchApps" />

      <div v-else-if="filteredApps.length === 0" class="empty-state">
        <p>No applications found</p>
      </div>

      <div v-else class="app-grid">
        <div
          v-for="app in filteredApps"
          :key="app.id"
          class="app-card"
          :class="{ featured: app.featured }"
        >
          <div class="app-icon">
            <img :src="app.icon" :alt="app.name + ' icon'" />
          </div>
          <div class="app-info">
            <h3>{{ app.name }}</h3>
            <p class="developer">By {{ app.developer }}</p>
            <p class="status">Status: {{ app.status }}</p>
          </div>
          <div class="app-actions">
            <button @click="toggleFeature(app)" :class="{ 'featured-btn': app.featured }">
              {{ app.featured ? 'Unfeature' : 'Feature' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapState, mapActions } from 'vuex';
import LoadingState from '../common/LoadingState.vue';
import ErrorState from '../common/ErrorState.vue';

export default {
  name: 'FeaturedAppsManager',
  components: {
    LoadingState,
    ErrorState
  },
  data() {
    return {
      searchQuery: '',
      apps: [],
      filteredApps: [],
      loading: false,
      error: null
    };
  },
  methods: {
    async fetchApps() {
      this.loading = true;
      this.error = null;

      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          this.apps = [
            {
              id: '1',
              name: 'Navigation Assistant',
              icon: '/assets/icons/navigation.png',
              developer: 'RoboTech Inc.',
              status: 'approved',
              featured: true
            },
            {
              id: '2',
              name: 'Voice Commander',
              icon: '/assets/icons/voice.png',
              developer: 'AI Solutions',
              status: 'approved',
              featured: false
            },
            {
              id: '3',
              name: 'Environment Scanner',
              icon: '/assets/icons/scanner.png',
              developer: 'Sensor Systems',
              status: 'approved',
              featured: true
            },
            {
              id: '6',
              name: 'Path Optimizer',
              icon: '/assets/icons/path.png',
              developer: 'RoboTech Inc.',
              status: 'approved',
              featured: false
            }
          ];

          this.filteredApps = [...this.apps];
          this.loading = false;
        }, 500);
      } catch (error) {
        console.error('Error fetching apps:', error);
        this.error = 'Failed to load applications';
        this.loading = false;
      }
    },
    searchApps() {
      if (!this.searchQuery.trim()) {
        this.filteredApps = [...this.apps];
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.filteredApps = this.apps.filter(
        app => app.name.toLowerCase().includes(query) || app.developer.toLowerCase().includes(query)
      );
    },
    async toggleFeature(app) {
      try {
        // In a real app, this would be an API call
        // For now, we'll just update the local state
        app.featured = !app.featured;

        // Simulate API call
        // const adminService = await import('../../services/admin.service');
        // adminService.featureApplication(app.id, app.featured);

        this.$emit('show-notification', {
          type: 'success',
          message: app.featured
            ? `${app.name} is now featured`
            : `${app.name} is no longer featured`
        });
      } catch (error) {
        console.error('Error toggling feature status:', error);

        // Revert the change
        app.featured = !app.featured;

        this.$emit('show-notification', {
          type: 'error',
          message: 'Failed to update feature status'
        });
      }
    }
  },
  created() {
    this.fetchApps();
  }
};
</script>

<style lang="scss" scoped>
.featured-apps-manager {
  .section-header {
    margin-bottom: $spacing-lg;

    h2 {
      margin: 0 0 $spacing-xs 0;
    }

    p {
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .search-bar {
    margin-bottom: $spacing-lg;

    input {
      width: 100%;
      padding: $spacing-md;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
      }
    }
  }

  .app-list {
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: var(--text-secondary);
    }

    .app-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: $spacing-lg;

      .app-card {
        display: flex;
        flex-direction: column;
        padding: $spacing-lg;
        background-color: var(--bg-secondary);
        border-radius: 8px;
        transition: all 0.2s ease;
        position: relative;

        &.featured {
          border: 2px solid var(--accent-secondary);

          &::before {
            content: 'Featured';
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: var(--accent-secondary);
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
          }
        }

        .app-icon {
          width: 60px;
          height: 60px;
          margin-bottom: $spacing-md;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
          }
        }

        .app-info {
          flex: 1;

          h3 {
            margin: 0 0 $spacing-xs 0;
          }

          p {
            margin: 0 0 $spacing-xs 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
          }

          .status {
            font-size: 0.8rem;
            text-transform: capitalize;
          }
        }

        .app-actions {
          margin-top: $spacing-md;

          button {
            width: 100%;
            padding: $spacing-sm $spacing-md;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            background-color: var(--bg-primary);
            border: 1px solid var(--border-color);
            transition: all 0.2s ease;

            &:hover {
              background-color: var(--bg-secondary);
            }

            &.featured-btn {
              background-color: var(--accent-secondary);
              color: white;
              border: none;

              &:hover {
                background-color: var(--accent-secondary-dark);
              }
            }
          }
        }
      }
    }
  }
}
</style>
