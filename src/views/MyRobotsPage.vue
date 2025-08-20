<template>
  <div class="robots-page">
    <AppHeader />
    <main>
      <div class="container">
        <div class="page-header">
          <h1>My Robots</h1>
          <div class="page-actions">
            <search-bar
              placeholder="Search robots..."
              @search="handleSearch"
              class="robot-search"
            />
            <button class="add-robot-button" @click="openAddRobotModal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Robot
            </button>
          </div>
        </div>

        <!-- 筛选器 -->
        <div class="robot-filters">
          <div class="filter-group">
            <label for="status-filter">Status:</label>
            <select id="status-filter" v-model="statusFilter" @change="handleFilterChange">
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="type-filter">Type:</label>
            <select id="type-filter" v-model="typeFilter" @change="handleFilterChange">
              <option value="all">All</option>
              <option value="mobile">Mobile</option>
              <option value="arm">Arm</option>
              <option value="mobile-arm">Mobile Arm</option>
            </select>
          </div>
        </div>

        <!-- 无限滚动机器人列表 -->
        <InfiniteScrollList
          :items="robots"
          :loading="loading"
          :has-more="hasMore"
          :is-empty="isEmpty"
          :is-initial-loading="isInitialLoading"
          loading-text="Loading robots..."
          empty-title="No Robots"
          empty-description="You haven't added any robots yet. Add a robot to get started."
          :show-no-more="false"
          @refresh="refresh"
          @load-more="loadMore"
          ref="infiniteScrollRef"
        >
          <template #items="{ items }">
            <div class="robots-grid">
              <div v-for="robot in items" :key="robot.id" class="robot-card-wrapper">
                <RobotCard
                  :robot="robot"
                  @select="selectRobot"
                  @view="viewRobot"
                  @manage="manageRobot"
                  @remove="removeRobot"
                />
              </div>
            </div>
          </template>

          <template #empty-icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" />
              <line x1="16" y1="16" x2="16" y2="16" />
            </svg>
          </template>
        </InfiniteScrollList>

        <!-- Add Robot Modal -->
        <app-modal
          v-model="isAddRobotModalVisible"
          @close="closeAddRobotModal"
          title="Add New Robot"
        >
          <div class="add-robot-modal">
            <p>Enter the bind code provided by your robot to add it to your fleet.</p>
            <div class="form-group">
              <label for="bind-code">Bind Code</label>
              <input
                type="text"
                id="bind-code"
                v-model="bindCode"
                placeholder="e.g., ABCD-1234"
                :disabled="isAddingRobot"
                class="form-control"
              />
            </div>
            <div class="modal-actions">
              <app-button @click="closeAddRobotModal" variant="secondary" :disabled="isAddingRobot">
                Cancel
              </app-button>
              <app-button @click="handleAddRobot" :loading="isAddingRobot" :disabled="!bindCode">
                Add Robot
              </app-button>
            </div>
          </div>
        </app-modal>

        <!-- Manage Robot Modal -->
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

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import SearchBar from '../components/common/SearchBar.vue';
import RobotCard from '../components/robots/RobotCard.vue';
import InfiniteScrollList from '../components/InfiniteScrollList.vue';
import AppModal from '../components/common/AppModal.vue';
import AppButton from '../components/common/AppButton.vue';
import { useRobotInfiniteScroll } from '../composables/useInfiniteScroll';
import robotManagementService from '../services/robot-management.service';
import notificationService from '../services/notification.service';
import type { Robot } from '../services/robot-management.service';

const router = useRouter();

// 搜索和筛选状态
const searchQuery = ref('');
const statusFilter = ref('all');
const typeFilter = ref('all');

// Add Robot Modal 状态
const isAddRobotModalVisible = ref(false);
const bindCode = ref('');
const isAddingRobot = ref(false);

// Manage Robot Modal 状态
const isManageModalVisible = ref(false);
const editingRobot = ref<Robot | null>(null);
const newRobotName = ref('');
const isUpdatingRobot = ref(false);

// 无限滚动引用
const infiniteScrollRef = ref();

