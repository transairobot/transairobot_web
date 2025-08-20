import { ref, computed, onMounted, onUnmounted, nextTick, Ref } from 'vue';
import { InfiniteScrollResponse, InfiniteScrollParams } from '@/services/application-store.service';

export interface UseInfiniteScrollOptions {
  threshold?: number; // 距离底部多少像素时触发加载
  immediate?: boolean; // 是否立即加载第一页
  rootMargin?: string; // Intersection Observer 的 rootMargin
}

export function useInfiniteScroll<T>(
  fetchFunction: (params: InfiniteScrollParams) => Promise<InfiniteScrollResponse<T>>,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 1000, immediate = true, rootMargin = '0px' } = options;

  // 响应式状态
  const items: Ref<T[]> = ref([]);
  const loading = ref(false);
  const hasMore = ref(true);
  const error = ref<string | null>(null);
  const nextCursor = ref<string | undefined>(undefined);

  // 筛选参数
  const filters = ref<InfiniteScrollParams>({});

  // 计算属性
  const isEmpty = computed(() => items.value.length === 0 && !loading.value);
  const isInitialLoading = computed(() => loading.value && items.value.length === 0);

  // 加载数据
  const loadMore = async (reset = false) => {
    if (loading.value || (!hasMore.value && !reset)) {
      return;
    }

    try {
      loading.value = true;
      error.value = null;

      const params: InfiniteScrollParams = {
        limit: 20,
        ...filters.value,
        cursor: reset ? undefined : nextCursor.value
      };

      const response = await fetchFunction(params);

      if (reset) {
        items.value = response.data as T[];
      } else {
        (items.value as T[]).push(...response.data);
      }

      hasMore.value = response.hasMore;
      nextCursor.value = response.nextCursor;
    } catch (err) {
      console.error('Failed to load data:', err);
      // 静默处理错误，不设置任何错误状态
      // 让组件显示空状态或保持当前数据
    } finally {
      loading.value = false;
    }
  };

  // 刷新数据（重置到第一页）
  const refresh = async () => {
    nextCursor.value = undefined;
    hasMore.value = true;
    await loadMore(true);
  };

  // 更新筛选条件
  const updateFilters = async (newFilters: InfiniteScrollParams) => {
    filters.value = { ...newFilters };
    await refresh();
  };

  // 滚动事件处理
  const handleScroll = () => {
    if (loading.value || !hasMore.value) {
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - threshold) {
      loadMore();
    }
  };

  // Intersection Observer 方式（更现代的方法）
  let observer: IntersectionObserver | null = null;
  const sentinelRef = ref<HTMLElement | null>(null);

  const setupIntersectionObserver = () => {
    if (!sentinelRef.value) return;

    observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          loadMore();
        }
      },
      {
        rootMargin,
        threshold: 0.1
      }
    );

    observer.observe(sentinelRef.value);
  };

  const cleanupIntersectionObserver = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  // 生命周期
  onMounted(() => {
    if (immediate) {
      loadMore(true);
    }

    // 添加滚动监听（备用方案）
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 设置 Intersection Observer
    nextTick(() => {
      setupIntersectionObserver();
    });
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    cleanupIntersectionObserver();
  });

  // 手动设置哨兵元素
  const setSentinel = (element: HTMLElement | null) => {
    sentinelRef.value = element;
    if (element) {
      cleanupIntersectionObserver();
      nextTick(() => {
        setupIntersectionObserver();
      });
    }
  };

  return {
    // 状态
    items,
    loading,
    hasMore,
    error,
    isEmpty,
    isInitialLoading,

    // 方法
    loadMore,
    refresh,
    updateFilters,
    setSentinel,

    // 内部状态（用于调试）
    nextCursor,
    filters
  };
}

// 专门用于应用列表的组合式函数
export function useApplicationInfiniteScroll(
  fetchFunction: (params: InfiniteScrollParams) => Promise<InfiniteScrollResponse<any>>,
  options: UseInfiniteScrollOptions = {}
) {
  const infiniteScroll = useInfiniteScroll(fetchFunction, options);

  // 应用特定的筛选方法
  const filterByCategory = async (categoryId: string | null) => {
    await infiniteScroll.updateFilters({
      ...infiniteScroll.filters.value,
      category: categoryId || undefined
    });
  };

  const searchApplications = async (query: string) => {
    await infiniteScroll.updateFilters({
      ...infiniteScroll.filters.value,
      query: query || undefined
    });
  };

  return {
    ...infiniteScroll,
    filterByCategory,
    searchApplications
  };
}

// 专门用于机器人列表的组合式函数
export function useRobotInfiniteScroll(
  fetchFunction: (params: InfiniteScrollParams) => Promise<InfiniteScrollResponse<any>>,
  options: UseInfiniteScrollOptions = {}
) {
  const infiniteScroll = useInfiniteScroll(fetchFunction, options);

  // 机器人特定的筛选方法
  const filterByStatus = async (status: string | null) => {
    await infiniteScroll.updateFilters({
      ...infiniteScroll.filters.value,
      status: status || 'all'
    });
  };

  return {
    ...infiniteScroll,
    filterByStatus
  };
}
