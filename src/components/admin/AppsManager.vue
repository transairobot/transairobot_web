<template>
  <div class="apps-manager">
    <div class="section-header">
      <h2>Application Management</h2>
      <p>Create, edit, and manage applications</p>
    </div>

    <div class="app-actions">
      <router-link to="/admin/applications/create?from=apps" class="add-app-btn">
        <i class="fas fa-plus"></i> Add Application
      </router-link>
    </div>

    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search applications..."
        @input="searchApps"
      />
    </div>

    <div class="app-list">
      <div v-if="loading" class="loading-state">
        <p>Loading applications...</p>
      </div>

      <div v-else-if="filteredApps.length === 0" class="empty-state">
        <p>No applications found</p>
      </div>

      <div v-else class="apps-table">
        <table>
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>Category</th>
              <th>Version</th>
              <th>Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in filteredApps" :key="app.id">
              <td>
                <img
                  :src="app.iconUrl || '/assets/icons/default-app.png'"
                  :alt="app.name"
                  class="app-icon"
                />
              </td>
              <td>{{ app.name }}</td>
              <td>
                <div class="app-categories">
                  <template v-if="app.category && app.category.length > 0">
                    <span
                      v-for="categoryName in app.category"
                      :key="categoryName"
                      class="category-badge"
                    >
                      {{ categoryName }}
                    </span>
                  </template>
                  <span v-else class="no-category">No Categories</span>
                </div>
              </td>
              <td>{{ app.version }}</td>
              <td>
                <span class="downloads-count">
                  {{ formatDownloads(app.downloads || 0) }}
                </span>
              </td>
              <td class="actions">
                <router-link
                  :to="`/admin/applications/edit/${app.id}?from=apps`"
                  class="edit-btn"
                  title="Edit"
                >
                  ✏️
                </router-link>
                <button
                  class="screenshots-btn"
                  @click="manageScreenshots(app)"
                  title="Manage Screenshots"
                >
                  📷
                </button>
                <button class="delete-btn" @click="confirmDeleteApp(app)" title="Delete">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <div class="pagination-info">
          <span
            >显示 {{ (currentPage - 1) * pageSize + 1 }} -
            {{ Math.min(currentPage * pageSize, totalItems) }} 条，共 {{ totalItems }} 条</span
          >
          <select v-model="pageSize" @change="changePageSize(pageSize)" class="page-size-selector">
            <option :value="10">10 条/页</option>
            <option :value="20">20 条/页</option>
            <option :value="50">50 条/页</option>
            <option :value="100">100 条/页</option>
          </select>
        </div>

        <div class="pagination-controls">
          <button @click="previousPage" :disabled="currentPage === 1" class="pagination-btn">
            上一页
          </button>

          <div class="page-numbers">
            <button
              v-for="page in getVisiblePages()"
              :key="page"
              @click="goToPage(page)"
              :class="['page-btn', { active: page === currentPage, ellipsis: page === '...' }]"
              :disabled="page === '...'"
            >
              {{ page }}
            </button>
          </div>

          <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- Screenshots Management Modal -->
    <div class="modal" v-if="showScreenshotsModal">
      <div class="modal-content screenshots-modal">
        <div class="modal-header">
          <h3>Manage Screenshots - {{ screenshotsApp?.name }}</h3>
          <button class="close-btn" @click="closeScreenshotsModal">×</button>
        </div>
        <div class="modal-body">
          <!-- Upload Section at Top -->
          <div class="upload-section">
            <h4>Add New Screenshots</h4>
            <FileUpload
              ref="screenshotUpload"
              accept="image/*"
              :multiple="true"
              hint="Supports JPG, PNG formats. You can upload multiple screenshots at once."
              @upload-success="handleScreenshotUpload"
            />
          </div>

          <!-- Current Screenshots Section at Bottom -->
          <div class="screenshots-section">
            <h4>Uploaded Screenshots</h4>
            <div class="screenshots-grid" v-if="screenshots.length > 0">
              <div v-for="(screenshot, index) in screenshots" :key="index" class="screenshot-item">
                <img
                  :src="screenshot.previewUrl || screenshot.uri"
                  :alt="screenshot.caption"
                  class="screenshot-image"
                />
                <div class="screenshot-info">
                  <input
                    v-model="screenshot.caption"
                    placeholder="Enter caption..."
                    class="caption-input"
                  />
                  <button
                    class="remove-screenshot-btn"
                    @click="removeScreenshot(index)"
                    title="Remove screenshot"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="no-screenshots">
              <p>No screenshots uploaded yet. Use the upload area above to add screenshots.</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeScreenshotsModal">Cancel</button>
            <button
              type="button"
              class="save-btn"
              @click="saveScreenshots"
              :disabled="savingScreenshots"
            >
              {{ savingScreenshots ? 'Saving...' : 'Save Screenshots' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal" v-if="showDeleteConfirmation">
      <div class="modal-content delete-modal">
        <div class="modal-header">
          <div class="delete-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Delete Application</h3>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete the application
            <strong>"{{ appToDelete?.name }}"</strong>?
          </p>
          <p class="warning">
            This action cannot be undone and will permanently remove the application from the store.
          </p>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteConfirmation = false">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button class="delete-btn" @click="deleteApp">
            <i class="fas fa-trash"></i>
            Delete Application
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { adminService } from '@/services';
import FileUpload from '../common/FileUpload.vue';

export default {
  name: 'AppsManager',
  components: {
    FileUpload
  },
  emits: ['show-notification'],
  data() {
    return {
      searchQuery: '',
      apps: [],
      filteredApps: [],
      categories: [],
      loading: false,
      error: null,
      showDeleteConfirmation: false,
      appToDelete: null,
      searchTimeout: null, // 添加防抖定时器
      // 分页相关
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
      // 截图管理相关
      showScreenshotsModal: false,
      screenshotsApp: null,
      screenshots: [],
      savingScreenshots: false
    };
  },
  computed: {
    // 移除了编辑相关的计算属性
  },
  methods: {
    async fetchApps() {
      this.loading = true;
      this.error = null;

      try {
        const result = await adminService.getApplicationsForAdmin({
          page: this.currentPage,
          limit: this.pageSize,
          name: this.searchQuery || undefined
        });

        // 处理新的响应格式 - API 服务已经提取了 data 字段
        let appsData = [];
        let total = 0;

        if (result) {
          // API 服务返回的直接是 data 内容: { items: [...], pagination: { total: 1 } }
          if (result.items && Array.isArray(result.items)) {
            appsData = result.items;
            total = result.pagination ? result.pagination.total : result.items.length;
          }
          // 兼容旧格式: 直接是数组
          else if (Array.isArray(result)) {
            appsData = result;
            total = result.length;
          }
          // 兼容其他格式 (如果 API 服务没有提取 data)
          else if (result.data && result.data.items) {
            appsData = result.data.items;
            total = result.data.pagination
              ? result.data.pagination.total
              : result.data.items.length;
          }
          // 兼容索引对象格式: {0: {...}, 1: {...}}
          else if (typeof result === 'object' && !Array.isArray(result)) {
            const keys = Object.keys(result);
            const isIndexedObject = keys.length > 0 && keys.every(key => /^\d+$/.test(key));

            if (isIndexedObject) {
              appsData = Object.values(result);
              total = appsData.length;
            }
          }
        }

        this.apps = appsData;
        this.filteredApps = [...this.apps];
        this.totalItems = total;
        this.totalPages = Math.ceil(total / this.pageSize);
      } catch (error) {
        // 静默处理错误，不显示任何通知或错误状态
        console.error('Error fetching apps:', error);
        this.apps = [];
        this.filteredApps = [];
        this.totalItems = 0;
        this.totalPages = 0;
      } finally {
        this.loading = false;
      }
    },

    async fetchCategories() {
      this.categoriesLoading = true;
      try {
        const result = await adminService.getCategories();
        // 参考CategoryManager的处理方式
        let categories = [];
        if (Array.isArray(result)) {
          categories = result;
        } else if (result && Array.isArray(result.data)) {
          categories = result.data;
        } else if (result && typeof result === 'object') {
          categories = Object.values(result);
        }

        // 确保每个分类都有必需的属性
        this.categories = categories.map(category => ({
          id: category.id || category._id,
          name: category.name || 'Unnamed Category',
          description: category.description || ''
        }));

        // 强制重新渲染
        this.$forceUpdate();
      } catch (error) {
        console.error('Error fetching categories:', error);
        this.categories = [];
      } finally {
        this.categoriesLoading = false;
      }
    },

    getCategoryName(categoryIdOrName) {
      if (!categoryIdOrName) return 'No Category';

      // 先尝试按ID查找
      let category = this.categories.find(cat => cat.id === categoryIdOrName);

      // 如果按ID找不到，再按名称查找
      if (!category) {
        category = this.categories.find(cat => cat.name === categoryIdOrName);
      }

      return category ? category.name : 'Unknown Category';
    },

    // 添加分类到应用
    addCategory() {
      if (
        this.selectedCategoryToAdd &&
        !this.appForm.categoryIds.includes(this.selectedCategoryToAdd)
      ) {
        this.appForm.categoryIds.push(this.selectedCategoryToAdd);
        this.selectedCategoryToAdd = '';
      }
    },

    // 从应用中移除分类
    removeCategory(categoryId) {
      const index = this.appForm.categoryIds.indexOf(categoryId);
      if (index > -1) {
        this.appForm.categoryIds.splice(index, 1);
      }
    },

    searchApps() {
      // 清除之前的定时器
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // 设置新的定时器，500ms后执行搜索
      this.searchTimeout = setTimeout(() => {
        if (!this.searchQuery.trim()) {
          // 搜索为空时，重新获取当前页数据
          this.currentPage = 1;
          this.fetchApps();
          return;
        }

        // 有搜索条件时，重置到第一页并搜索
        this.currentPage = 1;
        this.fetchApps();
      }, 500);
    },

    // 分页方法
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.fetchApps();
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchApps();
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchApps();
      }
    },

    changePageSize(newSize) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.fetchApps();
    },

    async openAddAppForm() {
      // 重定向到创建应用页面
      this.$router.push('/admin/applications/create');
    },

    // 截图管理方法
    async manageScreenshots(app) {
      this.screenshotsApp = app;
      this.screenshots = [];

      try {
        // 这里可以调用API获取现有截图
        // const screenshots = await adminService.getAppScreenshots(app.id);
        // this.screenshots = screenshots || [];
      } catch (error) {
        console.error('Error fetching screenshots:', error);
      }

      this.showScreenshotsModal = true;
    },

    // 格式化下载量显示
    formatDownloads(count) {
      if (count === 0) return '0';
      if (count < 1000) return count.toString();
      if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
      if (count < 1000000000) return (count / 1000000).toFixed(1) + 'M';
      return (count / 1000000000).toFixed(1) + 'B';
    },

    closeScreenshotsModal() {
      // 清理所有预览URL以避免内存泄漏
      this.screenshots.forEach(screenshot => {
        if (screenshot.previewUrl) {
          URL.revokeObjectURL(screenshot.previewUrl);
        }
      });

      this.showScreenshotsModal = false;
      this.screenshotsApp = null;
      this.screenshots = [];
    },

    handleScreenshotUpload(files) {
      // files 可能是单个文件或文件数组
      const fileArray = Array.isArray(files) ? files : [files];

      fileArray.forEach(file => {
        // 创建本地预览URL用于显示
        const previewUrl = URL.createObjectURL(file.file || file);

        this.screenshots.push({
          previewUrl: previewUrl, // 用于预览显示
          uri: file.url?.iconURI || file.url?.uri || '', // API返回的URI
          caption: file.name || 'Screenshot'
        });
      });

      // 清空FileUpload组件的预览，让它回到初始状态
      this.$nextTick(() => {
        if (this.$refs.screenshotUpload) {
          this.$refs.screenshotUpload.clearFiles();
        }
      });
    },

    removeScreenshot(index) {
      // 清理预览URL以避免内存泄漏
      const screenshot = this.screenshots[index];
      if (screenshot.previewUrl) {
        URL.revokeObjectURL(screenshot.previewUrl);
      }
      this.screenshots.splice(index, 1);
    },

    async saveScreenshots() {
      if (!this.screenshotsApp) return;

      this.savingScreenshots = true;
      try {
        // 构建包含icons数组的map结构
        const payload = {
          icons: this.screenshots.map(screenshot => ({
            uri: screenshot.uri,
            caption: screenshot.caption || ''
          }))
        };

        // 调用API保存截图
        await adminService.submitScreenshots(this.screenshotsApp.id, payload);

        this.$emit('show-notification', {
          type: 'success',
          message: 'Screenshots updated successfully'
        });

        this.closeScreenshotsModal();
      } catch (error) {
        console.error('Error saving screenshots:', error);
        this.$emit('show-notification', {
          type: 'error',
          message: 'Failed to save screenshots'
        });
      } finally {
        this.savingScreenshots = false;
      }
    },

    confirmDeleteApp(app) {
      this.appToDelete = app;
      this.showDeleteConfirmation = true;
    },

    async deleteApp() {
      if (!this.appToDelete) return;

      try {
        await adminService.deleteApplication(this.appToDelete.id);
        this.$emit('show-notification', {
          type: 'success',
          message: `Application "${this.appToDelete.name}" deleted successfully`
        });
        this.fetchApps();
      } catch (error) {
        console.error('Error deleting app:', error);
        this.$emit('show-notification', {
          type: 'error',
          message: `Failed to delete application "${this.appToDelete.name}"`
        });
      } finally {
        this.showDeleteConfirmation = false;
        this.appToDelete = null;
      }
    },

    handleIconUpload(file) {
      // file 结构: { name: '...', url: {iconURI: 'path/to/file.jpg'}, file: ... }
      // 我们需要提取 file.url.iconURI 的值
      if (file && file.url && file.url.iconURI) {
        this.appForm.iconURI = file.url.iconURI;
      } else if (file && file.iconURI) {
        this.appForm.iconURI = file.iconURI;
      } else {
        console.error('无法从 file 参数中提取 iconURI:', file);
      }
    },

    // 计算可见的页码
    getVisiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;

      if (total <= 7) {
        // 总页数少于等于7页，显示所有页码
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // 总页数大于7页，显示省略号
        if (current <= 4) {
          // 当前页在前面
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          // 当前页在后面
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) {
            pages.push(i);
          }
        } else {
          // 当前页在中间
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }

      return pages;
    }
  },
  created() {
    this.fetchApps();
    // 移除初始化时的fetchCategories调用，只在需要时获取
  },
  beforeUnmount() {
    // 清理定时器，防止内存泄漏
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
};
</script>