// 使用无限滚动组合式函数
const {
  items: robots,
  loading,
  hasMore,
  error,
  isEmpty,
  isInitialLoading,
  refresh,
  loadMore,
  updateFilters,
  setSentinel
} = useRobotInfiniteScroll(
  params =>
    robotManagementService.getRobotsInfinite({
      ...params,
      status: statusFilter.value === 'all' ? undefined : statusFilter.value,
      type: typeFilter.value === 'all' ? undefined : typeFilter.value,
      query: searchQuery.value || undefined
    }),
  { immediate: true }
);

// 处理搜索
const handleSearch = (query: string) => {
  searchQuery.value = query;
};

// 处理筛选器变化
const handleFilterChange = async () => {
  await updateFilters({
    status: statusFilter.value === 'all' ? undefined : statusFilter.value,
    type: typeFilter.value === 'all' ? undefined : typeFilter.value,
    query: searchQuery.value || undefined
  });
};

// Add Robot Modal 方法
const openAddRobotModal = () => {
  isAddRobotModalVisible.value = true;
  bindCode.value = '';
};

const closeAddRobotModal = () => {
  isAddRobotModalVisible.value = false;
  bindCode.value = '';
};

const handleAddRobot = async () => {
  if (!bindCode.value.trim()) {
    notificationService.error('Please enter a bind code.');
    return;
  }

  isAddingRobot.value = true;
  try {
    await robotManagementService.addRobot(bindCode.value.trim());
    notificationService.success('Robot added successfully!');
    closeAddRobotModal();
    // 刷新列表
    await refresh();
  } catch (error) {
    console.error('Error adding robot:', error);
    notificationService.error('Failed to add robot. Please check the code and try again.');
  } finally {
    isAddingRobot.value = false;
  }
};

// 机器人操作方法
const selectRobot = (robot: Robot) => {
  router.push(`/robots/${robot.id}`);
};

const viewRobot = (robot: Robot) => {
  router.push(`/robots/${robot.id}`);
};

const manageRobot = (robot: Robot) => {
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

  if (!editingRobot.value) {
    return;
  }

  isUpdatingRobot.value = true;
  try {
    await robotManagementService.updateRobot(editingRobot.value.id, {
      name: newRobotName.value.trim()
    });
    notificationService.success('Robot updated successfully.');
    closeManageModal();
    // 刷新列表
    await refresh();
  } catch (error) {
    console.error('Error updating robot:', error);
    notificationService.error('Failed to update robot.');
  } finally {
    isUpdatingRobot.value = false;
  }
};

const removeRobot = async (robot: Robot) => {
  const confirmed = window.confirm(
    `Are you sure you want to remove "${robot.name}"? This action cannot be undone.`
  );

  if (confirmed) {
    try {
      await robotManagementService.removeRobot(robot.id);
      notificationService.success(`Robot "${robot.name}" has been removed.`);
      // 刷新列表
      await refresh();
    } catch (error) {
      console.error('Error removing robot:', error);
      notificationService.error('Failed to remove robot.');
    }
  }
};

// 防抖搜索
let searchTimeout: number | null = null;
watch(searchQuery, newQuery => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // 防抖：500ms 后执行搜索
  searchTimeout = setTimeout(async () => {
    await handleFilterChange();
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
</script>

<style lang="scss" scoped>
.robots-page {
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
      color: var(--text-primary);
      font-size: 2rem;
      font-weight: 700;
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
    align-items: center;

    @media (max-width: 768px) {
      width: 100%;
      flex-direction: column;

      .robot-search {
        width: 100%;
      }
    }
  }

  .add-robot-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background: var(--accent-primary);
    color: white;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    white-space: nowrap;

    svg {
      margin-right: 0.5rem;
    }

    &:hover {
      background: var(--accent-secondary);
      transform: translateY(-2px);
    }
  }

  .robot-filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        white-space: nowrap;
      }

      select {
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: 1px solid var(--input-border);
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 0.5rem;

      .filter-group {
        justify-content: space-between;
      }
    }
  }

  .robots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    width: 100%;

    .robot-card-wrapper {
      height: 100%;
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
  }
}

.add-robot-modal,
.manage-robot-modal {
  p {
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid var(--input-border);
      background-color: var(--input-bg);
      color: var(--text-primary);
      font-size: 1rem;
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
      }

      &::placeholder {
        color: var(--text-secondary);
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
}
</style>
