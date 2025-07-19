<template>
  <div class="documentation-editor">
    <div class="editor-header">
      <h1>{{ isNewDocument ? 'Create New Document' : 'Edit Document' }}</h1>

      <div class="editor-actions">
        <button class="cancel-button" @click="cancelEdit">Cancel</button>
        <button class="save-button" @click="saveDocument" :disabled="isSaving || !isFormValid">
          {{ isSaving ? 'Saving...' : 'Save Document' }}
        </button>
      </div>
    </div>

    <div class="editor-form">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="documentData.title"
          type="text"
          placeholder="Document title"
          required
        />
        <div v-if="validationErrors.title" class="error-message">
          {{ validationErrors.title }}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" v-model="documentData.categoryId" required>
            <option value="" disabled>Select a category</option>
            <option v-for="category in flattenedCategories" :key="category.id" :value="category.id">
              {{ category.indentation }}{{ category.name }}
            </option>
          </select>
          <div v-if="validationErrors.categoryId" class="error-message">
            {{ validationErrors.categoryId }}
          </div>
        </div>

        <div class="form-group">
          <label for="version">Version</label>
          <select id="version" v-model="documentData.version" required>
            <option value="" disabled>Select a version</option>
            <option v-for="version in versions" :key="version.id" :value="version.id">
              {{ version.name }}{{ version.isDefault ? ' (Default)' : '' }}
            </option>
          </select>
          <div v-if="validationErrors.version" class="error-message">
            {{ validationErrors.version }}
          </div>
        </div>

        <div class="form-group">
          <label for="access-level">Access Level</label>
          <select id="access-level" v-model="documentData.accessLevel" required>
            <option value="public">Public</option>
            <option value="registered">Registered Users</option>
            <option value="admin">Administrators</option>
            <option value="developer">Developers</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="order">Display Order</label>
        <input id="order" v-model.number="documentData.order" type="number" min="0" />
      </div>

      <div class="editor-tabs">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'edit' }"
          @click="activeTab = 'edit'"
        >
          Edit
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'preview' }"
          @click="activeTab = 'preview'"
        >
          Preview
        </button>
      </div>

      <div class="editor-content">
        <div v-show="activeTab === 'edit'" class="markdown-editor">
          <textarea
            v-model="documentData.content"
            placeholder="Write your documentation in Markdown..."
            rows="20"
            required
          ></textarea>
          <div v-if="validationErrors.content" class="error-message">
            {{ validationErrors.content }}
          </div>
        </div>

        <div v-show="activeTab === 'preview'" class="markdown-preview">
          <MarkdownRenderer :content="documentData.content || ''" :renderMath="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import MarkdownRenderer from '@/components/documentation/MarkdownRenderer.vue';

