<template>
  <div class="admin-dashboard-page">
    <AppHeader />
    <main>
      <div class="container">
        <h1>Admin Dashboard</h1>

        <!-- System Statistics -->
        <div class="stats-grid" v-if="systemStats">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3>{{ systemStats.totalUsers }}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <div class="stat-content">
              <h3>{{ systemStats.totalApplications }}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-robot"></i>
            </div>
            <div class="stat-content">
              <h3>{{ systemStats.totalRobots }}</h3>
              <p>Total Robots</p>
            </div>
          </div>
        </div>

        <div class="admin-nav">
          <router-link to="/admin/store" class="admin-nav-card">
            <div class="card-icon">
              <i class="fas fa-store"></i>
            </div>
            <div class="card-content">
              <h3>Store Management</h3>
              <p>Manage categories and applications</p>
            </div>
          </router-link>

          <div class="admin-nav-card" @click="showUserManagement = true">
            <div class="card-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="card-content">
              <h3>User Management</h3>
              <p>Manage user accounts and permissions</p>
            </div>
          </div>

          <div class="admin-nav-card" @click="showAnalytics = true">
            <div class="card-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="card-content">
              <h3>Analytics</h3>
              <p>View system usage statistics</p>
            </div>
          </div>
        </div>

        <!-- User Management Modal -->
        <div v-if="showUserManagement" class="modal-overlay" @click="showUserManagement = false">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>User Management</h2>
              <button @click="showUserManagement = false" class="close-btn">×</button>
            </div>
            <div class="modal-body">
              <div class="user-filters">
                <select v-model="userFilters.role" @change="loadUsers">
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <select v-model="userFilters.status" @change="loadUsers">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div class="user-list">
                <div v-for="user in users" :key="user.id" class="user-item">
                  <div class="user-info">
                    <strong>{{ user.nickname }}</strong>
                    <span class="user-email">{{ user.email }}</span>
                    <span class="user-role" :class="user.role">{{ user.role }}</span>
                  </div>
                  <div class="user-actions">
                    <button
                      v-if="!user.isDisabled"
                      @click="disableUser(user.id)"
                      class="btn-danger"
                    >
                      Disable
                    </button>
                    <button v-else @click="enableUser(user.id)" class="btn-success">Enable</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Modal -->
        <div v-if="showAnalytics" class="modal-overlay" @click="showAnalytics = false">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>Analytics</h2>
              <button @click="showAnalytics = false" class="close-btn">×</button>
            </div>
            <div class="modal-body">
              <div class="analytics-content">
                <p>Analytics functionality is under development...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import { adminService } from '@/services';

export default {
  name: 'AdminDashboardPage',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      systemStats: null,
      users: [],
      showUserManagement: false,
      showAnalytics: false,
      userFilters: {
        role: '',
        status: ''
      },
      loading: false
    };
  },
  methods: {
    async loadSystemStats() {
      try {
        this.systemStats = await adminService.getSystemAnalytics();
      } catch (error) {
        console.error('Failed to load system stats:', error);
      }
    },

    async loadUsers() {
      if (!this.showUserManagement) return;

      try {
        this.loading = true;
        const result = await adminService.getUsers(this.userFilters);
        this.users = result.data || result;
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        this.loading = false;
      }
    },

    async disableUser(userId) {
      try {
        await adminService.disableUser(userId);
        await this.loadUsers();
      } catch (error) {
        console.error('Failed to disable user:', error);
      }
    },

    async enableUser(userId) {
      try {
        await adminService.enableUser(userId);
        await this.loadUsers();
      } catch (error) {
        console.error('Failed to enable user:', error);
      }
    }
  },
  watch: {
    showUserManagement(newVal) {
      if (newVal) {
        this.loadUsers();
      }
    }
  },
  created() {
    this.loadSystemStats();
  }
};
</script>

<style lang="scss" scoped>
.admin-dashboard-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: 2rem 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;

      h1 {
        margin-bottom: 2rem;
        color: var(--text-primary);
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    .stat-card {
      background: var(--card-bg);
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: var(--shadow);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--card-hover-shadow);
      }

      .stat-icon {
        font-size: 2rem;
        color: var(--accent-primary);
        width: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-content {
        flex: 1;

        h3 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
      }
    }
  }

  .admin-nav {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;

    .admin-nav-card {
      display: flex;
      padding: 1.5rem;
      background-color: var(--card-bg);
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.2s ease;
      cursor: pointer;
      box-shadow: var(--shadow);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--card-hover-shadow);
        color: var(--text-primary);
      }

      .card-icon {
        font-size: 2rem;
        margin-right: 1rem;
        color: var(--accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
      }

      .card-content {
        flex: 1;

        h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
      }
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--card-bg);
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      color: var(--text-primary);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary);

      &:hover {
        color: var(--text-primary);
      }
    }
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }

  .user-filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;

    select {
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--input-bg);
      color: var(--input-text);
    }
  }

  .user-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 4px;

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .user-email {
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      .user-role {
        font-size: 0.8rem;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        color: white;

        &.admin {
          background: var(--danger);
        }

        &.user {
          background: var(--success);
        }
      }
    }

    .user-actions {
      .btn-danger {
        background: var(--danger);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: var(--error);
        }
      }

      .btn-success {
        background: var(--success);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          opacity: 0.9;
        }
      }
    }
  }

  .analytics-content {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }
}
</style>
