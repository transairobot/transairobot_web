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
      <div v-if="loading" class="loading-state">
        <p>Loading applications...</p>
      </div>

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
            <img :src="app.iconUrl || '/assets/icons/default-app.png'" :alt="app.name + ' icon'" />
          </div>
          <div class="app-info">
            <h3>{{ app.name }}</h3>
            <p class="category">Category: {{ app.category }}</p>
            <p class="status">Status: {{ app.status || 'active' }}</p>
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
import { adminService } from '@/services';

export default {
  name: 'FeaturedAppsManager',
  emits: ['show-notification'],
  data() {
    return {
      searchQuery: '',
      apps: [],
      filteredApps: [],
      categories: [],
      loading: false,
      searchTimeout: null // 添加防抖定时器
    };
  },
  methods: {
    async fetchApps() {
      this.loading = true;

      try {
        const result = await adminService.getFeaturedApplicationsForAdmin({
          page: 1,
          limit: 100,
          name: this.searchQuery || undefined
        });

        let appsData = [];

        // 处理标准格式: {code: 0, message: "", data: [...]}
        if (result && result.data && Array.isArray(result.data)) {
          appsData = result.data;
        }
        // 处理直接数组格式: [...]
        else if (Array.isArray(result)) {
          appsData = result;
        }
        // 处理异常格式: {0: {...}, 1: {...}} (零值字段被过滤的情况)
        else if (result && typeof result === 'object') {
          // 检查是否是 {0: {...}, 1: {...}} 这种格式
          const keys = Object.keys(result);
          const isIndexedObject = keys.length > 0 && keys.every(key => /^\d+$/.test(key));

          if (isIndexedObject) {
            appsData = Object.values(result);
          } else {
            appsData = [];
          }
        } else {
          appsData = [];
        }

        this.apps = appsData.map(app => ({
          ...app,
          featured: app.isFeatured || app.featured // 将 isFeatured 映射为 featured
        }));

        this.filteredApps = [...this.apps];
      } catch (error) {
        // 静默处理错误，不显示任何通知或错误状态
        console.error('Error fetching featured apps:', error);
        this.apps = [];
        this.filteredApps = [];
      } finally {
        this.loading = false;
      }
    },

    searchApps() {
      // 清除之前的定时器
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // 设置新的定时器，500ms后执行搜索
      this.searchTimeout = setTimeout(() => {
        this.fetchApps();
      }, 500);
    },

    async toggleFeature(app) {
      try {
        // 调用真实的API
        if (app.featured) {
          await adminService.unfeatureApplication(app.id);
        } else {
          await adminService.featureApplication(app.id);
        }

        // 更新本地状态
        app.featured = !app.featured;

        this.$emit('show-notification', {
          type: 'success',
          message: app.featured
            ? `${app.name} is now featured`
            : `${app.name} is no longer featured`
        });
      } catch (error) {
        console.error('Error toggling feature status:', error);

        this.$emit('show-notification', {
          type: 'error',
          message: 'Failed to update feature status'
        });
      }
    }
  },
  created() {
    this.fetchApps();
  },
  beforeUnmount() {
    // 清理定时器，防止内存泄漏
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
};
</script>

<style lang="scss" scoped>
.featured-apps-manager {
  .section-header {
    margin-bottom: 1.5rem;

    h2 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .search-bar {
    margin-bottom: 1.5rem;

    input {
      width: 100%;
      padding: 0.75rem;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background-color: var(--card-bg);
      color: var(--text-primary);
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: #007bff;
      }
    }
  }

  .app-list {
    .loading-state,
    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: var(--text-secondary);

      button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: var(--accent-primary);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    }

    .app-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;

      .app-card {
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
        background-color: var(--card-bg);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        position: relative;

        &.featured {
          border: 2px solid var(--success, #28a745);

          &::before {
            content: 'Featured';
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: var(--success, #28a745);
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
          margin-bottom: 1rem;

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
            margin: 0 0 0.5rem 0;
            color: var(--text-primary);
          }

          p {
            margin: 0 0 0.5rem 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
          }

          .status {
            font-size: 0.8rem;
            text-transform: capitalize;
          }
        }

        .app-actions {
          margin-top: 1rem;

          button {
            width: 100%;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            transition: all 0.2s ease;

            &:hover {
              background-color: var(--surface-secondary);
            }

            &.featured-btn {
              background-color: var(--success, #28a745);
              color: white;
              border: none;

              &:hover {
                background-color: var(--success-dark, #218838);
              }
            }
          }
        }
      }
    }
  }
}
</style>
