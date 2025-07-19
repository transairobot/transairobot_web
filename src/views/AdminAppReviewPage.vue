<template>
  <div class="admin-app-review-page">
    <AppHeader />
    <main>
      <div class="container">
        <h1>Application Review</h1>

        <div class="review-interface">
          <div class="queue-panel">
            <AppReviewQueue :selectedApp="selectedApp" @select-app="selectApp" />
          </div>
          <div class="detail-panel">
            <AppReviewDetail
              :app="selectedApp"
              @review-complete="handleReviewComplete"
              @show-notification="showNotification"
            />
          </div>
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
import AppReviewQueue from '../components/admin/AppReviewQueue.vue';
import AppReviewDetail from '../components/admin/AppReviewDetail.vue';
import NotificationToast from '../components/common/NotificationToast.vue';
import { mapActions } from 'vuex';

export default {
  name: 'AdminAppReviewPage',
  components: {
    AppHeader,
    AppFooter,
    AppReviewQueue,
    AppReviewDetail,
    NotificationToast
  },
  data() {
    return {
      selectedApp: null,
      notification: null
    };
  },
  methods: {
    ...mapActions('admin', ['fetchPendingApps']),
    selectApp(app) {
      this.selectedApp = app;
    },
    handleReviewComplete() {
      // Remove the app from the list after review
      this.selectedApp = null;
      // Refresh the pending apps list
      this.fetchPendingApps();
    },
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
.admin-app-review-page {
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

  .review-interface {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: $spacing-xl;
    height: calc(100vh - 300px);
    min-height: 500px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;

    .queue-panel,
    .detail-panel {
      height: 100%;
      overflow: hidden;
    }
  }
}

@media (max-width: 768px) {
  .review-interface {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;

    .queue-panel {
      max-height: 300px;
    }
  }
}
</style>
