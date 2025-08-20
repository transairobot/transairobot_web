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
          </div>
        </div>

        <!-- 状态筛选器 -->
        <div class="robot-filters">
          <div class="status-filters">
            <button
              v-for="status in statusOptions"
              :key="status.value"
              :class="['status-button', { active: selectedStatus === status.value }]"
              @click="selectStatus(status.value)"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

        <!-- 无限滚动机器人列表 -->
        <InfiniteScrollList
          :items="robots"
          :loading="loading"
          :has-more="hasMore"
          :error="error"
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
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </template>
        </InfiniteScrollList>

        <!-- 管理机器人模态框 -->
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
const selectedStatus = ref('all');

// 状态选项
const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

// 模态框状态
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
  filterByStatus,
  setSentinel
} = useRobotInfiniteScroll(params => robotManagementService.getRobotsInfinite(params), {
  immediate: true
});

// 处理搜索
const handleSearch = (query: string) => {
  searchQuery.value = query;
};

// 选择状态筛选
const selectStatus = async (status: string) => {
  selectedStatus.value = status;
  await filterByStatus(status === 'all' ? null : status);
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
    notificationService.error('机器人名称不能为空');
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
    notificationService.success('机器人更新成功');
    closeManageModal();
    // 刷新列表
    await refresh();
  } catch (error) {
    console.error('Error updating robot:', error);
    notificationService.error('机器人更新失败');
  } finally {
    isUpdatingRobot.value = false;
  }
};

const removeRobot = async (robot: Robot) => {
  const confirmed = window.confirm(`确定要移除机器人 "${robot.name}" 吗？此操作无法撤销。`);

  if (confirmed) {
    try {
      await robotManagementService.removeRobot(robot.id);
      notificationService.success(`机器人 "${robot.name}" 已移除`);
      // 刷新列表
      await refresh();
    } catch (error) {
      console.error('Error removing robot:', error);
      notificationService.error('移除机器人失败');
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
    // 这里可以实现搜索逻辑，目前后端可能还不支持搜索参数
    // 暂时通过刷新来实现
    await refresh();
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

    @media (max-width: 768px) {
      width: 100%;

      .robot-search {
        width: 100%;
      }
    }
  }

  .robot-filters {
    margin-bottom: 2rem;
  }

  .status-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .status-button {
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

.manage-robot-modal {
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