<style lang="scss" scoped>
.apps-manager {
  .section-header {
    margin-bottom: 1.5rem;

    h2 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .app-actions {
    margin-bottom: 1.5rem;

    .add-app-btn {
      padding: 0.5rem 1rem;
      background-color: var(--accent-primary);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      width: auto;

      &:hover {
        background-color: var(--accent-primary-dark);
      }

      i {
        font-size: 0.8rem;
      }
    }
  }

  .search-bar {
    margin-bottom: 1.5rem;

    input {
      width: 100%;
      padding: 0.75rem;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background-color: var(--card-bg);
      color: var(--text-primary);
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
      }
    }
  }

  .app-list {
    .loading-state,
    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: var(--text-secondary);

      button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: var(--accent-primary);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    }

    .apps-table {
      background: var(--card-bg);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      table {
        width: 100%;
        border-collapse: collapse;

        th,
        td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        th {
          font-weight: 600;
          color: var(--text-secondary);
          background-color: var(--surface-secondary);
        }

        .app-icon {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          object-fit: cover;
        }

        .app-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;

          .category-badge {
            padding: 0.2rem 0.5rem;
            background-color: var(--accent-primary);
            color: white;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
          }

          .no-category {
            color: var(--text-secondary);
            font-style: italic;
            font-size: 0.9rem;
          }
        }

        .downloads-count {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          background-color: var(--surface-secondary);
          color: var(--text-primary);
          display: inline-block;
          min-width: 40px;
          text-align: center;
        }

        td.actions {
          display: flex;
          gap: 0.5rem;

          button,
          .edit-btn {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            position: relative;
            z-index: 1;

            &.edit-btn {
              background-color: var(--surface-secondary);
              color: var(--text-primary);
              text-decoration: none;

              &:hover {
                background-color: var(--accent-primary);
                color: white;
              }
            }

            &.screenshots-btn {
              background-color: var(--surface-secondary);
              color: var(--text-primary);

              &:hover {
                background-color: var(--info-color, #17a2b8);
                color: white;
              }
            }

            &.delete-btn {
              background-color: var(--surface-secondary);
              color: var(--error-color, #dc3545);

              &:hover {
                background-color: var(--error-color, #dc3545);
                color: white;
              }
            }
          }
        }
      }
    }
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .modal-content {
      background-color: var(--card-bg);
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .modal-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary);
        }
      }

      .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
      }
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-primary);
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 0.9rem;
        background-color: var(--card-bg);
        color: var(--text-primary);

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
      }

      textarea {
        resize: vertical;
      }
    }

    .category-selection {
      .selected-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;

        .category-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: var(--accent-primary);
          color: white;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;

          .remove-category {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            line-height: 1;
            cursor: pointer;
            padding: 0;
            margin: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;

            &:hover {
              background-color: rgba(255, 255, 255, 0.2);
            }
          }
        }
      }

      .category-selector {
        width: 100%;
        margin-bottom: 0.5rem;
      }

      .form-hint {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0;
        font-style: italic;
      }
    }

    .form-actions,
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;

      button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;

        &.cancel-btn {
          background-color: var(--surface-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);

          &:hover {
            background-color: var(--surface-tertiary);
          }
        }

        &.save-btn {
          background-color: var(--accent-primary);
          color: white;
          border: none;

          &:hover {
            background-color: var(--accent-primary-dark);
          }

          &:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
          }
        }

        &.delete-btn {
          background-color: var(--error-color, #dc3545);
          color: white;
          border: none;

          &:hover {
            background-color: var(--error-color-dark, #c82333);
          }
        }
      }
    }

    .warning {
      color: var(--error-color, #dc3545);
      font-weight: 500;
    }

    // 删除确认弹窗的特殊样式
    .modal-content.delete-modal {
      max-width: 480px;

      .modal-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color);
        background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);

        .delete-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
        }

        h3 {
          margin: 0;
          color: #2d3748;
          font-size: 1.25rem;
          font-weight: 600;
        }
      }

      .modal-body {
        padding: 1.5rem;

        p {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          line-height: 1.5;

          &:last-child {
            margin-bottom: 0;
          }

          strong {
            color: #2d3748;
            font-weight: 600;
          }
        }

        .warning {
          color: #e53e3e;
          font-weight: 500;
          font-size: 0.9rem;
          background: #fed7d7;
          padding: 0.75rem;
          border-radius: 6px;
          border-left: 4px solid #e53e3e;
        }
      }

      .modal-actions {
        padding: 1rem 1.5rem;
        background: #f7fafc;
        border-top: 1px solid var(--border-color);
        gap: 0.75rem;

        button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s ease;

          i {
            font-size: 0.9rem;
          }

          &.cancel-btn {
            background: white;
            color: #4a5568;
            border: 1px solid #e2e8f0;

            &:hover {
              background: #f7fafc;
              border-color: #cbd5e0;
              transform: translateY(-1px);
            }
          }

          &.delete-btn {
            background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%);
            color: white;
            border: none;
            box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);

            &:hover {
              background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
              box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
              transform: translateY(-1px);
            }
          }
        }
      }
    }
  }

  // 分页样式
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    padding: 1rem 0;
    border-top: 1px solid var(--border-color);

    .pagination-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--text-secondary);
      font-size: 0.9rem;

      .page-size-selector {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--card-bg);
        color: var(--text-primary);
        font-size: 0.9rem;
      }
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .pagination-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--card-bg);
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          background-color: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .page-numbers {
        display: flex;
        gap: 0.25rem;

        .page-btn {
          min-width: 2.5rem;
          height: 2.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--card-bg);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;

          &:hover:not(:disabled):not(.ellipsis) {
            background-color: var(--accent-primary);
            color: white;
            border-color: var(--accent-primary);
          }

          &.active {
            background-color: var(--accent-primary);
            color: white;
            border-color: var(--accent-primary);
          }

          &.ellipsis {
            border: none;
            background: none;
            cursor: default;
            color: var(--text-secondary);
          }

          &:disabled {
            cursor: not-allowed;
          }
        }
      }
    }
  }

  // 截图管理模态框样式
  .modal-content.screenshots-modal {
    max-width: 800px;
    max-height: 90vh;

    .modal-body {
      .screenshots-section {
        margin-bottom: 2rem;

        h4 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
        }

        .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;

          .screenshot-item {
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            background: var(--surface-secondary);

            .screenshot-image {
              width: 100%;
              height: 150px;
              object-fit: cover;
            }

            .screenshot-info {
              padding: 0.75rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 0.5rem;

              .caption-input {
                flex: 1;
                padding: 0.5rem;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                font-size: 0.9rem;
                background-color: var(--surface-primary);
                color: var(--text-primary);

                &:focus {
                  outline: none;
                  border-color: var(--accent-primary);
                }

                &::placeholder {
                  color: var(--text-secondary);
                }
              }

              .screenshot-caption {
                margin: 0;
                font-size: 0.9rem;
                color: var(--text-primary);
                flex: 1;
                margin-right: 0.5rem;
              }

              .remove-screenshot-btn {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1.1rem;
                color: var(--error-color, #dc3545);
                padding: 0.25rem;
                border-radius: 4px;
                transition: background-color 0.2s ease;
                flex-shrink: 0;

                &:hover {
                  background-color: var(--error-bg, rgba(220, 53, 69, 0.1));
                }
              }
            }
          }
        }

        .no-screenshots {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
          background: var(--surface-secondary);
          border-radius: 8px;
          border: 2px dashed var(--border-color);

          p {
            margin: 0;
            font-style: italic;
          }
        }
      }

      .upload-section {
        h4 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
