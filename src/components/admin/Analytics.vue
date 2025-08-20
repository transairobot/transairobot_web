<template>
  <div class="analytics-dashboard">
    <div class="analytics-header">
      <h3>System Analytics</h3>
      <div class="time-controls">
        <select v-model="selectedRange" @change="updateTimeRange" class="time-select">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <select v-model="granularity" @change="fetchAllData" class="granularity-select">
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading analytics data...</p>
    </div>

    <div v-else class="analytics-content">
      <!-- Users Chart -->
      <div class="chart-container">
        <h4>User Registrations</h4>
        <div class="chart-wrapper">
          <canvas ref="usersChart" width="400" height="200"></canvas>
        </div>
      </div>

      <!-- Applications Chart -->
      <div class="chart-container">
        <h4>Application Submissions</h4>
        <div class="chart-wrapper">
          <canvas ref="appsChart" width="400" height="200"></canvas>
        </div>
      </div>

      <!-- Robots Chart -->
      <div class="chart-container">
        <h4>Robot Registrations</h4>
        <div class="chart-wrapper">
          <canvas ref="robotsChart" width="400" height="200"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import adminService from '../../services/admin.service';

export default {
  name: 'AdminAnalytics',
  setup() {
    const loading = ref(true);
    const selectedRange = ref('30');
    const granularity = ref('day');

    const usersChart = ref(null);
    const appsChart = ref(null);
    const robotsChart = ref(null);

    const usersData = ref([]);
    const appsData = ref([]);
    const robotsData = ref([]);

    const getTimeRange = () => {
      const end = Math.floor(Date.now() / 1000);
      const start = end - parseInt(selectedRange.value) * 24 * 60 * 60;
      return { start, end, granularity: granularity.value };
    };

    const fetchAllData = async () => {
      loading.value = true;
      try {
        const timeRange = getTimeRange();

        const [users, apps, robots] = await Promise.all([
          adminService.getUserAnalytics(timeRange),
          adminService.getApplicationAnalytics(timeRange),
          adminService.getRobotAnalytics(timeRange)
        ]);

        usersData.value = users;
        appsData.value = apps;
        robotsData.value = robots;

        await nextTick();
        drawCharts();
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        loading.value = false;
      }
    };

    const updateTimeRange = () => {
      fetchAllData();
    };

    const drawCharts = () => {
      drawChart(usersChart.value, usersData.value, '#4F46E5');
      drawChart(appsChart.value, appsData.value, '#059669');
      drawChart(robotsChart.value, robotsData.value, '#DC2626');
    };

    const drawChart = (canvas, data, color) => {
      if (!canvas || !data.length) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Find max value for scaling
      const maxValue = Math.max(...data.map(d => d.value));
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      // Draw axes
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;

      // Y-axis
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.stroke();

      // X-axis
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Draw data
      if (data.length > 1) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '20';
        ctx.lineWidth = 2;

        const stepX = chartWidth / (data.length - 1);

        // Create path
        ctx.beginPath();
        data.forEach((point, index) => {
          const x = padding + index * stepX;
          const y = height - padding - (point.value / maxValue) * chartHeight;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        // Stroke the line
        ctx.stroke();

        // Fill area under curve
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fill();
      }

      // Draw labels
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';

      data.forEach((point, index) => {
        const x = padding + index * (chartWidth / (data.length - 1));
        const date = new Date(point.date);
        const label = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        ctx.fillText(label, x, height - 10);
      });
    };

    onMounted(() => {
      fetchAllData();
    });

    return {
      loading,
      selectedRange,
      granularity,
      usersChart,
      appsChart,
      robotsChart,
      updateTimeRange,
      fetchAllData
    };
  }
};
</script>

<style lang="scss" scoped>
.analytics-dashboard {
  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .time-controls {
      display: flex;
      gap: 1rem;

      select {
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
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    p {
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .analytics-content {
    display: grid;
    gap: 2rem;

    .chart-container {
      background: var(--bg-secondary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);

      h4 {
        margin: 0 0 1.5rem 0;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .chart-wrapper {
        width: 100%;
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;

        canvas {
          max-width: 100%;
          height: auto;
        }
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
