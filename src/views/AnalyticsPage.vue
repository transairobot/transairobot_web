<template>
  <div class="analytics-page">
    <AppHeader />

    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1>Analytics Dashboard</h1>
          <p>Monitor system performance and usage statistics</p>
        </div>

        <div class="analytics-nav">
          <div
            class="nav-card"
            :class="{ active: activeTab === 'users' }"
            @click="activeTab = 'users'"
          >
            <div class="card-content">
              <h3>User Analytics</h3>
              <p>Track user registrations and activity</p>
            </div>
          </div>

          <div
            class="nav-card"
            :class="{ active: activeTab === 'applications' }"
            @click="activeTab = 'applications'"
          >
            <div class="card-content">
              <h3>Application Analytics</h3>
              <p>Monitor app submissions and usage</p>
            </div>
          </div>

          <div
            class="nav-card"
            :class="{ active: activeTab === 'robots' }"
            @click="activeTab = 'robots'"
          >
            <div class="card-content">
              <h3>Robot Analytics</h3>
              <p>View robot registrations and connections</p>
            </div>
          </div>
        </div>

        <div class="analytics-content">
          <UserAnalytics v-if="activeTab === 'users'" />
          <ApplicationAnalytics v-if="activeTab === 'applications'" />
          <RobotAnalytics v-if="activeTab === 'robots'" />
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script>
import { ref } from 'vue';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import UserAnalytics from '../components/analytics/UserAnalytics.vue';
import ApplicationAnalytics from '../components/analytics/ApplicationAnalytics.vue';
import RobotAnalytics from '../components/analytics/RobotAnalytics.vue';

export default {
  name: 'AnalyticsPage',
  components: {
    AppHeader,
    AppFooter,
    UserAnalytics,
    ApplicationAnalytics,
    RobotAnalytics
  },
  setup() {
    const activeTab = ref('users');

    return {
      activeTab
    };
  }
};
</script>

<style lang="scss" scoped>
.analytics-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0;
  }
}

.analytics-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  .nav-card {
    background: var(--bg-secondary);
    border-radius: 1rem;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    box-shadow: var(--shadow-sm);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    &.active {
      border-color: var(--accent-primary);
      background: linear-gradient(135deg, var(--accent-primary) 10, var(--bg-secondary));
    }

    .card-content {
      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
      }

      p {
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.5;
      }
    }
  }
}

.analytics-content {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  min-height: 500px;
}

@media (max-width: 768px) {
  .analytics-nav {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .container {
    padding: 0 0.5rem;
  }
}
</style>
