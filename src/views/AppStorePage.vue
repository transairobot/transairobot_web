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

    // Mock applications data
    const mockApplications = [
      {
        id: 'app1',
        name: 'PathFinder Pro',
        description: 'Advanced navigation system with obstacle avoidance and dynamic path planning',
        icon: 'https://via.placeholder.com/64',
        category: ['navigation'],
        rating: 4.7,
        downloads: 12500
      },
      {
        id: 'app2',
        name: 'ObjectVision',
        description: 'Real-time object detection and classification using advanced neural networks',
        icon: 'https://via.placeholder.com/64',
        category: ['vision'],
        rating: 4.2,
        downloads: 8700
      },
      {
        id: 'app3',
        name: 'GripMaster',
        description: 'Precision control for robotic arms with adaptive force feedback',
        icon: 'https://via.placeholder.com/64',
        category: ['manipulation'],
        rating: 4.8,
        downloads: 5300
      },
      {
        id: 'app4',
        name: 'RobotChat',
        description: 'Natural language processing for human-robot interaction',
        icon: 'https://via.placeholder.com/64',
        category: ['communication'],
        rating: 3.9,
        downloads: 15800
      },
      {
        id: 'app5',
        name: 'BatteryOptimizer',
        description: 'Maximize battery life with intelligent power management',
        icon: 'https://via.placeholder.com/64',
        category: ['utilities'],
        rating: 4.5,
        downloads: 22000
      },
      {
        id: 'app6',
        name: 'SensorFusion',
        description: 'Combine data from multiple sensors for improved perception',
        icon: 'https://via.placeholder.com/64',
        category: ['vision', 'navigation'],
        rating: 4.6,
        downloads: 7200
      },
      {
        id: 'app7',
        name: 'MotionPlanner',
        description: 'Smooth trajectory planning for efficient robot movement',
        icon: 'https://via.placeholder.com/64',
        category: ['navigation', 'manipulation'],
        rating: 4.3,
        downloads: 9500
      },
      {
        id: 'app8',
        name: 'DiagnosticSuite',
        description: 'Comprehensive system diagnostics and troubleshooting tools',
        icon: 'https://via.placeholder.com/64',
        category: ['utilities'],
        rating: 4.1,
        downloads: 18300
      }
    ];

    const fetchApplications = async () => {
      loading.value = true;
      error.value = false;

      try {
        // In a real app, this would be an API call
        // await api.getApplications()

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Use mock data for now
        applications.value = mockApplications;
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    const filteredApplications = computed(() => {
      return applications.value.filter(app => {
        // Filter by category
        const categoryMatch =
          selectedCategory.value === 'all' || app.category.includes(selectedCategory.value);

        // Filter by search query
        const searchMatch =
          !searchQuery.value ||
          app.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          app.description.toLowerCase().includes(searchQuery.value.toLowerCase());

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
