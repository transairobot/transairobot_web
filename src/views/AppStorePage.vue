<template>
  <div class="app-store-page">
    <AppHeader />
    <main>
      <div class="container">
        <div class="app-store-header">
          <h1>Application Store</h1>
          <SearchBar placeholder="Search applications..." @search="handleSearch" />
        </div>

        <div class="app-store-filters">
          <div class="app-store-categories">
            <!-- Categories loading state -->
            <div v-if="categoriesLoading" class="categories-loading">
              <div class="loading-spinner"></div>
              <span>Loading categories...</span>
            </div>

            <!-- Categories error state -->
            <div v-else-if="categoriesError" class="categories-error">
              <span>{{ categoriesError }}</span>
              <button @click="fetchCategories" class="retry-button">Retry</button>
            </div>

            <!-- Categories list -->
            <template v-else>
              <button
                v-for="category in categories"
                :key="category.id"
                :class="['category-button', { active: selectedCategory === category.id }]"
                @click="selectCategory(category.id)"
              >
                {{ category.name }}
              </button>
            </template>
          </div>
        </div>

        <!-- 无限滚动应用列表 -->
        <InfiniteScrollList
          :items="applications"
          :loading="loading"
          :has-more="hasMore"
          :is-empty="isEmpty"
          :is-initial-loading="isInitialLoading"
          loading-text="Loading applications..."
          empty-title="No Applications"
          empty-description="No applications available at the moment"
          :show-no-more="false"
          @refresh="refresh"
          @load-more="loadMore"
          ref="infiniteScrollRef"
        >
          <template #items="{ items }">
            <div class="app-store-grid">
              <div v-for="app in items" :key="app.id" class="app-store-grid-item">
                <AppApplicationCard :application="app" />
              </div>
            </div>
          </template>

          <template #empty-icon>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </template>
        </InfiniteScrollList>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import SearchBar from '../components/common/SearchBar.vue';
import AppApplicationCard from '../components/store/AppApplicationCard.vue';
import InfiniteScrollList from '../components/InfiniteScrollList.vue';
import { useApplicationInfiniteScroll } from '../composables/useInfiniteScroll';
import applicationStoreService from '../services/application-store.service';
import type { Category } from '../services/application-store.service';

// 搜索和筛选状态
const searchQuery = ref('');
const selectedCategory = ref('all');

// 分类状态
const categories = ref<Category[]>([{ id: 'all', name: 'All', description: '' }]);
const categoriesLoading = ref(false);
const categoriesError = ref<string | null>(null);

// 无限滚动引用
const infiniteScrollRef = ref();

// 使用无限滚动组合式函数
const {
  items: applications,
  loading,
  hasMore,
  error,
  isEmpty,
  isInitialLoading,
  refresh,
  loadMore,
  filterByCategory,
  searchApplications,
  setSentinel
} = useApplicationInfiniteScroll(
  params => applicationStoreService.getApplicationsInfinite(params),
  { immediate: false } // 不立即加载，等分类加载完成后再加载
);

// 获取分类列表
const fetchCategories = async () => {
  categoriesLoading.value = true;
  categoriesError.value = null;

  try {
    const response = await applicationStoreService.getCategories();
    console.log('Categories response:', response);

    // 处理不同的响应格式
    let categoryList = response;

    // 如果响应是对象且有数字键，转换为数组
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      const keys = Object.keys(response);
      if (keys.length > 0 && keys.every(key => !isNaN(Number(key)))) {
        categoryList = Object.values(response);
      }
    }

    // 确保 categoryList 是数组
    if (!Array.isArray(categoryList)) {
      categoryList = [];
    }

    // 转换 API 数据并在开头添加 'All' 分类
    const apiCategories = categoryList.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || ''
    }));

    categories.value = [
      { id: 'all', name: 'All', description: 'All categories' },
      ...apiCategories
    ];

    console.log('Categories loaded:', categories.value);
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    categoriesError.value = 'Failed to load categories';
    // 错误时保持默认分类
    categories.value = [
      { id: 'all', name: 'All', description: 'All categories' },
      { id: 'navigation', name: 'Navigation', description: 'Navigation apps' },
      { id: 'vision', name: 'Vision', description: 'Vision apps' },
      { id: 'manipulation', name: 'Manipulation', description: 'Manipulation apps' },
      { id: 'communication', name: 'Communication', description: 'Communication apps' },
      { id: 'utilities', name: 'Utilities', description: 'Utility apps' }
    ];
  } finally {
    categoriesLoading.value = false;
  }
};

// 处理搜索
const handleSearch = (query: string) => {
  searchQuery.value = query;
};

// 选择分类
const selectCategory = async (categoryId: string) => {
  selectedCategory.value = categoryId;
  const categoryFilter = categoryId === 'all' ? null : categoryId;
  await filterByCategory(categoryFilter);
};

// 防抖搜索
let searchTimeout: number | null = null;
watch(searchQuery, newQuery => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // 防抖：500ms 后执行搜索
  searchTimeout = setTimeout(async () => {
    await searchApplications(newQuery);
  }, 500);
});

// 设置哨兵元素
watch(infiniteScrollRef, newRef => {
  if (newRef?.sentinelElement) {
    nextTick(() => {
      setSentinel(newRef.sentinelElement);
    });
  }
});

// 组件挂载时初始化
onMounted(async () => {
  // 先获取分类，然后加载应用
  await fetchCategories();
  // 初始加载应用
  await refresh();
});
</script>

<style lang="scss" scoped>
.app-store-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: 2rem 0;
  }

  .app-store-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;

    h1 {
      margin-bottom: 0;
      color: var(--text-primary);
      font-size: 2rem;
      font-weight: 700;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .app-store-filters {
    margin-bottom: 2rem;
  }

  .app-store-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .categories-loading,
    .categories-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: var(--bg-secondary);
      border-radius: 2rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid var(--input-border);
      border-top: 2px solid var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .retry-button {
      background: var(--accent-primary);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        opacity: 0.9;
      }
    }

    .category-button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 2rem;
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--bg-tertiary, #e2e8f0);
      }

      &.active {
        background-color: var(--accent-primary);
        color: white;
      }
    }
  }

  .app-store-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    width: 100%;

    &-item {
      height: 100%;
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 0.75rem;
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
