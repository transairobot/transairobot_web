<template>
  <div class="admin-dashboard-page">
    <AppHeader />
    <main>
      <div class="container">
        <h1>Admin Dashboard</h1>

        <div class="admin-nav">
          <router-link to="/admin/review" class="admin-nav-card">
            <div class="card-icon">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <div class="card-content">
              <h3>Application Review</h3>
              <p>Review and approve submitted applications</p>
              <div class="badge" v-if="pendingAppsCount > 0">{{ pendingAppsCount }}</div>
            </div>
          </router-link>

          <router-link to="/admin/store" class="admin-nav-card">
            <div class="card-icon">
              <i class="fas fa-store"></i>
            </div>
            <div class="card-content">
              <h3>Store Management</h3>
              <p>Manage categories and featured applications</p>
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

          <router-link to="/admin/analytics" class="admin-nav-card">
            <div class="card-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="card-content">
              <h3>Analytics</h3>
              <p>View application usage and download statistics</p>
            </div>
          </router-link>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'AdminDashboardPage',
  components: {
    AppHeader,
    AppFooter
  },
  computed: {
    ...mapState('admin', ['pendingApps']),
    pendingAppsCount() {
      return this.pendingApps ? this.pendingApps.length : 0;
    }
  },
  methods: {
    ...mapActions('admin', ['fetchPendingApps'])
  },
  created() {
    this.fetchPendingApps();
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
    padding: $spacing-2xl 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 $spacing-md;

      h1 {
        margin-bottom: $spacing-xl;
      }
    }
  }

  .admin-nav {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-lg;

    .admin-nav-card {
      display: flex;
      padding: $spacing-lg;
      background-color: var(--bg-secondary);
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      }

      .card-icon {
        font-size: 2rem;
        margin-right: $spacing-md;
        color: var(--accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
      }

      .card-content {
        flex: 1;

        h3 {
          margin: 0 0 $spacing-sm 0;
          color: var(--text-primary);
        }

        p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .badge {
          position: absolute;
          top: $spacing-sm;
          right: $spacing-sm;
          background-color: var(--accent-secondary);
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
