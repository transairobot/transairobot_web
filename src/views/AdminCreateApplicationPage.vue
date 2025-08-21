<template>
  <div class="admin-create-app-page">
    <AppHeader />
    <main>
      <div class="container">
        <div class="page-header">
          <div class="breadcrumb">
            <router-link to="/admin/store" class="breadcrumb-link">Store Management</router-link>
            <span class="breadcrumb-separator">></span>
            <span class="breadcrumb-current">{{
              isEditMode ? 'Edit Application' : 'New Application'
            }}</span>
          </div>
          <h1>{{ isEditMode ? 'Edit Application' : 'Create New Application' }}</h1>
          <p>
            {{
              isEditMode
                ? 'Update the application details below.'
                : 'Fill in the details below to create a new application for the store.'
            }}
          </p>
        </div>

        <div class="form-container">
          <form @submit.prevent="submitApplication" class="app-form">
            <!-- Basic Information Section -->
            <div class="form-section">
              <h2>Basic Information</h2>

              <div class="form-group">
                <label for="appName" class="required">Application Name</label>
                <input
                  type="text"
                  id="appName"
                  v-model="appForm.name"
                  placeholder="Enter application name"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="appDescription" class="required">Description</label>
                <textarea
                  id="appDescription"
                  v-model="appForm.description"
                  placeholder="Enter application description"
                  rows="4"
                  required
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="appVersion" class="required">Version</label>
                <input
                  type="text"
                  id="appVersion"
                  v-model="appForm.version"
                  placeholder="e.g., 1.0.0"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <!-- Categories Section -->
            <div class="form-section">
              <h2>Categories</h2>

              <div class="form-group">
                <label>Selected Categories</label>
                <div class="selected-categories" v-if="appForm.categoryIds.length > 0">
                  <span
                    v-for="categoryId in appForm.categoryIds"
                    :key="categoryId"
                    class="category-tag"
                  >
                    {{ getCategoryName(categoryId) }}
                    <button
                      type="button"
                      class="remove-category"
                      @click="removeCategory(categoryId)"
                      title="Remove category"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <div v-else class="no-categories">No categories selected</div>

                <select
                  v-model="selectedCategoryToAdd"
                  @change="addCategory"
                  :disabled="categoriesLoading"
                  class="category-selector"
                >
                  <option value="">
                    {{ categoriesLoading ? 'Loading categories...' : 'Select a category to add' }}
                  </option>
                  <option
                    v-for="category in availableCategories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
                <p class="form-hint">You can select multiple categories for this application</p>
              </div>
            </div>

            <!-- Icon Upload Section -->
            <div class="form-section">
              <h2>Application Icon</h2>

              <div class="form-group">
                <label>Icon Upload</label>
                <FileUpload
                  accept="image/*"
                  :multiple="false"
                  hint="Supports JPG, PNG formats, recommended size 512x512"
                  @upload-success="handleIconUpload"
                />
                <div v-if="appForm.iconURI" class="icon-preview">
                  <img :src="appForm.iconURI" alt="App Icon Preview" class="preview-image" />
                  <p class="preview-text">Icon Preview</p>
                </div>
              </div>
            </div>

            <!-- Config Section -->
            <div class="form-section">
              <h2>Application Configuration</h2>

              <div class="form-group">
                <label for="mainWasmUrl" class="required">Main WASM URL</label>
                <input
                  type="url"
                  id="mainWasmUrl"
                  v-model="appForm.config.mainWasmUrl"
                  placeholder="https://example.com/app.wasm"
                  required
                  class="form-input"
                />
                <p class="form-hint">URL to the main WebAssembly module</p>
              </div>

              <div class="form-group">
                <label>Link WASM Modules</label>
                <div class="wasm-modules">
                  <div
                    v-for="(module, index) in appForm.config.linkWasmModules"
                    :key="index"
                    class="wasm-module-item"
                  >
                    <div class="module-inputs">
                      <input
                        type="text"
                        v-model="module.linkPath"
                        placeholder="Link path (e.g., /lib/module.so)"
                        class="form-input"
                      />
                      <input
                        type="url"
                        v-model="module.wasmUrl"
                        placeholder="WASM URL (https://example.com/module.wasm)"
                        class="form-input"
                      />
                    </div>
                    <button
                      type="button"
                      class="remove-module-btn"
                      @click="removeLinkModule(index)"
                      title="Remove module"
                    >
                      🗑️
                    </button>
                  </div>

                  <button type="button" class="add-module-btn" @click="addLinkModule">
                    <i class="fas fa-plus"></i> Add Link Module
                  </button>
                </div>
                <p class="form-hint">Additional WASM modules that this application depends on</p>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="cancelCreation" :disabled="saving">
                Cancel
              </button>
              <button type="submit" class="create-btn" :disabled="saving || !isFormValid">
                {{
                  saving
                    ? isEditMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditMode
                    ? 'Update Application'
                    : 'Create Application'
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import FileUpload from '@/components/common/FileUpload.vue';
import { adminService } from '@/services';

export default {
  name: 'AdminCreateApplicationPage',
  components: {
    AppHeader,
    AppFooter,
    FileUpload
  },
  data() {
    return {
      appForm: {
        name: '',
        description: '',
        categoryIds: [],
        version: '',
        iconURI: '',
        config: {
          mainWasmUrl: '',
          linkWasmModules: []
        }
      },
      categories: [],
      categoriesLoading: false,
      selectedCategoryToAdd: '',
      saving: false,
      isEditMode: false,
      appId: null
    };
  },
  computed: {
    availableCategories() {
      return this.categories.filter(category => !this.appForm.categoryIds.includes(category.id));
    },
    isFormValid() {
      return (
        this.appForm.name.trim() &&
        this.appForm.description.trim() &&
        this.appForm.version.trim() &&
        this.appForm.config.mainWasmUrl.trim()
      );
    }
  },
  methods: {
    async fetchCategories() {
      this.categoriesLoading = true;
      try {
        const result = await adminService.getCategories();
        let categories = [];
        if (Array.isArray(result)) {
          categories = result;
        } else if (result && Array.isArray(result.data)) {
          categories = result.data;
        } else if (result && typeof result === 'object') {
          categories = Object.values(result);
        }

        this.categories = categories.map(category => ({
          id: category.id || category._id,
          name: category.name || 'Unnamed Category',
          description: category.description || ''
        }));
      } catch (error) {
        console.error('Error fetching categories:', error);
        this.categories = [];
      } finally {
        this.categoriesLoading = false;
      }
    },

    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.name : 'Unknown Category';
    },

    addCategory() {
      if (
        this.selectedCategoryToAdd &&
        !this.appForm.categoryIds.includes(this.selectedCategoryToAdd)
      ) {
        this.appForm.categoryIds.push(this.selectedCategoryToAdd);
        this.selectedCategoryToAdd = '';
      }
    },

    removeCategory(categoryId) {
      const index = this.appForm.categoryIds.indexOf(categoryId);
      if (index > -1) {
        this.appForm.categoryIds.splice(index, 1);
      }
    },

    handleIconUpload(file) {
      if (file && file.url && file.url.iconURI) {
        this.appForm.iconURI = file.url.iconURI;
      } else if (file && file.iconURI) {
        this.appForm.iconURI = file.iconURI;
      }
    },

    addLinkModule() {
      this.appForm.config.linkWasmModules.push({
        linkPath: '',
        wasmUrl: ''
      });
    },

    removeLinkModule(index) {
      this.appForm.config.linkWasmModules.splice(index, 1);
    },

    async createApplication() {
      if (!this.isFormValid) return;

      this.saving = true;
      try {
        // 清理空的 link modules
        const cleanedConfig = {
          ...this.appForm.config,
          linkWasmModules: this.appForm.config.linkWasmModules.filter(
            module => module.linkPath.trim() && module.wasmUrl.trim()
          )
        };

        const payload = {
          ...this.appForm,
          config: cleanedConfig
        };

        await adminService.createApplication(payload);

        const fromTab = this.$route.query.from || 'apps';
        this.$router.push({
          path: '/admin/store',
          query: { tab: fromTab, message: 'Application created successfully' }
        });
      } catch (error) {
        console.error('Error creating application:', error);
        // 这里可以添加错误提示
      } finally {
        this.saving = false;
      }
    },

    async updateApplication() {
      if (!this.isFormValid) return;

      this.saving = true;
      try {
        // 清理空的 link modules
        const cleanedConfig = {
          ...this.appForm.config,
          linkWasmModules: this.appForm.config.linkWasmModules.filter(
            module => module.linkPath.trim() && module.wasmUrl.trim()
          )
        };

        const payload = {
          name: this.appForm.name,
          description: this.appForm.description,
          categoryIds: this.appForm.categoryIds,
          version: this.appForm.version,
          iconURI: this.appForm.iconURI,
          config: cleanedConfig
        };

        await adminService.updateApplication(this.appId, payload);

        const fromTab = this.$route.query.from || 'apps';
        this.$router.push({
          path: '/admin/store',
          query: { tab: fromTab, message: 'Application updated successfully' }
        });
      } catch (error) {
        console.error('Error updating application:', error);
        // 这里可以添加错误提示
      } finally {
        this.saving = false;
      }
    },

    async submitApplication() {
      if (this.isEditMode) {
        await this.updateApplication();
      } else {
        await this.createApplication();
      }
    },

    async loadApplicationData() {
      if (!this.isEditMode || !this.appId) {
        return;
      }

      try {
        const app = await adminService.getApplication(this.appId);

        // 处理分类数据
        let categoryIds = [];
        if (app.categoryIds && Array.isArray(app.categoryIds)) {
          categoryIds = [...app.categoryIds];
        } else if (app.category) {
          if (Array.isArray(app.category)) {
            // 如果是分类名称数组，转换为ID数组
            categoryIds = app.category
              .map(categoryName => {
                const category = this.categories.find(cat => cat.name === categoryName);
                return category ? category.id : null;
              })
              .filter(id => id !== null);
          } else {
            // 单个分类
            const category = this.categories.find(
              cat => cat.id === app.category || cat.name === app.category
            );
            if (category) {
              categoryIds = [category.id];
            }
          }
        }

        this.appForm = {
          name: app.name || '',
          description: app.description || '',
          categoryIds: categoryIds,
          version: app.version || '',
          iconURI: app.iconURI || app.iconUrl || '',
          config: {
            mainWasmUrl: app.config?.mainWasmUrl || '',
            linkWasmModules: app.config?.linkWasmModules || []
          }
        };
      } catch (error) {
        console.error('Error loading application data:', error);

        // 添加用户友好的错误提示
        alert(`Failed to load application data: ${error.message || 'Unknown error'}`);

        // 如果加载失败，跳转回管理页面
        this.$router.push('/admin/store');
      }
    },

    cancelCreation() {
      // 检查是否有来源tab信息
      const fromTab = this.$route.query.from || 'apps';
      this.$router.push({
        path: '/admin/store',
        query: { tab: fromTab }
      });
    }
  },
  async created() {
    // 检查是否为编辑模式
    this.isEditMode = this.$route.name === 'AdminEditApplication';
    this.appId = this.$route.params.id;

    // 先获取分类数据
    await this.fetchCategories();

    // 如果是编辑模式，加载应用数据
    if (this.isEditMode) {
      await this.loadApplicationData();
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-create-app-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--surface-primary);

  main {
    flex: 1;
    padding: $spacing-xl 0;

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 $spacing-md;
    }
  }

  .page-header {
    margin-bottom: $spacing-xl;

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      margin-bottom: $spacing-md;
      font-size: 0.9rem;

      .breadcrumb-link {
        color: var(--accent-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      .breadcrumb-separator {
        color: var(--text-secondary);
      }

      .breadcrumb-current {
        color: var(--text-secondary);
      }
    }

    h1 {
      margin: 0 0 $spacing-sm 0;
      color: var(--text-primary);
      font-size: 2rem;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 1.1rem;
    }
  }

  .form-container {
    background: var(--card-bg);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .app-form {
    padding: $spacing-xl;

    .form-section {
      margin-bottom: $spacing-xl;
      padding-bottom: $spacing-xl;
      border-bottom: 1px solid var(--border-color);

      &:last-of-type {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      h2 {
        margin: 0 0 $spacing-lg 0;
        color: var(--text-primary);
        font-size: 1.3rem;
        font-weight: 600;
      }
    }

    .form-group {
      margin-bottom: $spacing-lg;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        margin-bottom: $spacing-sm;
        font-weight: 500;
        color: var(--text-primary);

        &.required::after {
          content: ' *';
          color: var(--error-color, #dc3545);
        }
      }

      .form-input,
      .form-textarea,
      .category-selector {
        width: 100%;
        padding: $spacing-md;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-size: 1rem;
        background-color: var(--surface-primary);
        color: var(--text-primary);
        transition: border-color 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
        }

        &::placeholder {
          color: var(--text-secondary);
        }
      }

      .form-textarea {
        resize: vertical;
        min-height: 100px;
      }

      .form-hint {
        margin: $spacing-sm 0 0 0;
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-style: italic;
      }
    }

    .selected-categories {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;
      margin-bottom: $spacing-md;
      padding: $spacing-md;
      background-color: var(--surface-secondary);
      border-radius: 8px;
      min-height: 60px;
      align-items: center;

      .category-tag {
        display: inline-flex;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-sm $spacing-md;
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

    .no-categories {
      padding: $spacing-md;
      background-color: var(--surface-secondary);
      border-radius: 8px;
      color: var(--text-secondary);
      font-style: italic;
      text-align: center;
      margin-bottom: $spacing-md;
    }

    .icon-preview {
      margin-top: $spacing-md;
      text-align: center;

      .preview-image {
        width: 100px;
        height: 100px;
        border-radius: 12px;
        object-fit: cover;
        border: 2px solid var(--border-color);
      }

      .preview-text {
        margin: $spacing-sm 0 0 0;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
    }

    .wasm-modules {
      .wasm-module-item {
        display: flex;
        gap: $spacing-md;
        margin-bottom: $spacing-md;
        padding: $spacing-md;
        background-color: var(--surface-secondary);
        border-radius: 8px;
        align-items: flex-start;

        .module-inputs {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: $spacing-sm;

          .form-input {
            margin: 0;
          }
        }

        .remove-module-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: var(--error-color, #dc3545);
          padding: $spacing-sm;
          border-radius: 4px;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: var(--error-bg, rgba(220, 53, 69, 0.1));
          }
        }
      }

      .add-module-btn {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-md;
        background-color: var(--surface-secondary);
        color: var(--text-primary);
        border: 2px dashed var(--border-color);
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
        width: 100%;
        justify-content: center;

        &:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background-color: rgba(var(--accent-primary-rgb), 0.05);
        }

        i {
          font-size: 0.9rem;
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: $spacing-md;
      margin-top: $spacing-xl;
      padding-top: $spacing-xl;
      border-top: 1px solid var(--border-color);

      button {
        padding: $spacing-md $spacing-xl;
        border-radius: 8px;
        font-weight: 500;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 140px;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &.cancel-btn {
          background-color: var(--surface-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);

          &:hover:not(:disabled) {
            background-color: var(--surface-tertiary);
          }
        }

        &.create-btn {
          background-color: var(--accent-primary);
          color: white;
          border: none;

          &:hover:not(:disabled) {
            background-color: var(--accent-primary-dark);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(var(--accent-primary-rgb), 0.3);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .admin-create-app-page {
    .container {
      padding: 0 $spacing-sm;
    }

    .app-form {
      padding: $spacing-lg;

      .wasm-modules .wasm-module-item {
        flex-direction: column;
        align-items: stretch;

        .module-inputs {
          .form-input {
            margin-bottom: $spacing-sm;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }

        .remove-module-btn {
          align-self: flex-end;
        }
      }

      .form-actions {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }
  }
}
</style>
