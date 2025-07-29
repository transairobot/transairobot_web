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
            <button
              v-for="category in categories"
              :key="category.id"
              :class="['category-button', { active: selectedCategory === category.id }]"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="app-store-loading">
          <LoadingState message="Loading applications..." />
        </div>

        <div v-else-if="error" class="app-store-error">
          <ErrorState message="Failed to load applications" :retry="fetchApplications" />
        </div>

        <div v-else-if="filteredApplications.length === 0" class="app-store-empty">
          <p>No applications found. Try adjusting your search or filters.</p>
        </div>

        <div v-else class="app-store-grid">
          <div v-for="app in filteredApplications" :key="app.id" class="app-store-grid-item">
            <AppApplicationCard :application="app" />
          </div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import SearchBar from '../components/common/SearchBar.vue';
import LoadingState from '../components/common/LoadingState.vue';
import ErrorState from '../components/common/ErrorState.vue';
import AppApplicationCard from '../components/store/AppApplicationCard.vue';
import appService from '../services/application-store.service';

export default {
  name: 'AppStorePage',
  components: {
    AppHeader,
    AppFooter,
    SearchBar,
    LoadingState,
    ErrorState,
    AppApplicationCard
  },
  setup() {
    const applications = ref([]);
    const loading = ref(true);
    const error = ref(false);
    const searchQuery = ref('');
    const selectedCategory = ref('all');

    // Mock categories
    const categories = [
      { id: 'all', name: 'All' },
      { id: 'navigation', name: 'Navigation' },
      { id: 'vision', name: 'Vision' },
      { id: 'manipulation', name: 'Manipulation' },
      { id: 'communication', name: 'Communication' },
      { id: 'utilities', name: 'Utilities' }
    ];

    const fetchApplications = async () => {
      loading.value = true;
      error.value = false;

      try {
        console.log('fetchApplications');
        const result = await appService.getApplications();
        if (Array.isArray(result)) {
          applications.value = result;
        } else if (result) {
          applications.value = [result];
        } else {
          applications.value = [];
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        error.value = true;
        applications.value = []; // Ensure it's an array on error
      } finally {
        loading.value = false;
      }
    };

    const filteredApplications = computed(() => {
      return applications.value.filter(app => {
        // Filter by category
        const categoryMatch =
          selectedCategory.value === 'all' ||
          (app.category && app.category.includes(selectedCategory.value));

        // Filter by search query
        const searchMatch =
          !searchQuery.value ||
          (app.name && app.name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (app.description &&
            app.description.toLowerCase().includes(searchQuery.value.toLowerCase()));

        return categoryMatch && searchMatch;
      });
    });

    const handleSearch = query => {
      searchQuery.value = query;
    };

    const selectCategory = categoryId => {
      selectedCategory.value = categoryId;
    };

    onMounted(() => {
      fetchApplications();
    });

    return {
      applications,
      loading,
      error,
      searchQuery,
      selectedCategory,
      categories,
      filteredApplications,
      handleSearch,
      selectCategory,
      fetchApplications
    };
  }
};
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

    .category-button {
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
      font-size: 0.875rem;
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--bg-tertiary);
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

    &-item {
      height: 100%;
    }
  }

  .app-store-loading,
  .app-store-error,
  .app-store-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }
}
</style>
