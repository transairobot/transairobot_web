<template>
  <div class="app-analytics">
    <div class="analytics-header">
      <h3>Application Analytics</h3>
      <div class="time-filter">
        <select v-model="timeRange" class="time-select">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <LoadingState message="Loading analytics data..." />
    </div>

    <div v-else class="analytics-content">
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="analytics-value">{{ analytics.downloads }}</div>
          <div class="analytics-label">Downloads</div>
          <div class="analytics-trend" :class="getTrendClass(analytics.downloadsTrend)">
            {{ analytics.downloadsTrend > 0 ? '+' : '' }}{{ analytics.downloadsTrend }}%
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-value">{{ analytics.activeInstalls }}</div>
          <div class="analytics-label">Active Installs</div>
          <div class="analytics-trend" :class="getTrendClass(analytics.activeInstallsTrend)">
            {{ analytics.activeInstallsTrend > 0 ? '+' : '' }}{{ analytics.activeInstallsTrend }}%
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-value">{{ analytics.averageRating.toFixed(1) }}</div>
          <div class="analytics-label">Average Rating</div>
          <div class="analytics-trend" :class="getTrendClass(analytics.ratingTrend)">
            {{ analytics.ratingTrend > 0 ? '+' : '' }}{{ analytics.ratingTrend }}%
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-value">{{ analytics.crashRate.toFixed(2) }}%</div>
          <div class="analytics-label">Crash Rate</div>
          <div class="analytics-trend" :class="getTrendClass(-analytics.crashRateTrend)">
            {{ analytics.crashRateTrend > 0 ? '+' : '' }}{{ analytics.crashRateTrend }}%
          </div>
        </div>
      </div>

      <div class="chart-container">
        <h4>Downloads Over Time</h4>
        <div class="chart-placeholder">
          <!-- In a real implementation, this would be a chart component -->
          <div class="chart-bars">
            <div
              v-for="(value, index) in analytics.downloadHistory"
              :key="index"
              class="chart-bar"
              :style="{ height: `${(value / Math.max(...analytics.downloadHistory)) * 100}%` }"
            ></div>
          </div>
          <div class="chart-labels">
            <span v-for="(label, index) in getChartLabels()" :key="index">{{ label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue';
import LoadingState from '../common/LoadingState.vue';
import developerService from '../../services/developer.service';

export default {
  name: 'AppAnalytics',
  components: {
    LoadingState
  },
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const loading = ref(true);
    const timeRange = ref('30');
    const analytics = reactive({
      downloads: 0,
      downloadsTrend: 0,
      activeInstalls: 0,
      activeInstallsTrend: 0,
      averageRating: 0,
      ratingTrend: 0,
      crashRate: 0,
      crashRateTrend: 0,
      downloadHistory: []
    });

    const fetchAnalytics = async () => {
      loading.value = true;
      try {
        // In a real implementation, this would call the API
        // const response = await developerService.getAppAnalytics(props.appId, timeRange.value);

        // Mock data for demonstration
        setTimeout(() => {
          // Simulate API response
          const mockData = {
            downloads: 1245,
            downloadsTrend: 12.5,
            activeInstalls: 876,
            activeInstallsTrend: 8.2,
            averageRating: 4.7,
            ratingTrend: 2.1,
            crashRate: 0.42,
            crashRateTrend: -0.15,
            downloadHistory: generateRandomData(timeRange.value)
          };

          // Update reactive object
          Object.assign(analytics, mockData);
          loading.value = false;
        }, 800);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        loading.value = false;
      }
    };

    const generateRandomData = days => {
      const data = [];
      const count = days === '7' ? 7 : days === '30' ? 10 : days === '90' ? 12 : 12;

      for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * 100) + 20);
      }

      return data;
    };

    const getTrendClass = trend => {
      if (trend > 0) return 'trend-up';
      if (trend < 0) return 'trend-down';
      return 'trend-neutral';
    };

    const getChartLabels = () => {
      const days = parseInt(timeRange.value);
      const labels = [];
      const today = new Date();

      if (days === 7) {
        // Show each day of the week
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
      } else if (days === 30) {
        // Show last few weeks
        for (let i = 0; i < 10; i++) {
          labels.push(`W${i + 1}`);
        }
      } else {
        // Show months
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ];
        for (let i = 0; i < 12; i++) {
          labels.push(months[i]);
        }
      }

      return labels;
    };

    // Watch for changes in timeRange or appId
    watch([() => timeRange.value, () => props.appId], () => {
      fetchAnalytics();
    });

    onMounted(() => {
      fetchAnalytics();
    });

    return {
      loading,
      timeRange,
      analytics,
      getTrendClass,
      getChartLabels
    };
  }
};
</script>

<style lang="scss" scoped>
.app-analytics {
  margin-bottom: 2rem;

  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h3 {
      margin: 0;
      font-size: 1.25rem;
    }

    .time-select {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border-color);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.9rem;

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
      }
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }

  .analytics-content {
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;

      .analytics-card {
        background: var(--bg-secondary);
        border-radius: 0.75rem;
        padding: 1.5rem;
        text-align: center;
        box-shadow: var(--shadow-sm);
        position: relative;

        .analytics-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .analytics-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .analytics-trend {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;

          &.trend-up {
            background-color: rgba(var(--success-rgb), 0.2);
            color: var(--success-color);
          }

          &.trend-down {
            background-color: rgba(var(--error-rgb), 0.2);
            color: var(--error-color);
          }

          &.trend-neutral {
            background-color: rgba(var(--info-rgb), 0.2);
            color: var(--info-color);
          }
        }
      }
    }

    .chart-container {
      background: var(--bg-secondary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);

      h4 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-size: 1.1rem;
      }

      .chart-placeholder {
        height: 200px;
        position: relative;

        .chart-bars {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 80%;

          .chart-bar {
            flex: 1;
            margin: 0 2px;
            background: linear-gradient(to top, var(--accent-primary), var(--accent-secondary));
            border-radius: 4px 4px 0 0;
            min-height: 4px;
            transition: height 0.3s ease;
          }
        }

        .chart-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;

          span {
            font-size: 0.8rem;
            color: var(--text-secondary);
          }
        }
      }
    }
  }
}
</style>
