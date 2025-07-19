<template>
  <div class="documentation-manager">
    <div class="manager-header">
      <h1>Documentation Manager</h1>
      <div class="header-actions">
        <button class="create-button" @click="createNewDocument">Create New Document</button>
        <button class="create-button" @click="createNewCategory">Create New Category</button>
      </div>
    </div>

    <div class="manager-content">
      <DocumentationStructureManager
        :categories="categories"
        :documents="documents"
        :isLoading="isLoading"
        @select-document="selectDocument"
        @select-category="selectCategory"
        @reorder="handleReorder"
      />

      <div class="editor-container">
        <template v-if="selectedDocument">
          <h2>Edit Document</h2>
          <DocumentationEditor
            :document="selectedDocument"
            @save="saveDocument"
            @cancel="cancelEdit"
          />
        </template>

        <template v-else-if="selectedCategory">
          <h2>Edit Category</h2>
          <CategoryEditor :category="selectedCategory" @save="saveCategory" @cancel="cancelEdit" />
        </template>

        <template v-else-if="isCreatingDocument">
          <h2>Create New Document</h2>
          <DocumentationEditor @save="saveDocument" @cancel="cancelEdit" />
        </template>

        <template v-else-if="isCreatingCategory">
          <h2>Create New Category</h2>
          <CategoryEditor @save="saveCategory" @cancel="cancelEdit" />
        </template>

        <div v-else class="empty-state">
          <p>Select a document or category to edit, or create a new one.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import DocumentationStructureManager from '@/components/documentation/DocumentationStructureManager.vue';
import DocumentationEditor from '@/components/documentation/DocumentationEditor.vue';
import CategoryEditor from '@/components/documentation/CategoryEditor.vue';

