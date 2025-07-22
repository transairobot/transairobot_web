<template>
  <div class="developer-portal-page">
    <AppHeader />
    <main>
      <AppContainer>
        <div class="portal-header">
          <h1>Developer Portal</h1>
          <p class="portal-subtitle">Create and manage applications for TransAIRobot devices</p>
        </div>

        <div v-if="loading" class="loading-container">
          <LoadingState message="Loading developer portal..." />
        </div>

        <template v-else>
          <!-- Show registration form for users who are not developers -->
          <div v-if="!isDeveloper && !isPendingDeveloper" class="registration-section">
            <AppCard variant="primary">
              <div class="registration-header">
                <h2>Become a Developer</h2>
                <p>
                  Join our developer program to create and publish applications for TransAIRobot
                  devices.
                </p>
              </div>
              <DeveloperRegistrationForm />
            </AppCard>
          </div>

          <!-- Show pending verification message for users with pending status -->
          <div v-else-if="isPendingDeveloper" class="verification-section">
            <VerificationPending />
          </div>

          <!-- Show dashboard for approved developers -->
          <div v-else-if="isDeveloper" class="dashboard-section">
            <DeveloperDashboard />
          </div>
        </template>
      </AppContainer>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import AppContainer from '../components/common/AppContainer.vue';
import AppCard from '../components/common/AppCard.vue';
import LoadingState from '../components/common/LoadingState.vue';
import DeveloperRegistrationForm from '../components/developer/DeveloperRegistrationForm.vue';
import VerificationPending from '../components/developer/VerificationPending.vue';
import DeveloperDashboard from '../components/developer/DeveloperDashboard.vue';

export default {
  name: 'DeveloperPortalPage',
  components: {
    AppHeader,
    AppFooter,
    AppContainer,
    AppCard,
    LoadingState,
    DeveloperRegistrationForm,
    VerificationPending,
    DeveloperDashboard
  },
  setup() {
    const store = useStore();
    const loading = ref(true);

    const currentUser = computed(() => store.getters['auth/currentUser']);

    const isDeveloper = computed(() => {
      return (
        currentUser.value &&
        (currentUser.value.role === 'developer' ||
          currentUser.value.role === 'admin' ||
          currentUser.value.developerStatus === 'approved')
      );
    });

    const isPendingDeveloper = computed(() => {
      return currentUser.value && currentUser.value.developerStatus === 'pending';
    });

    onMounted(() => {
      // 移除模拟的loading延迟，立即显示内容避免布局跳跃
      loading.value = false;
    });

    return {
      loading,
      currentUser,
      isDeveloper,
      isPendingDeveloper
    };
  }
};
</script>

<style lang="scss" scoped>
.developer-portal-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // 确保页面总是可以滚动
  overflow-y: auto;

  main {
    flex: 1;
    padding: 2rem 0;
    // 设置最小高度确保内容区域足够高
    min-height: calc(100vh - 160px); // 减去header和footer的估计高度
  }

  .portal-header {
    text-align: center;
    margin-bottom: 2.5rem;

    h1 {
      margin-bottom: 0.5rem;
      font-size: 2.5rem;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
    }

    .portal-subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    padding: 3rem 0;
    // 确保loading状态时也有足够的高度
    min-height: 400px;
  }

  .registration-section {
    max-width: 800px;
    margin: 0 auto;

    .registration-header {
      text-align: center;
      margin-bottom: 2rem;

      h2 {
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--text-secondary);
      }
    }
  }

  // 确保仪表板和验证等待页面也有合适的高度
  .dashboard-section,
  .verification-section {
    min-height: 600px;
  }
}
</style>
