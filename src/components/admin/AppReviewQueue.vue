<template>
  <div class="app-review-queue">
    <div class="filters">
      <h3>Filters</h3>
      <div class="filter-options">
        <div class="filter-group">
          <label>Sort by:</label>
          <select v-model="sortBy" @change="applyFilters">
            <option value="date">Submission Date</option>
            <option value="name">App Name</option>
            <option value="developer">Developer</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Order:</label>
          <select v-model="sortOrder" @change="applyFilters">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>

    <div class="queue-list">
      <LoadingState v-if="loading" />
      <ErrorState v-else-if="error" :message="error" @retry="fetchPendingApps" />
      <div v-else-if="filteredApps.length === 0" class="empty-state">
        <p>No pending applications to review</p>
      </div>
      <div v-else class="app-list">
        <div
          v-for="app in filteredApps"
          :key="app.id"
          class="app-item"
          :class="{ selected: selectedApp && selectedApp.id === app.id }"
          @click="selectApp(app)"
        >
          <div class="app-icon">
            <img :src="app.icon" :alt="app.name + ' icon'" />
          </div>
          <div class="app-info">
            <h4>{{ app.name }}</h4>
            <p>By {{ app.developer }}</p>
            <p class="submission-date">Submitted: {{ formatDate(app.submittedDate) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import LoadingState from '../common/LoadingState.vue';
import ErrorState from '../common/ErrorState.vue';

export default {
  name: 'AppReviewQueue',
  components: {
    LoadingState,
    ErrorState
  },
  props: {
    selectedApp: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      sortBy: 'date',
      sortOrder: 'desc',
      error: null
    };
  },
  computed: {
    ...mapState('admin', ['pendingApps', 'loading']),
    filteredApps() {
      if (!this.pendingApps || this.pendingApps.length === 0) {
        return [];
      }

      const sorted = [...this.pendingApps].sort((a, b) => {
        let comparison = 0;

        switch (this.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'developer':
            comparison = a.developer.localeCompare(b.developer);
            break;
          case 'date':
          default:
            comparison = new Date(a.submittedDate) - new Date(b.submittedDate);
            break;
        }

        return this.sortOrder === 'asc' ? comparison : -comparison;
      });

      return sorted;
    }
  },
  methods: {
    ...mapActions('admin', ['fetchPendingApps']),
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    selectApp(app) {
      this.$emit('select-app', app);
    },
    applyFilters() {
      // The computed property will handle the filtering
    }
  },
  created() {
    this.fetchPendingApps();
  }
};
</script>

<style lang="scss" scoped>
.app-review-queue {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid var(--border-color);

  .filters {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);

    h3 {
      margin-top: 0;
      margin-bottom: 1rem;
    }

    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
      }
    }
  }

  .queue-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: var(--text-secondary);
    }

    .app-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .app-item {
        display: flex;
        padding: 1rem;
        border-radius: 8px;
        background-color: var(--bg-secondary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        &.selected {
          border: 2px solid var(--accent-primary);
          background-color: var(--bg-primary);
        }

        .app-icon {
          width: 60px;
          height: 60px;
          margin-right: 1rem;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
          }
        }

        .app-info {
          flex: 1;

          h4 {
            margin: 0 0 0.5rem 0;
          }

          p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
          }

          .submission-date {
            margin-top: 0.5rem;
            font-size: 0.8rem;
          }
        }
      }
    }
  }
}
</style>
