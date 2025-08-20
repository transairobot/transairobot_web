<template>
  <div class="category-manager">
    <div class="section-header">
      <h2>Category Management</h2>
      <p>Create and manage store categories</p>
    </div>

    <div class="category-actions">
      <button class="add-category-btn" @click="showAddCategoryForm = true">
        <i class="fas fa-plus"></i> Add New Category
      </button>
    </div>

    <div class="category-form" v-if="showAddCategoryForm">
      <h3>{{ editingCategory ? 'Edit Category' : 'Add New Category' }}</h3>
      <form @submit.prevent="saveCategory">
        <div class="form-group">
          <label for="categoryName">Category Name</label>
          <input
            type="text"
            id="categoryName"
            v-model="categoryForm.name"
            placeholder="Enter category name"
            required
          />
        </div>

        <div class="form-group">
          <label for="categoryDescription">Description (optional)</label>
          <textarea
            id="categoryDescription"
            v-model="categoryForm.description"
            placeholder="Enter category description"
            rows="3"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="cancelCategoryForm">Cancel</button>
          <button type="submit" class="save-btn" :disabled="saving">
            {{ saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category' }}
          </button>
        </div>
      </form>
    </div>

    <div class="category-list">
      <div v-if="loading" class="loading-state">
        <p>Loading categories...</p>
      </div>

      <div v-else-if="categories.length === 0" class="empty-state">
        <p>No categories found</p>
      </div>

      <div v-else class="categories-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Apps</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id">
              <td>{{ category.name }}</td>
              <td>{{ category.count || 0 }}</td>
              <td class="actions">
                <button class="edit-btn" @click="editCategory(category)" title="Edit">✏️</button>
                <button class="delete-btn" @click="confirmDeleteCategory(category)" title="Delete">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal" v-if="showDeleteConfirmation">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete the category "{{ categoryToDelete?.name }}"?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteConfirmation = false">Cancel</button>
          <button class="delete-btn" @click="deleteCategory">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { adminService } from '@/services';

export default {
  name: 'CategoryManager',
  data() {
    return {
      categories: [],
      loading: false,
      error: null,
      showAddCategoryForm: false,
      editingCategory: null,
      categoryForm: {
        name: '',
        description: ''
      },
      saving: false,
      showDeleteConfirmation: false,
      categoryToDelete: null
    };
  },
  methods: {
    async fetchCategories() {
      this.loading = true;
      this.error = null;

      try {
        const result = await adminService.getCategories();
        // The API service already extracts the data from the response
        // Handle different possible data structures
        let categories = [];
        if (Array.isArray(result)) {
          categories = result;
        } else if (result && Array.isArray(result.data)) {
          categories = result.data;
        } else if (result && typeof result === 'object') {
          categories = Object.values(result);
        } else {
          console.log('Unexpected result structure:', result);
        }

        // Ensure each category has the required properties
        this.categories = categories.map(category => ({
          id: category.id || category._id,
          name: category.name || 'Unnamed Category',
          description: category.description || '',
          count: category.count || category.appCount || 0
        }));

        // Force a re-render
        this.$forceUpdate();
      } catch (error) {
        this.error = 'Failed to load categories';
        this.categories = [];
      } finally {
        this.loading = false;
      }
    },

    editCategory(category) {
      this.editingCategory = category;
      this.categoryForm = {
        name: category.name,
        description: category.description || ''
      };
      this.showAddCategoryForm = true;
    },

    cancelCategoryForm() {
      this.showAddCategoryForm = false;
      this.editingCategory = null;
      this.categoryForm = {
        name: '',
        description: ''
      };
    },

    async saveCategory() {
      this.saving = true;

      try {
        if (this.editingCategory) {
          await adminService.updateCategory(this.editingCategory.id, this.categoryForm);
        } else {
          await adminService.createCategory(this.categoryForm);
        }

        this.cancelCategoryForm();
        this.fetchCategories();
      } catch (error) {
        console.error('Error saving category:', error);
      } finally {
        this.saving = false;
      }
    },

    confirmDeleteCategory(category) {
      this.categoryToDelete = category;
      this.showDeleteConfirmation = true;
    },

    async deleteCategory() {
      if (!this.categoryToDelete) return;

      try {
        await adminService.deleteCategory(this.categoryToDelete.id);
        this.fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      } finally {
        this.showDeleteConfirmation = false;
        this.categoryToDelete = null;
      }
    }
  },
  created() {
    this.fetchCategories();
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.category-manager {
  .section-header {
    margin-bottom: $spacing-lg;

    h2 {
      margin: 0 0 $spacing-xs 0;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .category-actions {
    margin-bottom: $spacing-lg;

    .add-category-btn {
      padding: $spacing-sm $spacing-md;
      background-color: var(--accent-primary);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: $spacing-xs;

      &:hover {
        background-color: var(--accent-primary-dark);
      }

      i {
        font-size: 0.8rem;
      }
    }
  }

  .category-form {
    background-color: var(--bg-secondary);
    padding: $spacing-lg;
    border-radius: 8px;
    margin-bottom: $spacing-xl;

    h3 {
      margin-top: 0;
      margin-bottom: $spacing-md;
      color: var(--text-primary);
    }

    .form-group {
      margin-bottom: $spacing-md;

      label {
        display: block;
        margin-bottom: $spacing-xs;
        font-weight: 500;
        color: var(--text-primary);
      }

      input,
      textarea {
        width: 100%;
        padding: $spacing-sm;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background-color: var(--input-bg);
        color: var(--input-text);
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
      }

      textarea {
        resize: vertical;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: $spacing-md;

      button {
        padding: $spacing-sm $spacing-lg;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;

        &.cancel-btn {
          background-color: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);

          &:hover {
            background-color: var(--bg-secondary);
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
            background-color: var(--text-secondary);
            cursor: not-allowed;
          }
        }
      }
    }
  }

  .category-list {
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
        margin-top: $spacing-md;
        padding: $spacing-sm $spacing-md;
        background: var(--accent-primary);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: var(--accent-primary-dark);
        }
      }
    }

    .categories-table {
      background: var(--card-bg);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: var(--shadow);

      table {
        width: 100%;
        border-collapse: collapse;

        th,
        td {
          padding: $spacing-md;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        th {
          font-weight: 600;
          color: var(--text-secondary);
          background-color: var(--bg-secondary);
        }

        td {
          color: var(--text-primary);
        }

        td.actions {
          display: flex;
          gap: $spacing-sm;

          button {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            border: none;
            cursor: pointer;

            &.edit-btn {
              background-color: var(--bg-secondary);
              color: var(--text-primary);

              &:hover {
                background-color: var(--accent-primary);
                color: white;
              }
            }

            &.delete-btn {
              background-color: var(--bg-secondary);
              color: var(--danger);

              &:hover {
                background-color: var(--danger);
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
      padding: $spacing-lg;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;

      h3 {
        margin-top: 0;
        margin-bottom: $spacing-md;
        color: var(--text-primary);
      }

      p {
        margin-bottom: $spacing-md;
        color: var(--text-primary);
      }

      .warning {
        color: var(--danger);
        font-weight: 500;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: $spacing-md;

        button {
          padding: $spacing-sm $spacing-lg;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;

          &.cancel-btn {
            background-color: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border-color);

            &:hover {
              background-color: var(--bg-secondary);
            }
          }

          &.delete-btn {
            background-color: var(--danger);
            color: white;
            border: none;

            &:hover {
              background-color: var(--error);
            }
          }
        }
      }
    }
  }
}
</style>
