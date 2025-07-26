<template>
  <div class="bulk-actions-manager">
    <div class="section-header">
      <h2>Bulk Actions</h2>
      <p>Perform actions on multiple applications at once</p>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label for="statusFilter">Filter by Status:</label>
        <select id="statusFilter" v-model="filters.status" @change="applyFilters">
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="categoryFilter">Filter by Category:</label>
        <select id="categoryFilter" v-model="filters.category" @change="applyFilters">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="searchFilter">Search:</label>
        <input
          type="text"
          id="searchFilter"
          v-model="filters.search"
          placeholder="Search by name or developer"
          @input="applyFilters"
        />
      </div>
    </div>

    <div class="bulk-actions">
      <div class="selected-count" v-if="selectedApps.length > 0">
        {{ selectedApps.length }} application(s) selected
      </div>

      <div class="action-buttons" v-if="selectedApps.length > 0">
        <button @click="bulkFeature(true)" class="feature-btn">Feature Selected</button>
        <button @click="bulkFeature(false)" class="unfeature-btn">Unfeature Selected</button>
        <button @click="showCategoryModal = true" class="category-btn">Set Category</button>
        <button @click="confirmBulkDelete" class="delete-btn">Delete Selected</button>
      </div>
    </div>

    <div class="app-list">
      <LoadingState v-if="loading" />
      <ErrorState v-else-if="error" :message="error" @retry="fetchApps" />

      <div v-else-if="filteredApps.length === 0" class="empty-state">
        <p>No applications found</p>
      </div>

      <table v-else class="app-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
            </th>
            <th class="icon-col">Icon</th>
            <th>Name</th>
            <th>Developer</th>
            <th>Status</th>
            <th>Featured</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in filteredApps" :key="app.id">
            <td>
              <input
                type="checkbox"
                :checked="isAppSelected(app)"
                @change="toggleAppSelection(app)"
              />
            </td>
            <td class="app-icon">
              <img :src="app.icon" :alt="app.name + ' icon'" />
            </td>
            <td>{{ app.name }}</td>
            <td>{{ app.developer }}</td>
            <td class="app-status">
              <span class="status-badge" :class="app.status">
                {{ app.status }}
              </span>
            </td>
            <td class="featured-status">
              <span v-if="app.featured" class="featured-badge">Featured</span>
              <span v-else>-</span>
            </td>
            <td>{{ getCategoryName(app.category) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Category Modal -->
    <div class="modal" v-if="showCategoryModal">
      <div class="modal-content">
        <h3>Set Category</h3>
        <p>Select a category for the selected applications:</p>

        <div class="form-group">
          <label for="bulkCategory">Category</label>
          <select id="bulkCategory" v-model="selectedCategory">
            <option value="">-- Select Category --</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showCategoryModal = false">Cancel</button>
          <button class="confirm-btn" @click="bulkSetCategory" :disabled="!selectedCategory">
            Apply
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal" v-if="showDeleteConfirmation">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete {{ selectedApps.length }} application(s)?</p>
        <p class="warning">This action cannot be undone.</p>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteConfirmation = false">Cancel</button>
          <button class="delete-btn" @click="bulkDelete">Delete</button>
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
  name: 'BulkActionsManager',
  components: {
    LoadingState,
    ErrorState
  },
  data() {
    return {
      apps: [],
      filteredApps: [],
      selectedApps: [],
      filters: {
        status: '',
        category: '',
        search: ''
      },
      showCategoryModal: false,
      selectedCategory: '',
      showDeleteConfirmation: false,
      loading: false,
      error: null
    };
  },
  computed: {
    ...mapState('admin', ['categories']),
    isAllSelected() {
      return this.filteredApps.length > 0 && this.selectedApps.length === this.filteredApps.length;
    }
  },
  methods: {
    ...mapActions('admin', ['fetchCategories']),

    fetchApps() {
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
              featured: true,
              category: '1'
            },
            {
              id: '2',
              name: 'Voice Commander',
              icon: '/assets/icons/voice.png',
              developer: 'AI Solutions',
              status: 'approved',
              featured: false,
              category: '4'
            },
            {
              id: '3',
              name: 'Environment Scanner',
              icon: '/assets/icons/scanner.png',
              developer: 'Sensor Systems',
              status: 'approved',
              featured: true,
              category: '3'
            },
            {
              id: '4',
              name: 'Speech Recognition',
              icon: '/assets/icons/speech.png',
              developer: 'AI Dev',
              status: 'pending',
              featured: false,
              category: '4'
            },
            {
              id: '5',
              name: 'Object Detection',
              icon: '/assets/icons/object.png',
              developer: 'Vision Systems Inc.',
              status: 'pending',
              featured: false,
              category: '3'
            },
            {
              id: '6',
              name: 'Path Optimizer',
              icon: '/assets/icons/path.png',
              developer: 'RoboTech Inc.',
              status: 'approved',
              featured: false,
              category: '1'
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

    applyFilters() {
      let filtered = [...this.apps];

      // Apply status filter
      if (this.filters.status) {
        filtered = filtered.filter(app => app.status === this.filters.status);
      }

      // Apply category filter
      if (this.filters.category) {
        filtered = filtered.filter(app => app.category === this.filters.category);
      }

      // Apply search filter
      if (this.filters.search) {
        const query = this.filters.search.toLowerCase();
        filtered = filtered.filter(
          app =>
            app.name.toLowerCase().includes(query) || app.developer.toLowerCase().includes(query)
        );
      }

      this.filteredApps = filtered;

      // Clear selection when filters change
      this.selectedApps = [];
    },

    getCategoryName(categoryId) {
      if (!categoryId) return 'Uncategorized';
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.name : 'Uncategorized';
    },

    isAppSelected(app) {
      return this.selectedApps.some(selectedApp => selectedApp.id === app.id);
    },

    toggleAppSelection(app) {
      if (this.isAppSelected(app)) {
        this.selectedApps = this.selectedApps.filter(selectedApp => selectedApp.id !== app.id);
      } else {
        this.selectedApps.push(app);
      }
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedApps = [];
      } else {
        this.selectedApps = [...this.filteredApps];
      }
    },

    async bulkFeature(featured) {
      if (this.selectedApps.length === 0) return;

      try {
        // In a real app, this would be an API call
        // For now, we'll just update the local state
        this.selectedApps.forEach(app => {
          const appInList = this.apps.find(a => a.id === app.id);
          if (appInList) {
            appInList.featured = featured;
          }
        });

        // Update filtered apps
        this.filteredApps = [...this.filteredApps];

        this.$emit('show-notification', {
          type: 'success',
          message: `${this.selectedApps.length} application(s) ${
            featured ? 'featured' : 'unfeatured'
          } successfully`
        });
      } catch (error) {
        console.error('Error updating feature status:', error);

        this.$emit('show-notification', {
          type: 'error',
          message: 'Failed to update feature status'
        });
      }
    },

    async bulkSetCategory() {
      if (this.selectedApps.length === 0 || !this.selectedCategory) {
        this.showCategoryModal = false;
        return;
      }

      try {
        // In a real app, this would be an API call
        // For now, we'll just update the local state
        this.selectedApps.forEach(app => {
          const appInList = this.apps.find(a => a.id === app.id);
          if (appInList) {
            appInList.category = this.selectedCategory;
          }
        });

        // Update filtered apps
        this.filteredApps = [...this.filteredApps];

        const categoryName = this.getCategoryName(this.selectedCategory);

        this.$emit('show-notification', {
          type: 'success',
          message: `${this.selectedApps.length} application(s) moved to "${categoryName}" category`
        });

        this.showCategoryModal = false;
        this.selectedCategory = '';
      } catch (error) {
        console.error('Error updating category:', error);

        this.$emit('show-notification', {
          type: 'error',
          message: 'Failed to update category'
        });
      }
    },

    confirmBulkDelete() {
      if (this.selectedApps.length === 0) return;
      this.showDeleteConfirmation = true;
    },

    async bulkDelete() {
      if (this.selectedApps.length === 0) {
        this.showDeleteConfirmation = false;
        return;
      }

      try {
        // In a real app, this would be an API call
        // For now, we'll just update the local state
        const selectedIds = this.selectedApps.map(app => app.id);
        this.apps = this.apps.filter(app => !selectedIds.includes(app.id));

        // Update filtered apps
        this.filteredApps = this.filteredApps.filter(app => !selectedIds.includes(app.id));

        this.$emit('show-notification', {
          type: 'success',
          message: `${this.selectedApps.length} application(s) deleted successfully`
        });

        this.selectedApps = [];
        this.showDeleteConfirmation = false;
      } catch (error) {
        console.error('Error deleting applications:', error);

        this.$emit('show-notification', {
          type: 'error',
          message: 'Failed to delete applications'
        });
      }
    }
  },
  created() {
    this.fetchApps();
    this.fetchCategories();
  }
};
</script>
<style lang="scss" scoped>
.bulk-actions-manager {
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

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background-color: var(--bg-secondary);
    border-radius: 8px;

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
      flex: 1;
      min-width: 200px;

      label {
        font-weight: 500;
        font-size: 0.9rem;
      }

      select,
      input {
        padding: $spacing-sm;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background-color: var(--bg-primary);
        color: var(--text-primary);

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
      }
    }
  }

  .bulk-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background-color: var(--bg-secondary);
    border-radius: 8px;

    .selected-count {
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: $spacing-sm;

      button {
        padding: $spacing-sm $spacing-md;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        border: none;

        &.feature-btn {
          background-color: var(--accent-secondary);
          color: white;

          &:hover {
            background-color: var(--accent-secondary-dark);
          }
        }

        &.unfeature-btn {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);

          &:hover {
            background-color: var(--bg-secondary);
          }
        }

        &.category-btn {
          background-color: var(--accent-primary);
          color: white;

          &:hover {
            background-color: var(--accent-primary-dark, #1ccb97ff);
          }
        }

        &.delete-btn {
          background-color: var(--danger);
          color: white;

          &:hover {
            background-color: var(--danger-dark);
          }
        }
      }
    }
  }

  .app-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: $spacing-md;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }

    th {
      font-weight: 600;
      color: var(--text-secondary);

      &.checkbox-col {
        width: 40px;
      }

      &.icon-col {
        width: 60px;
      }
    }

    td {
      &.app-icon {
        img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 4px;
        }
      }

      &.app-status {
        text-transform: capitalize;

        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;

          &.approved {
            background-color: var(--success-light);
            color: var(--success);
          }

          &.pending {
            background-color: var(--warning-light);
            color: var(--warning);
          }

          &.rejected {
            background-color: var(--danger-light);
            color: var(--danger);
          }
        }
      }

      &.featured-status {
        .featured-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          background-color: var(--accent-secondary-light);
          color: var(--accent-secondary);
        }
      }
    }

    tr:hover {
      background-color: var(--bg-secondary);
    }
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .modal-content {
      background-color: var(--bg-primary);
      padding: $spacing-lg;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;

      h3 {
        margin-top: 0;
        margin-bottom: $spacing-md;
      }

      p {
        margin-bottom: $spacing-md;
      }

      .warning {
        color: var(--danger);
        font-weight: 500;
      }

      .form-group {
        margin-bottom: $spacing-md;

        label {
          display: block;
          margin-bottom: $spacing-xs;
          font-weight: 500;
        }

        select {
          width: 100%;
          padding: $spacing-sm;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          color: var(--text-primary);

          &:focus {
            outline: none;
            border-color: var(--accent-primary);
          }
        }
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: $spacing-md;

        button {
          padding: $spacing-sm $spacing-lg;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;

          &.cancel-btn {
            background-color: transparent;
            border: 1px solid var(--border-color);

            &:hover {
              background-color: var(--bg-secondary);
            }
          }

          &.confirm-btn {
            background-color: var(--accent-primary);
            color: white;
            border: none;

            &:hover {
              background-color: var(--accent-primary-dark, #1ccb97ff);
            }
          }

          &.delete-btn {
            background-color: var(--danger);
            color: white;
            border: none;

            &:hover {
              background-color: var(--danger-dark);
            }
          }
        }
      }
    }
  }
}
</style>