export default defineComponent({
  name: 'DocumentationManagerPage',

  components: {
    DocumentationStructureManager,
    DocumentationEditor,
    CategoryEditor
  },

  setup() {
    const store = useStore();
    const router = useRouter();

    // State
    const selectedDocument = ref(null);
    const selectedCategory = ref(null);
    const isCreatingDocument = ref(false);
    const isCreatingCategory = ref(false);

    // Get data from store
    const categories = computed(() => store.getters['documentation/allCategories']);
    const documents = computed(() => store.getters['documentation/allDocuments']);
    const isLoading = computed(() => store.getters['documentation/isLoading']);

    // Initialize data
    onMounted(async () => {
      try {
        // Fetch versions, categories, and documents
        await Promise.all([
          store.dispatch('documentation/fetchVersions'),
          store.dispatch('documentation/fetchCategories'),
          store.dispatch('documentation/fetchDocuments')
        ]);
      } catch (error) {
        console.error('Error initializing documentation manager:', error);

        // Show error notification
        store.dispatch('notification/show', {
          type: 'error',
          message: 'Failed to load documentation data'
        });
      }
    });

    // Select a document for editing
    const selectDocument = documentId => {
      // Reset other selections
      selectedCategory.value = null;
      isCreatingDocument.value = false;
      isCreatingCategory.value = false;

      // Find the document
      selectedDocument.value = documents.value.find(doc => doc.id === documentId);
    };

    // Select a category for editing
    const selectCategory = categoryId => {
      // Reset other selections
      selectedDocument.value = null;
      isCreatingDocument.value = false;
      isCreatingCategory.value = false;

      // Find the category
      selectedCategory.value = categories.value.find(cat => cat.id === categoryId);
    };

    // Create new document
    const createNewDocument = () => {
      // Reset other selections
      selectedDocument.value = null;
      selectedCategory.value = null;
      isCreatingCategory.value = false;

      // Set creating document flag
      isCreatingDocument.value = true;
    };

    // Create new category
    const createNewCategory = () => {
      // Reset other selections
      selectedDocument.value = null;
      selectedCategory.value = null;
      isCreatingDocument.value = false;

      // Set creating category flag
      isCreatingCategory.value = true;
    };

    // Save document
    const saveDocument = async documentData => {
      try {
        if (selectedDocument.value) {
          // Update existing document
          await store.dispatch('documentation/updateDocument', {
            id: selectedDocument.value.id,
            documentData
          });

          // Show success notification
          store.dispatch('notification/show', {
            type: 'success',
            message: 'Document updated successfully'
          });
        } else {
          // Create new document
          await store.dispatch('documentation/createDocument', documentData);

          // Show success notification
          store.dispatch('notification/show', {
            type: 'success',
            message: 'Document created successfully'
          });
        }

        // Reset selections
        cancelEdit();

        // Refresh documents
        await store.dispatch('documentation/fetchDocuments');
      } catch (error) {
        console.error('Error saving document:', error);

        // Show error notification
        store.dispatch('notification/show', {
          type: 'error',
          message: `Failed to save document: ${error.message}`
        });
      }
    };

    // Save category
    const saveCategory = async categoryData => {
      try {
        if (selectedCategory.value) {
          // Update existing category
          await store.dispatch('documentation/updateCategory', {
            id: selectedCategory.value.id,
            categoryData
          });

          // Show success notification
          store.dispatch('notification/show', {
            type: 'success',
            message: 'Category updated successfully'
          });
        } else {
          // Create new category
          await store.dispatch('documentation/createCategory', categoryData);

          // Show success notification
          store.dispatch('notification/show', {
            type: 'success',
            message: 'Category created successfully'
          });
        }

        // Reset selections
        cancelEdit();

        // Refresh categories
        await store.dispatch('documentation/fetchCategories');
      } catch (error) {
        console.error('Error saving category:', error);

        // Show error notification
        store.dispatch('notification/show', {
          type: 'error',
          message: `Failed to save category: ${error.message}`
        });
      }
    };

    // Handle reordering of documents or categories
    const handleReorder = async reorderData => {
      try {
        if (reorderData.type === 'document') {
          // Update document order
          await store.dispatch('documentation/updateDocument', {
            id: reorderData.id,
            documentData: {
              order: reorderData.newOrder,
              categoryId: reorderData.newCategoryId || reorderData.categoryId
            }
          });
        } else if (reorderData.type === 'category') {
          // Update category order
          await store.dispatch('documentation/updateCategory', {
            id: reorderData.id,
            categoryData: {
              order: reorderData.newOrder,
              parentId: reorderData.newParentId || reorderData.parentId
            }
          });
        }

        // Refresh data
        await Promise.all([
          store.dispatch('documentation/fetchCategories'),
          store.dispatch('documentation/fetchDocuments')
        ]);
      } catch (error) {
        console.error('Error reordering items:', error);

        // Show error notification
        store.dispatch('notification/show', {
          type: 'error',
          message: `Failed to reorder items: ${error.message}`
        });
      }
    };

    // Cancel editing
    const cancelEdit = () => {
      selectedDocument.value = null;
      selectedCategory.value = null;
      isCreatingDocument.value = false;
      isCreatingCategory.value = false;
    };

    return {
      categories,
      documents,
      isLoading,
      selectedDocument,
      selectedCategory,
      isCreatingDocument,
      isCreatingCategory,
      selectDocument,
      selectCategory,
      createNewDocument,
      createNewCategory,
      saveDocument,
      saveCategory,
      handleReorder,
      cancelEdit
    };
  }
});
</script>

<style lang="scss" scoped>
.documentation-manager {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;

  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h1 {
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;

      .create-button {
        background-color: var(--color-primary);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          background-color: var(--color-primary-dark);
        }
      }
    }
  }

  .manager-content {
    display: flex;
    gap: 2rem;

    .editor-container {
      flex: 1;

      h2 {
        margin-top: 0;
        margin-bottom: 1.5rem;
      }

      .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        background-color: var(--color-surface);
        border-radius: 8px;
        color: var(--color-text-secondary);
        text-align: center;
        padding: 2rem;
      }
    }
  }

  // Responsive styles
  @media (max-width: 992px) {
    .manager-content {
      flex-direction: column;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;

    .manager-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }
}
</style>
