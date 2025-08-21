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

          <router-link to="/admin/users" class="admin-nav-card">
            <div class="card-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="card-content">
              <h3>User Management</h3>
              <p>Manage user accounts and permissions</p>
            </div>
          </router-link>

          <div class="admin-nav-card" @click="$router.push('/admin/analytics')">
            <div class="card-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="card-content">
              <h3>Analytics</h3>
              <p>View system usage statistics</p>
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

  .analytics-content {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }
}
</style>
