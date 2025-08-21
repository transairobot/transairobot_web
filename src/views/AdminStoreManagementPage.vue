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
          <div class="tab" :class="{ active: activeTab === 'apps' }" @click="activeTab = 'apps'">
            Apps
          </div>
          <div
            class="tab"
            :class="{ active: activeTab === 'categories' }"
            @click="activeTab = 'categories'"
          >
            Categories
          </div>
        </div>

        <div class="tab-content">
          <FeaturedAppsManager v-if="activeTab === 'featured'" />
          <AppsManager v-else-if="activeTab === 'apps'" />
          <CategoryManager v-else-if="activeTab === 'categories'" />
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import FeaturedAppsManager from '../components/admin/FeaturedAppsManager.vue';
import AppsManager from '../components/admin/AppsManager.vue';
import CategoryManager from '../components/admin/CategoryManager.vue';

export default {
  name: 'AdminStoreManagementPage',
  components: {
    AppHeader,
    AppFooter,
    FeaturedAppsManager,
    AppsManager,
    CategoryManager
  },
  data() {
    return {
      activeTab: 'featured'
    };
  },
  created() {
    // 检查URL参数中是否指定了tab
    const tabFromQuery = this.$route.query.tab;
    if (tabFromQuery && ['featured', 'apps', 'categories'].includes(tabFromQuery)) {
      this.activeTab = tabFromQuery;
    }
  },
  watch: {
    // 监听路由变化，更新活动tab
    '$route.query.tab'(newTab) {
      if (newTab && ['featured', 'apps', 'categories'].includes(newTab)) {
        this.activeTab = newTab;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-store-management-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: $spacing-xl 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 $spacing-md;

      h1 {
        margin-bottom: $spacing-xl;
        color: var(--text-primary);
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
