<template>
  <div class="admin-user-management-page">
    <AppHeader />
    <main class="main-content">
      <div class="container">
        <UserManager @show-notification="showNotification" />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import UserManager from '@/components/admin/UserManager.vue';
import { notificationService } from '@/services';

export default {
  name: 'AdminUserManagementPage',
  components: {
    AppHeader,
    AppFooter,
    UserManager
  },
  methods: {
    showNotification(notification) {
      if (notification.type === 'success') {
        notificationService.success(notification.message);
      } else if (notification.type === 'error') {
        notificationService.error(notification.message);
      } else if (notification.type === 'warning') {
        notificationService.warning(notification.message);
      } else {
        notificationService.info(notification.message);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-user-management-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);

  .main-content {
    flex: 1;
    padding: $spacing-lg 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 $spacing-md;
    }
  }
}
</style>
