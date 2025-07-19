<template>
  <main class="documentation-content">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading document...</p>
    </div>

    <div v-else-if="document" class="document">
      <div class="document-header">
        <h1>{{ document.title }}</h1>

        <div class="document-metadata">
          <span v-if="document.version" class="version"> Version: {{ document.version }} </span>
          <span v-if="document.updatedAt" class="updated-at">
            Last updated: {{ formatDate(document.updatedAt) }}
          </span>
        </div>

        <div v-if="isAdmin" class="admin-actions">
          <button class="edit-button" @click="$emit('edit-document', document.id)">
            Edit Document
          </button>
        </div>
      </div>

      <div class="document-content">
        <MarkdownRenderer :content="document.content" :renderMath="true" />
      </div>

      <div class="document-footer">
        <div class="print-actions">
          <button @click="printDocument" class="print-button">Print Document</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Select a document from the sidebar or use the search to find documentation.</p>
    </div>
  </main>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import MarkdownRenderer from './MarkdownRenderer.vue';

export default defineComponent({
  name: 'DocumentationContent',

  components: {
    MarkdownRenderer
  },

  props: {
    /**
     * Document object
     */
    document: {
      type: Object,
      default: null
    },

    /**
     * Loading state
     */
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['edit-document'],

  setup() {
    const store = useStore();

    // Check if user is admin
    const isAdmin = computed(() => {
      const currentUser = store.getters['auth/currentUser'];
      return currentUser && currentUser.role === 'admin';
    });

    // Format date
    const formatDate = dateString => {
      if (!dateString) return '';

      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    };

    // Print document
    const printDocument = () => {
      window.print();
    };

    return {
      isAdmin,
      formatDate,
      printDocument
    };
  }
});
</script>

<style lang="scss" scoped>
.documentation-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    p {
      color: var(--color-text-secondary);
    }
  }

  .document {
    max-width: 800px;
    margin: 0 auto;

    .document-header {
      margin-bottom: 2rem;

      h1 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-size: 2rem;
        font-weight: 600;
      }

      .document-metadata {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
        margin-bottom: 1rem;
      }

      .admin-actions {
        margin-top: 1rem;

        .edit-button {
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-weight: 500;

          &:hover {
            background-color: var(--color-primary-dark);
          }
        }
      }
    }

    .document-content {
      margin-bottom: 2rem;
    }

    .document-footer {
      border-top: 1px solid var(--color-border);
      padding-top: 1rem;
      display: flex;
      justify-content: flex-end;

      .print-button {
        background: none;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:hover {
          background-color: var(--color-surface);
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--color-text-secondary);
    text-align: center;
    max-width: 400px;
    margin: 0 auto;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  // Print styles
  @media print {
    padding: 0;
    overflow: visible;

    .document {
      max-width: 100%;

      .document-header {
        .admin-actions {
          display: none;
        }
      }

      .document-footer {
        display: none;
      }
    }
  }

  // Responsive styles
  @media (max-width: 768px) {
    padding: 1rem;
  }
}
</style>
