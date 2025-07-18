<template>
  <div class="my-robots-page">
    <AppHeader />
    <main>
      <div class="container">
        <div class="page-header">
          <h1>My Robots</h1>
          <div class="page-actions">
            <search-bar
              placeholder="Search robots..."
              @search="searchRobots"
              class="robot-search"
            />
          </div>
        </div>

        <robot-list
          :robots="filteredRobots"
          :loading="loading"
          :error="error"
          @retry="fetchRobots"
          @select="selectRobot"
          @view="viewRobot"
          @manage="manageRobot"
          @add="addNewRobot"
        />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import SearchBar from '../components/common/SearchBar.vue';
import RobotList from '../components/robots/RobotList.vue';

export default {
  name: 'MyRobotsPage',
  components: {
    AppHeader,
    AppFooter,
    SearchBar,
    RobotList
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const searchQuery = ref('');
    const loading = computed(() => store.getters['robots/isLoading']);
    const error = ref('');
    const robots = computed(() => store.getters['robots/allRobots']);

    const filteredRobots = computed(() => {
      if (!searchQuery.value) return robots.value;

      const query = searchQuery.value.toLowerCase();
      return robots.value.filter(
        robot =>
          robot.name.toLowerCase().includes(query) || robot.type.toLowerCase().includes(query)
      );
    });

    const fetchRobots = async () => {
      try {
        error.value = '';
        await store.dispatch('robots/fetchRobots');
      } catch (err) {
        error.value = 'Failed to load your robots. Please try again.';
        console.error('Error fetching robots:', err);
      }
    };

    const searchRobots = query => {
      searchQuery.value = query;
    };

    const selectRobot = robot => {
      router.push(`/robots/${robot.id}`);
    };

    const viewRobot = robot => {
      router.push(`/robots/${robot.id}`);
    };

    const manageRobot = robot => {
      router.push(`/robots/${robot.id}/manage`);
    };

    const addNewRobot = () => {
      // This would typically open a modal or navigate to a new robot page
      alert('Add new robot functionality will be implemented in a future task');
    };

    onMounted(() => {
      fetchRobots();
    });

    return {
      loading,
      error,
      filteredRobots,
      searchRobots,
      fetchRobots,
      selectRobot,
      viewRobot,
      manageRobot,
      addNewRobot
    };
  }
};
</script>

<style lang="scss" scoped>
.my-robots-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: 3rem 0;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;

    h1 {
      margin-bottom: 0;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .page-actions {
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
      width: 100%;

      .robot-search {
        width: 100%;
      }
    }
  }
}
</style>
