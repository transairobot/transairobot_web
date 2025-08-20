<template>
  <div class="robot-analytics">
    <div class="analytics-header">
      <h3>Robot Analytics</h3>
      <div class="time-controls">
        <select v-model="selectedRange" @change="updateTimeRange" class="time-select">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <select v-model="granularity" @change="fetchData" class="granularity-select">
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading robot analytics...</p>
    </div>

    <div v-else class="analytics-content">
      <div class="stats-summary">
        <div class="summary-item">
          <span class="label">Period Total:</span>
          <span class="value">{{ periodTotal }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Daily Average:</span>
          <span class="value">{{ averagePerDay }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Peak Day:</span>
          <span class="value">{{ peakValue }}</span>
        </div>
      </div>

      <div class="chart-container">
        <h4>Robot Registrations Over Time</h4>
        <div class="chart-wrapper">
          <canvas ref="robotChart" width="800" height="400"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import adminService from '../../services/admin.service';

export default {
  name: 'RobotAnalytics',
  setup() {
    const loading = ref(true);
    const selectedRange = ref('30');
    const granularity = ref('day');
    const robotChart = ref(null);
    const robotData = ref([]);

    const periodTotal = computed(() => {
      return Array.isArray(robotData.value)
        ? robotData.value.reduce((sum, point) => sum + point.value, 0)
        : 0;
    });

    const averagePerDay = computed(() => {
      if (!Array.isArray(robotData.value) || robotData.value.length === 0) return 0;
      const total = periodTotal.value;
      return Math.round((total / robotData.value.length) * 10) / 10;
    });

    const peakValue = computed(() => {
      return Array.isArray(robotData.value) && robotData.value.length > 0
        ? Math.max(...robotData.value.map(point => point.value))
        : 0;
    });

    const getTimeRange = () => {
      const end = Math.floor(Date.now() / 1000);
      const start = end - parseInt(selectedRange.value) * 24 * 60 * 60;
      return { start, end, granularity: granularity.value };
    };

    const fetchData = async () => {
      loading.value = true;
      try {
        const timeRange = getTimeRange();
        const result = await adminService.getRobotAnalytics(timeRange);
        robotData.value = Array.isArray(result) ? result : [];

        await nextTick();
        setTimeout(() => {
          drawChart();
        }, 100);
      } catch (error) {
        console.error('Error fetching robot analytics:', error);
        robotData.value = [];
      } finally {
        loading.value = false;
      }
    };

    const updateTimeRange = () => {
      fetchData();
    };

    const drawChart = () => {
      if (!robotChart.value || !Array.isArray(robotData.value) || !robotData.value.length) {
        return;
      }

      const canvas = robotChart.value;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // 清除画布
      ctx.clearRect(0, 0, width, height);

      const padding = 60;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      const maxValue = Math.max(...robotData.value.map(d => d.value));

      // 绘制网格和Y轴标签
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;

      const gridLines = 5;
      for (let i = 0; i <= gridLines; i++) {
        const y = padding + (chartHeight / gridLines) * i;

        // 水平网格线
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y轴标签
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        const value = Math.round(maxValue * (1 - i / gridLines));
        ctx.fillText(value.toString(), padding - 10, y + 4);
      }

      // 绘制数据
      if (robotData.value.length === 1) {
        // 单个数据点
        const point = robotData.value[0];
        const x = padding + chartWidth / 2;
        const y = height - padding - (point.value / maxValue) * chartHeight;

        // 绘制圆点
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();

        // 白色边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // 多个数据点 - 绘制折线图
        const stepX = chartWidth / (robotData.value.length - 1);

        // 绘制面积
        ctx.fillStyle = '#DC262620';
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);

        robotData.value.forEach((point, index) => {
          const x = padding + index * stepX;
          const y = height - padding - (point.value / maxValue) * chartHeight;
          ctx.lineTo(x, y);
        });

        ctx.lineTo(padding + (robotData.value.length - 1) * stepX, height - padding);
        ctx.closePath();
        ctx.fill();

        // 绘制折线
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 3;
        ctx.beginPath();

        robotData.value.forEach((point, index) => {
          const x = padding + index * stepX;
          const y = height - padding - (point.value / maxValue) * chartHeight;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();

        // 绘制数据点
        ctx.fillStyle = '#DC2626';
        robotData.value.forEach((point, index) => {
          const x = padding + index * stepX;
          const y = height - padding - (point.value / maxValue) * chartHeight;

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      // 绘制X轴标签
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';

      if (robotData.value.length === 1) {
        const x = padding + chartWidth / 2;
        const date = new Date(robotData.value[0].date);
        const label = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        ctx.fillText(label, x, height - padding + 20);
      } else {
        const stepX = chartWidth / (robotData.value.length - 1);
        robotData.value.forEach((point, index) => {
          const x = padding + index * stepX;
          const date = new Date(point.date);
          const label = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          ctx.fillText(label, x, height - padding + 20);
        });
      }
    };

    onMounted(() => {
      fetchData();
    });

    watch([robotData, loading], ([newData, newLoading]) => {
      if (!newLoading && Array.isArray(newData) && newData.length > 0) {
        setTimeout(() => {
          drawChart();
        }, 200);
      }
    });

    return {
      loading,
      selectedRange,
      granularity,
      robotChart,
      periodTotal,
      averagePerDay,
      peakValue,
      updateTimeRange,
      fetchData
    };
  }
};
</script>

<style lang="scss" scoped>
.robot-analytics {
  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
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
      border-top: 4px solid #dc2626;
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
    .stats-summary {
      display: flex;
      justify-content: space-around;
      background: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);

      .summary-item {
        text-align: center;

        .label {
          display: block;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #dc2626;
        }
      }
    }

    .chart-container {
      background: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);

      h4 {
        margin: 0 0 1.5rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .chart-wrapper {
        width: 100%;
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
