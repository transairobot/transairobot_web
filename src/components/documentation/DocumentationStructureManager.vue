<template>
  <div class="documentation-structure-manager">
    <h3>Documentation Structure</h3>
    <div v-if="isLoading" class="loading-state">Loading...</div>
    <div v-else-if="!categories.length" class="empty-state">No categories found.</div>
    <ul v-else class="category-list">
      <li v-for="category in nestedCategories" :key="category.id" class="category-item">
        <div class="item-content" @click="toggleCategory(category.id)">
          <span class="item-name">{{ category.name }}</span>
          <div class="item-actions">
            <button @click.stop="selectCategory(category.id)">Edit</button>
            <button @click.stop="confirmDeleteCategory(category.id)" class="delete-button">
              Delete
            </button>
          </div>
        </div>
        <ul v-if="isCategoryOpen(category.id)" class="document-list">
          <li
            v-for="document in documentsByCategory(category.id)"
            :key="document.id"
            class="document-item"
          >
            <div class="item-content">
              <span class="item-name">{{ document.title }}</span>
              <div class="item-actions">
                <button @click.stop="selectDocument(document.id)">Edit</button>
                <button @click.stop="confirmDeleteDocument(document.id)" class="delete-button">
                  Delete
                </button>
              </div>
            </div>
          </li>
          <li v-if="!documentsByCategory(category.id).length" class="empty-state-small">
            No documents in this category.
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'DocumentationStructureManager',
  props: {
    categories: {
      type: Array,
      required: true
    },
    documents: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select-document', 'select-category', 'reorder'],
  setup(props, { emit }) {
    const store = useStore();
    const openCategories = ref([]);

    const nestedCategories = computed(() => {
      const categoryMap = {};
      props.categories.forEach(cat => {
        categoryMap[cat.id] = { ...cat, children: [] };
      });

      const nested = [];
      props.categories.forEach(cat => {
        if (cat.parentId && categoryMap[cat.parentId]) {
          categoryMap[cat.parentId].children.push(categoryMap[cat.id]);
        } else {
          nested.push(categoryMap[cat.id]);
        }
      });
      return nested;
    });

    const documentsByCategory = categoryId => {
      return props.documents.filter(doc => doc.categoryId === categoryId);
    };

    const toggleCategory = categoryId => {
      const index = openCategories.value.indexOf(categoryId);
      if (index > -1) {
        openCategories.value.splice(index, 1);
      } else {
        openCategories.value.push(categoryId);
      }
    };

    const isCategoryOpen = categoryId => {
      return openCategories.value.includes(categoryId);
    };

    const selectDocument = documentId => {
      emit('select-document', documentId);
    };

    const selectCategory = categoryId => {
      emit('select-category', categoryId);
    };

    const confirmDeleteDocument = async documentId => {
      if (confirm('Are you sure you want to delete this document?')) {
        try {
          await store.dispatch('documentation/deleteDocument', documentId);
          store.dispatch('notification/show', {
            type: 'success',
            message: 'Document deleted successfully'
          });
          // Refresh data
          store.dispatch('documentation/fetchDocuments');
        } catch (error) {
          store.dispatch('notification/show', {
            type: 'error',
            message: `Error deleting document: ${error.message}`
          });
        }
      }
    };

    const confirmDeleteCategory = async categoryId => {
      if (
        confirm(
          'Are you sure you want to delete this category? This will also delete all documents within it.'
        )
      ) {
        try {
          await store.dispatch('documentation/deleteCategory', categoryId);
          store.dispatch('notification/show', {
            type: 'success',
            message: 'Category deleted successfully'
          });
          // Refresh data
          store.dispatch('documentation/fetchCategories');
          store.dispatch('documentation/fetchDocuments');
        } catch (error) {
          store.dispatch('notification/show', {
            type: 'error',
            message: `Error deleting category: ${error.message}`
          });
        }
      }
    };

    return {
      nestedCategories,
      documentsByCategory,
      toggleCategory,
      isCategoryOpen,
      selectDocument,
      selectCategory,
      confirmDeleteDocument,
      confirmDeleteCategory
    };
  }
});
</script>

<style lang="scss" scoped>
.documentation-structure-manager {
  width: 350px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  background-color: var(--color-surface);

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.5rem;
  }

  .loading-state,
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }

  .empty-state-small {
    padding: 0.5rem 1rem;
    color: var(--color-text-secondary);
    font-style: italic;
  }

  .category-list,
  .document-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .document-list {
    padding-left: 1rem;
    border-left: 1px solid var(--color-border);
    margin-left: 0.5rem;
  }

  .item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-background);
    }
  }

  .item-name {
    font-weight: 500;
  }

  .category-item > .item-content .item-name {
    font-weight: bold;
  }

  .item-actions {
    display: flex;
    gap: 0.5rem;

    button {
      background: none;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      cursor: pointer;

      &:hover {
        background-color: var(--color-surface);
      }

      &.delete-button {
        color: var(--color-error);
        border-color: var(--color-error);
        &:hover {
          background-color: var(--color-error);
          color: white;
        }
      }
    }
  }
}
</style>
