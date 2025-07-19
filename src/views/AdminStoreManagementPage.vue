<template>
  <div class="admin-store-management-page">
    <AppHeader />
    <main>
      <div class="container">
        <h1>Store Management</h1>

        <div class="management-tabs">
          <div
            class="tab"
            :class="{ active: activeTab === 'featured' }"
            @click="activeTab = 'featured'"
          >
            Featured Apps
          </div>
          <div
            class="tab"
            :class="{ active: activeTab === 'categories' }"
            @click="activeTab = 'categories'"
          >
            Categories
          </div>
          <div class="tab" :class="{ active: activeTab === 'bulk' }" @click="activeTab = 'bulk'">
            Bulk Actions
          </div>
        </div>

        <div class="tab-content">
          <FeaturedAppsManager v-if="activeTab === 'featured'" />
          <CategoryManager v-else-if="activeTab === 'categories'" />
          <BulkActionsManager v-else-if="activeTab === 'bulk'" />
        </div>
      </div>
    </main>
    <AppFooter />

    <NotificationToast
      v-if="notification"
      :message="notification.message"
      :type="notification.type"
      @close="notification = null"
    />
  </div>
</template>

<script>
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import FeaturedAppsManager from '../components/admin/FeaturedAppsManager.vue';
import CategoryManager from '../components/admin/CategoryManager.vue';
import BulkActionsManager from '../components/admin/BulkActionsManager.vue';
import NotificationToast from '../components/common/NotificationToast.vue';

export default {
  name: 'AdminStoreManagementPage',
  components: {
    AppHeader,
    AppFooter,
    FeaturedAppsManager,
    CategoryManager,
    BulkActionsManager,
    NotificationToast
  },
  data() {
    return {
      activeTab: 'featured',
      notification: null
    };
  },
  methods: {
    showNotification(notification) {
      this.notification = notification;

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        if (this.notification === notification) {
          this.notification = null;
        }
      }, 5000);
    }
  }
};
</script>

<style lang="scss" scoped>
.admin-store-management-page {
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

  .management-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: $spacing-xl;

    .tab {
      padding: $spacing-md $spacing-lg;
      cursor: pointer;
      font-weight: 500;
      color: var(--text-secondary);
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;

      &:hover {
        color: var(--text-primary);
      }

      &.active {
        color: var(--accent-primary);
        border-bottom-color: var(--accent-primary);
      }
    }
  }

  .tab-content {
    min-height: 400px;
  }
}
</style>
