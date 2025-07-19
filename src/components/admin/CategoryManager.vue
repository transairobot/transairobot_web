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
          <button type="submit" class="save-btn">
            {{ editingCategory ? 'Update Category' : 'Create Category' }}
          </button>
        </div>
      </form>
    </div>

    <div class="category-list">
      <LoadingState v-if="loading" />
      <ErrorState v-else-if="error" :message="error" @retry="fetchCategories" />

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
                <button class="edit-btn" @click="editCategory(category)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" @click="confirmDeleteCategory(category)">
                  <i class="fas fa-trash"></i>
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
import { mapState, mapActions } from 'vuex';
import LoadingState from '../common/LoadingState.vue';
import ErrorState from '../common/ErrorState.vue';

export default {
  name: 'CategoryManager',
  components: {
    LoadingState,
    ErrorState
  },
  data() {
    return {
      showAddCategoryForm: false,
      editingCategory: null,
      categoryForm: {
        name: '',
        description: ''
      },
      showDeleteConfirmation: false,
      categoryToDelete: null,
      loading: false,
      error: null
    };
  },
  computed: {
    ...mapState('admin', ['categories'])
  },
  methods: {
    ...mapActions('admin', [
      'fetchCategories',
      'createCategory',
      'updateCategory',
      'deleteCategory'
    ]),

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
      try {
        if (this.editingCategory) {
          // Update existing category
          await this.updateCategory({
            categoryId: this.editingCategory.id,
            categoryData: this.categoryForm
          });

          this.$emit('show-notification', {
            type: 'success',
            message: `Category "${this.categoryForm.name}" updated successfully`
          });
        } else {
          // Create new category
          const result = await this.createCategory(this.categoryForm);

          if (result.success) {
            this.$emit('show-notification', {
              type: 'success',
              message: `Category "${this.categoryForm.name}" created successfully`
            });
          }
        }

        // Reset form
        this.cancelCategoryForm();

        // Refresh categories
        this.fetchCategories();
      } catch (error) {
        console.error('Error saving category:', error);

        this.$emit('show-notification', {
          type: 'error',
          message: `Failed to ${this.editingCategory ? 'update' : 'create'} category`
        });
      }
    },

    confirmDeleteCategory(category) {
      this.categoryToDelete = category;
      this.showDeleteConfirmation = true;
    },

    async deleteCategory() {
      if (!this.categoryToDelete) return;

      try {
        await this.deleteCategory(this.categoryToDelete.id);

        this.$emit('show-notification', {
          type: 'success',
          message: `Category "${this.categoryToDelete.name}" deleted successfully`
        });

        // Refresh categories
        this.fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);

        this.$emit('show-notification', {
          type: 'error',
          message: `Failed to delete category "${this.categoryToDelete.name}"`
        });
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
.category-manager {
  .section-header {
    margin-bottom: $spacing-lg;

    h2 {
      margin: 0 0 $spacing-xs 0;
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
    }

    .form-group {
      margin-bottom: $spacing-md;

      label {
        display: block;
        margin-bottom: $spacing-xs;
        font-weight: 500;
      }

      input,
      textarea {
        width: 100%;
        padding: $spacing-sm;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background-color: var(--bg-primary);
        color: var(--text-primary);
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
        }
      }
    }
  }

  .category-list {
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: var(--text-secondary);
    }

    .categories-table {
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
      background-color: var(--bg-primary);
      padding: $spacing-lg;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;

      h3 {
        margin-top: 0;
        margin-bottom: $spacing-md;
      }

      p {
        margin-bottom: $spacing-md;
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
              background-color: var(--danger-dark);
            }
          }
        }
      }
    }
  }
}
</style>