export default defineComponent({
  name: 'DocumentationEditor',

  components: {
    MarkdownRenderer
  },

  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    // Editor state
    const activeTab = ref('edit');
    const isSaving = ref(false);
    const validationErrors = ref({});

    // Get document ID from route params
    const documentId = computed(() => route.params.documentId);
    const isNewDocument = computed(() => !documentId.value || documentId.value === 'new');

    // Document data
    const documentData = ref({
      title: '',
      content: '',
      categoryId: '',
      version: '',
      accessLevel: 'public',
      order: 0
    });

    // Get data from store
    const categories = computed(() => store.getters['documentation/allCategories']);
    const versions = computed(() => store.getters['documentation/allVersions']);

    // Create flattened categories list with indentation for display
    const flattenedCategories = computed(() => {
      const result = [];

      // Helper function to flatten nested categories
      const flattenCategories = (categories, depth = 0) => {
        categories.forEach(category => {
          result.push({
            ...category,
            indentation: '—'.repeat(depth) + (depth > 0 ? ' ' : '')
          });

          if (category.children && category.children.length > 0) {
            flattenCategories(category.children, depth + 1);
          }
        });
      };

      flattenCategories(store.getters['documentation/nestedCategories']);
      return result;
    });

    // Validate form
    const validateForm = () => {
      const errors = {};

      if (!documentData.value.title.trim()) {
        errors.title = 'Title is required';
      }

      if (!documentData.value.categoryId) {
        errors.categoryId = 'Category is required';
      }

      if (!documentData.value.version) {
        errors.version = 'Version is required';
      }

      if (!documentData.value.content.trim()) {
        errors.content = 'Content is required';
      }

      validationErrors.value = errors;
      return Object.keys(errors).length === 0;
    };

    // Check if form is valid
    const isFormValid = computed(() => {
      return (
        documentData.value.title.trim() &&
        documentData.value.categoryId &&
        documentData.value.version &&
        documentData.value.content.trim()
      );
    });

    // Initialize data
    onMounted(async () => {
      try {
        // Fetch categories and versions
        await Promise.all([
          store.dispatch('documentation/fetchCategories'),
          store.dispatch('documentation/fetchVersions')
        ]);

        // Set default version if available
        if (versions.value.length > 0) {
          const defaultVersion = versions.value.find(v => v.isDefault);
          documentData.value.version = defaultVersion ? defaultVersion.id : versions.value[0].id;
        }

        // If editing an existing document, fetch it
        if (!isNewDocument.value) {
          const document = await store.dispatch(
            'documentation/fetchDocumentById',
            documentId.value
          );

          // Populate form with document data
          documentData.value = {
            title: document.title,
            content: document.content,
            categoryId: document.categoryId,
            version: document.version,
            accessLevel: document.accessLevel || 'public',
            order: document.order || 0
          };
        }
      } catch (error) {
        console.error('Error initializing editor:', error);
      }
    });

    // Save document
    const saveDocument = async () => {
      if (!validateForm()) {
        return;
      }

      isSaving.value = true;

      try {
        let result;

        if (isNewDocument.value) {
          // Create new document
          result = await store.dispatch('documentation/createDocument', documentData.value);
        } else {
          // Update existing document
          result = await store.dispatch('documentation/updateDocument', {
            id: documentId.value,
            documentData: documentData.value
          });
        }

        // Show success notification
        store.dispatch('notification/show', {
          type: 'success',
          message: `Document ${isNewDocument.value ? 'created' : 'updated'} successfully`
        });

        // Navigate to the document
        router.push({
          name: 'DocumentationDetail',
          params: { documentId: result.id }
        });
      } catch (error) {
        console.error('Error saving document:', error);

        // Show error notification
        store.dispatch('notification/show', {
          type: 'error',
          message: `Failed to ${isNewDocument.value ? 'create' : 'update'} document: ${
            error.message
          }`
        });
      } finally {
        isSaving.value = false;
      }
    };

    // Cancel editing
    const cancelEdit = () => {
      router.back();
    };

    return {
      activeTab,
      documentData,
      categories,
      versions,
      flattenedCategories,
      isNewDocument,
      isSaving,
      validationErrors,
      isFormValid,
      saveDocument,
      cancelEdit
    };
  }
});
</script>

<style lang="scss" scoped>
.documentation-editor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h1 {
      margin: 0;
    }

    .editor-actions {
      display: flex;
      gap: 1rem;

      button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;

        &.cancel-button {
          background: none;
          border: 1px solid var(--color-border);
          color: var(--color-text);

          &:hover {
            background-color: var(--color-surface);
          }
        }

        &.save-button {
          background-color: var(--color-primary);
          border: none;
          color: white;

          &:hover:not(:disabled) {
            background-color: var(--color-primary-dark);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }
  }

  .editor-form {
    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        background-color: var(--color-background);
        color: var(--color-text);
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px var(--color-primary-light);
        }
      }

      .error-message {
        color: var(--color-error);
        font-size: 0.85rem;
        margin-top: 0.25rem;
      }
    }

    .form-row {
      display: flex;
      gap: 1rem;

      .form-group {
        flex: 1;
      }
    }

    .editor-tabs {
      display: flex;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 1rem;

      .tab-button {
        padding: 0.5rem 1rem;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-weight: 500;
        color: var(--color-text-secondary);

        &.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        &:hover:not(.active) {
          color: var(--color-text);
          border-bottom-color: var(--color-border);
        }
      }
    }

    .editor-content {
      border: 1px solid var(--color-border);
      border-radius: 4px;
      min-height: 400px;

      .markdown-editor {
        height: 100%;

        textarea {
          width: 100%;
          height: 100%;
          min-height: 400px;
          padding: 1rem;
          border: none;
          resize: vertical;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 0.9rem;
          line-height: 1.5;

          &:focus {
            outline: none;
          }
        }
      }

      .markdown-preview {
        padding: 1rem;
        min-height: 400px;
      }
    }
  }

  // Responsive styles
  @media (max-width: 768px) {
    padding: 1rem;

    .editor-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .form-row {
      flex-direction: column;
      gap: 1rem;
    }
  }
}
</style>
