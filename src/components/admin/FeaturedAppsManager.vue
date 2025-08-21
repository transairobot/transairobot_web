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
            <div class="app-categories">
              <template v-if="app.category && app.category.length > 0">
                <span
                  v-for="categoryName in app.category"
                  :key="categoryName"
                  class="category-badge"
                >
                  {{ categoryName }}
                </span>
              </template>
              <span v-else class="no-category">No Categories</span>
            </div>
            <p class="status">Status: {{ app.status || 'active' }}</p>
          </div>
          <div class="app-actions">
            <button @click="toggleFeature(app)" :class="{ 'featured-btn': app.featured }">
              {{ app.featured ? 'Unfeature' : 'Feature' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <div class="pagination-info">
          <span
            >显示 {{ (currentPage - 1) * pageSize + 1 }} -
            {{ Math.min(currentPage * pageSize, totalItems) }} 条，共 {{ totalItems }} 条</span
          >
          <select v-model="pageSize" @change="changePageSize(pageSize)" class="page-size-selector">
            <option :value="10">10 条/页</option>
            <option :value="20">20 条/页</option>
            <option :value="50">50 条/页</option>
            <option :value="100">100 条/页</option>
          </select>
        </div>

        <div class="pagination-controls">
          <button @click="previousPage" :disabled="currentPage === 1" class="pagination-btn">
            上一页
          </button>

          <div class="page-numbers">
            <button
              v-for="page in getVisiblePages()"
              :key="page"
              @click="goToPage(page)"
              :class="['page-btn', { active: page === currentPage, ellipsis: page === '...' }]"
              :disabled="page === '...'"
            >
              {{ page }}
            </button>
          </div>

          <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
            下一页
          </button>
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
      searchTimeout: null, // 添加防抖定时器
      // 分页相关
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0
    };
  },
  methods: {
    async fetchApps() {
      this.loading = true;

      try {
        const result = await adminService.getFeaturedApplicationsForAdmin({
          page: this.currentPage,
          limit: this.pageSize,
          name: this.searchQuery || undefined
        });

        // 处理新的响应格式
        let appsData = [];
        let total = 0;

        // 处理新的响应格式 - API 服务已经提取了 data 字段
        if (result) {
          // API 服务返回的直接是 data 内容: { items: [...], pagination: { total: 1 } }
          if (result.items && Array.isArray(result.items)) {
            appsData = result.items;
            total = result.pagination ? result.pagination.total : result.items.length;
          }
          // 兼容旧格式: 直接是数组
          else if (Array.isArray(result)) {
            appsData = result;
            total = result.length;
          }
          // 兼容其他格式 (如果 API 服务没有提取 data)
          else if (result.data && result.data.items) {
            appsData = result.data.items;
            total = result.data.pagination
              ? result.data.pagination.total
              : result.data.items.length;
          }
          // 兼容索引对象格式: {0: {...}, 1: {...}}
          else if (typeof result === 'object' && !Array.isArray(result)) {
            const keys = Object.keys(result);
            const isIndexedObject = keys.length > 0 && keys.every(key => /^\d+$/.test(key));

            if (isIndexedObject) {
              appsData = Object.values(result);
              total = appsData.length;
            }
          }
        }

        this.apps = appsData.map(app => ({
          ...app,
          featured: app.isFeatured || app.featured // 将 isFeatured 映射为 featured
        }));

        this.filteredApps = [...this.apps];
        this.totalItems = total;
        this.totalPages = Math.ceil(total / this.pageSize);
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
        this.currentPage = 1; // 搜索时重置到第一页
        this.fetchApps();
      }, 500);
    },

    // 分页方法
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.fetchApps();
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchApps();
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchApps();
      }
    },

    changePageSize(newSize) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.fetchApps();
    },

    // 计算可见的页码
    getVisiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;

      if (total <= 7) {
        // 总页数少于等于7页，显示所有页码
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // 总页数大于7页，显示省略号
        if (current <= 4) {
          // 当前页在前面
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          // 当前页在后面
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) {
            pages.push(i);
          }
        } else {
          // 当前页在中间
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }

      return pages;
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

          .app-categories {
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
            margin-bottom: 0.5rem;

            .category-badge {
              padding: 0.2rem 0.5rem;
              background-color: var(--accent-primary);
              color: white;
              border-radius: 12px;
              font-size: 0.75rem;
              font-weight: 500;
            }

            .no-category {
              color: var(--text-secondary);
              font-style: italic;
              font-size: 0.8rem;
            }
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

  // 分页样式
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    padding: 1rem 0;
    border-top: 1px solid var(--border-color);

    .pagination-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--text-secondary);
      font-size: 0.9rem;

      .page-size-selector {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--card-bg);
        color: var(--text-primary);
        font-size: 0.9rem;
      }
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .pagination-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--card-bg);
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          background-color: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .page-numbers {
        display: flex;
        gap: 0.25rem;

        .page-btn {
          min-width: 2.5rem;
          height: 2.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--card-bg);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;

          &:hover:not(:disabled):not(.ellipsis) {
            background-color: var(--accent-primary);
            color: white;
            border-color: var(--accent-primary);
          }

          &.active {
            background-color: var(--accent-primary);
            color: white;
            border-color: var(--accent-primary);
          }

          &.ellipsis {
            border: none;
            background: none;
            cursor: default;
            color: var(--text-secondary);
          }

          &:disabled {
            cursor: not-allowed;
          }
        }
      }
    }
  }
}
</style>
