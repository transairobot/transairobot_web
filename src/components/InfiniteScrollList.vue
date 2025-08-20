<template>
  <div class="infinite-scroll-container">
    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 初始加载状态 -->
      <div v-if="isInitialLoading" class="loading-container">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text">{{ loadingText }}</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="isEmpty" class="empty-container">
        <div class="empty-content">
          <div class="empty-icon">
            <slot name="empty-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </slot>
          </div>
          <h3 class="empty-title">{{ emptyTitle }}</h3>
          <p class="empty-description">{{ emptyDescription }}</p>
        </div>
      </div>

      <!-- 数据列表 -->
      <div v-else class="items-container">
        <slot name="items" :items="items">
          <div v-for="item in items" :key="getItemKey(item)" class="item">
            <slot name="item" :item="item">
              {{ item }}
            </slot>
          </div>
        </slot>

        <!-- 加载更多状态 -->
        <div v-if="loading && !isInitialLoading" class="load-more-container">
          <div class="load-more-spinner">
            <div class="spinner small"></div>
            <span class="load-more-text">Loading more...</span>
          </div>
        </div>

        <!-- 没有更多数据 -->
        <div v-else-if="!hasMore && items.length > 0 && showNoMore" class="no-more-container">
          <div class="no-more-content">
            <span class="no-more-text">{{ noMoreText }}</span>
          </div>
        </div>

        <!-- 哨兵元素（用于 Intersection Observer） -->
        <div ref="sentinelElement" class="sentinel" style="height: 1px"></div>
      </div>
    </div>

    <!-- 下拉刷新指示器 -->
    <div v-if="showPullToRefresh && isPulling" class="pull-refresh-indicator">
      <div class="pull-refresh-content">
        <div class="pull-refresh-spinner">
          <div class="spinner small"></div>
        </div>
        <span class="pull-refresh-text">{{ pullRefreshText }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch, PropType } from 'vue';

export default defineComponent({
  name: 'InfiniteScrollList',
  props: {
    items: {
      type: Array as PropType<any[]>,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    hasMore: {
      type: Boolean,
      required: true
    },
    isEmpty: {
      type: Boolean,
      required: true
    },
    isInitialLoading: {
      type: Boolean,
      required: true
    },
    loadingText: {
      type: String,
      default: 'Loading...'
    },
    emptyTitle: {
      type: String,
      default: 'No Data'
    },
    emptyDescription: {
      type: String,
      default: 'No content to display'
    },
    noMoreText: {
      type: String,
      default: 'No more data'
    },
    showPullToRefresh: {
      type: Boolean,
      default: false
    },
    showNoMore: {
      type: Boolean,
      default: true
    },
    pullRefreshText: {
      type: String,
      default: 'Pull to refresh'
    },
    itemKey: {
      type: [String, Function] as PropType<string | ((item: any) => string)>,
      default: 'id'
    }
  },
  emits: ['refresh', 'loadMore', 'pullRefresh'],
  setup(props, { emit, expose }) {
    // 哨兵元素引用
    const sentinelElement = ref<HTMLElement | null>(null);

    // 下拉刷新状态
    const isPulling = ref(false);
    const pullStartY = ref(0);
    const pullDistance = ref(0);

    // 获取项目的唯一键
    const getItemKey = (item: any): string => {
      if (typeof props.itemKey === 'function') {
        return props.itemKey(item);
      }
      return item[props.itemKey as string] || item.id || Math.random().toString();
    };

    // 刷新方法
    const refresh = () => {
      emit('refresh');
    };

    // 加载更多方法
    const loadMore = () => {
      emit('loadMore');
    };

    // 下拉刷新处理
    const handleTouchStart = (e: TouchEvent) => {
      if (!props.showPullToRefresh) return;
      pullStartY.value = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!props.showPullToRefresh) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - pullStartY.value;

      if (distance > 0 && window.scrollY === 0) {
        pullDistance.value = Math.min(distance, 100);
        isPulling.value = distance > 50;

        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!props.showPullToRefresh) return;

      if (isPulling.value && pullDistance.value > 50) {
        emit('pullRefresh');
      }

      isPulling.value = false;
      pullDistance.value = 0;
    };

    // 监听哨兵元素变化
    watch(sentinelElement, newElement => {
      if (newElement) {
        // 通知父组件设置哨兵元素
        emit('loadMore');
      }
    });

    // 生命周期
    onMounted(() => {
      if (props.showPullToRefresh) {
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
      }
    });

    onUnmounted(() => {
      if (props.showPullToRefresh) {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    });

    // 暴露哨兵元素给父组件
    expose({
      sentinelElement
    });

    return {
      sentinelElement,
      isPulling,
      getItemKey,
      refresh,
      loadMore
    };
  }
});
</script>

<style scoped>
.infinite-scroll-container {
  position: relative;
  width: 100%;
  min-height: 200px;
}

.content-area {
  width: 100%;
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

/* 空状态 */
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 2rem;
}

.empty-content {
  text-align: center;
  max-width: 300px;
}

.empty-icon {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.empty-title {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

/* 错误状态 */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 300px;
}

.error-icon {
  color: var(--error);
  margin-bottom: 1rem;
}

.error-title {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.error-message {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

/* 重试按钮 */
.retry-button {
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  opacity: 0.9;
}

/* 数据列表 */
.items-container {
  width: 100%;
}

.item {
  width: 100%;
}

/* 加载更多状态 */
.load-more-container {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.load-more-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.load-more-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 没有更多数据 */
.no-more-container {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.no-more-content {
  text-align: center;
}

.no-more-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 下拉刷新 */
.pull-refresh-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--input-border);
  padding: 1rem;
  z-index: 1000;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

.pull-refresh-indicator.active {
  transform: translateY(0);
}

.pull-refresh-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.pull-refresh-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 旋转动画 */
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--input-border);
  border-top: 2px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner.small {
  width: 16px;
  height: 16px;
  border-width: 1.5px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 哨兵元素 */
.sentinel {
  visibility: hidden;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-container,
  .empty-container,
  .error-container {
    min-height: 150px;
    padding: 1rem;
  }

  .empty-content,
  .error-content {
    max-width: 250px;
  }

  .load-more-container,
  .no-more-container {
    padding: 1rem;
  }
}
</style>
