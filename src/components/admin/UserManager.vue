<template>
  <div class="user-manager">
    <div class="section-header">
      <h2>User Management</h2>
      <p>Manage user accounts and permissions</p>
    </div>

    <!-- 搜索和筛选 -->
    <div class="user-controls">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          @input="searchUsers"
          type="text"
          placeholder="Search users by name or email..."
          class="search-input"
        />
      </div>

      <div class="user-filters">
        <select v-model="userFilters.role" @change="filterUsers" class="filter-select">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select v-model="userFilters.status" @change="filterUsers" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <div v-if="loading" class="loading-state">
        <p>Loading users...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="empty-state">
        <p>No users found</p>
      </div>

      <div v-else class="users-grid">
        <div v-for="user in filteredUsers" :key="user.id" class="user-item">
          <div class="user-info">
            <strong>{{ user.nickname }}</strong>
            <span class="user-email">{{ user.email }}</span>
            <span class="user-role" :class="user.role">{{ user.role }}</span>
            <span class="user-date">Joined: {{ formatDate(user.createdAt) }}</span>
          </div>
          <div class="user-actions">
            <button v-if="!user.isDisabled" @click="disableUser(user.id)" class="btn-danger">
              Disable
            </button>
            <button v-else @click="enableUser(user.id)" class="btn-success">Enable</button>
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
import { formatDate } from '@/utils/format';

export default {
  name: 'UserManager',
  emits: ['show-notification'],
  data() {
    return {
      users: [],
      filteredUsers: [],
      loading: false,
      error: null,
      searchQuery: '',
      searchTimeout: null,
      userFilters: {
        role: '',
        status: ''
      },
      // 分页相关
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0
    };
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;

      try {
        const result = await adminService.getUsers({
          page: this.currentPage,
          limit: this.pageSize,
          role: this.userFilters.role || undefined,
          status: this.userFilters.status || undefined,
          search: this.searchQuery || undefined
        });

        // 处理新的响应格式 - API 服务已经提取了 data 字段
        let usersData = [];
        let total = 0;

        if (result) {
          // API 服务返回的直接是 data 内容: { items: [...], pagination: { total: 2 } }
          if (result.items && Array.isArray(result.items)) {
            usersData = result.items;
            total = result.pagination ? result.pagination.total : result.items.length;
          }
          // 兼容旧格式: 直接是数组
          else if (Array.isArray(result)) {
            usersData = result;
            total = result.length;
          }
          // 兼容其他格式
          else if (result.data && result.data.items) {
            usersData = result.data.items;
            total = result.data.pagination
              ? result.data.pagination.total
              : result.data.items.length;
          }
        }

        this.users = usersData;
        this.filteredUsers = [...this.users];
        this.totalItems = total;
        this.totalPages = Math.ceil(total / this.pageSize);
      } catch (error) {
        this.error = 'Failed to load users';
        this.users = [];
        this.filteredUsers = [];
        this.totalItems = 0;
        this.totalPages = 0;
      } finally {
        this.loading = false;
      }
    },

    searchUsers() {
      // 清除之前的定时器
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // 设置新的定时器，500ms后执行搜索
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1; // 搜索时重置到第一页
        this.fetchUsers();
      }, 500);
    },

    filterUsers() {
      this.currentPage = 1; // 筛选时重置到第一页
      this.fetchUsers();
    },

    async disableUser(userId) {
      try {
        await adminService.disableUser(userId);
        this.$emit('show-notification', {
          type: 'success',
          message: 'User disabled successfully'
        });
        this.fetchUsers(); // 重新加载用户列表
      } catch (error) {
        this.$emit('show-notification', {
          type: 'error',
          message: 'Failed to disable user'
        });
      }
    },

    async enableUser(userId) {
      try {
        await adminService.enableUser(userId);
        this.$emit('show-notification', {
          type: 'success',
          message: 'User enabled successfully'
        });
        this.fetchUsers(); // 重新加载用户列表
      } catch (error) {
        this.$emit('show-notification', {
          type: 'error',
          message: 'Failed to enable user'
        });
      }
    },

    formatDate(dateString) {
      return formatDate(dateString);
    },

    // 分页方法
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.fetchUsers();
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchUsers();
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchUsers();
      }
    },

    changePageSize(newSize) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.fetchUsers();
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
    }
  },
  created() {
    this.fetchUsers();
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.user-manager {
  .section-header {
    margin-bottom: $spacing-lg;

    h2 {
      margin: 0 0 $spacing-xs 0;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .user-controls {
    display: flex;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    flex-wrap: wrap;

    .search-bar {
      flex: 1;
      min-width: 300px;

      .search-input {
        width: 100%;
        padding: $spacing-sm;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--card-bg);
        color: var(--text-primary);

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
        }

        &::placeholder {
          color: var(--text-secondary);
        }
      }
    }

    .user-filters {
      display: flex;
      gap: $spacing-sm;

      .filter-select {
        padding: $spacing-sm;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--card-bg);
        color: var(--text-primary);
        min-width: 120px;

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
      }
    }
  }

  .user-list {
    .loading-state,
    .empty-state {
      text-align: center;
      padding: $spacing-xl;
      color: var(--text-secondary);
    }

    .users-grid {
      display: grid;
      gap: $spacing-md;
      margin-bottom: $spacing-lg;

      .user-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: $spacing-md;
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: $spacing-xs;

          strong {
            color: var(--text-primary);
            font-size: 1.1rem;
          }

          .user-email {
            color: var(--text-secondary);
            font-size: 0.9rem;
          }

          .user-role {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
            text-transform: uppercase;

            &.admin {
              background-color: #e3f2fd;
              color: #1976d2;
            }

            &.user {
              background-color: #f3e5f5;
              color: #7b1fa2;
            }
          }

          .user-date {
            color: var(--text-secondary);
            font-size: 0.8rem;
          }
        }

        .user-actions {
          display: flex;
          gap: $spacing-xs;

          .btn-danger,
          .btn-success {
            padding: $spacing-xs $spacing-sm;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s ease;

            &:hover {
              transform: translateY(-1px);
            }
          }

          .btn-danger {
            background-color: #f44336;
            color: white;

            &:hover {
              background-color: #d32f2f;
            }
          }

          .btn-success {
            background-color: #4caf50;
            color: white;

            &:hover {
              background-color: #388e3c;
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

@media (max-width: 768px) {
  .user-manager {
    .user-controls {
      flex-direction: column;

      .search-bar {
        min-width: auto;
      }

      .user-filters {
        justify-content: stretch;

        .filter-select {
          flex: 1;
        }
      }
    }

    .users-grid .user-item {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-sm;

      .user-actions {
        align-self: stretch;
        justify-content: flex-end;
      }
    }

    .pagination-container {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;

      .pagination-controls {
        justify-content: center;
      }
    }
  }
}
</style>
