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
          @robot-added="handleRobotAdded"
        />

        <app-modal v-model="isManageModalVisible" @close="closeManageModal" title="Manage Robot">
          <div v-if="editingRobot" class="manage-robot-modal">
            <div class="form-group">
              <label for="robot-name">Robot Name</label>
              <input
                type="text"
                id="robot-name"
                v-model="newRobotName"
                placeholder="Enter new robot name"
                class="form-control"
              />
            </div>
            <div class="modal-actions">
              <app-button @click="closeManageModal" variant="secondary" :disabled="isUpdatingRobot">
                Cancel
              </app-button>
              <app-button
                @click="handleUpdateRobot"
                :loading="isUpdatingRobot"
                :disabled="!newRobotName"
              >
                Save Changes
              </app-button>
            </div>
          </div>
        </app-modal>
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
import notificationService from '../services/notification.service';
import AppModal from '../components/common/AppModal.vue';
import AppButton from '../components/common/AppButton.vue';

export default {
  name: 'MyRobotsPage',
  components: {
    AppHeader,
    AppFooter,
    SearchBar,
    RobotList,
    AppModal,
    AppButton
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const searchQuery = ref('');
    const isManageModalVisible = ref(false);
    const editingRobot = ref(null);
    const newRobotName = ref('');
    const isUpdatingRobot = ref(false);

    const loading = computed(() => store.getters['robots/isLoading']);
    const error = computed(() => store.getters['robots/error']);
    const robots = computed(() => store.getters['robots/allRobots']);

    const filteredRobots = computed(() => {
      if (!searchQuery.value) {
        return robots.value;
      }
      const query = searchQuery.value.toLowerCase();
      return robots.value.filter(
        robot =>
          robot.name.toLowerCase().includes(query) ||
          (robot.model && robot.model.toLowerCase().includes(query))
      );
    });

    const fetchRobots = () => {
      store.dispatch('robots/fetchRobots');
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
      editingRobot.value = { ...robot };
      newRobotName.value = robot.name;
      isManageModalVisible.value = true;
    };

    const closeManageModal = () => {
      isManageModalVisible.value = false;
      editingRobot.value = null;
      newRobotName.value = '';
    };

    const handleUpdateRobot = async () => {
      if (!newRobotName.value.trim()) {
        notificationService.error('Robot name cannot be empty.');
        return;
      }
      isUpdatingRobot.value = true;
      try {
        await store.dispatch('robots/updateRobot', {
          id: editingRobot.value.id,
          name: newRobotName.value.trim()
        });
        notificationService.success('Robot updated successfully.');
        closeManageModal();
      } catch (error) {
        notificationService.error('Failed to update robot.');
        console.error('Error updating robot:', error);
      } finally {
        isUpdatingRobot.value = false;
      }
    };

    const handleRobotAdded = newRobot => {
      notificationService.success(`Robot "${newRobot.name}" has been successfully added.`);
      fetchRobots();
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
      handleRobotAdded,
      isManageModalVisible,
      editingRobot,
      newRobotName,
      isUpdatingRobot,
      closeManageModal,
      handleUpdateRobot
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

.manage-robot-modal {
  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid var(--divider);
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
}
</style>
