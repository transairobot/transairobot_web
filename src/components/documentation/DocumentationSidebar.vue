<template>
  <aside class="documentation-sidebar">
    <div class="sidebar-header">
      <h2>Documentation</h2>
      <button
        class="mobile-toggle"
        @click="toggleMobileMenu"
        :aria-expanded="mobileMenuOpen"
        aria-controls="documentation-nav"
      >
        <span class="sr-only">Toggle navigation</span>
        <span class="icon" aria-hidden="true"></span>
      </button>
    </div>

    <div id="documentation-nav" class="sidebar-content" :class="{ 'mobile-open': mobileMenuOpen }">
      <DocumentationSearch v-if="showSearch" />

      <DocumentationVersionSelector
        v-if="showVersionSelector"
        :versions="versions"
        :currentVersion="currentVersion"
        @version-change="$emit('version-change', $event)"
      />

      <nav class="sidebar-nav">
        <ul class="category-list">
          <template v-if="isLoading">
            <li class="loading-placeholder" v-for="i in 3" :key="i">
              <div class="placeholder-line"></div>
              <div class="placeholder-line short"></div>
            </li>
          </template>

          <template v-else-if="categories && categories.length">
            <li v-for="category in nestedCategories" :key="category.id">
              <CategoryItem
                :category="category"
                :currentDocId="currentDocId"
                :expandedCategories="expandedCategories"
                @toggle-category="toggleCategory"
                @select-document="$emit('select-document', $event)"
              />
            </li>
          </template>

          <li v-else class="empty-state">No documentation categories found</li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import DocumentationSearch from './DocumentationSearch.vue';
import DocumentationVersionSelector from './DocumentationVersionSelector.vue';
import CategoryItem from './CategoryItem.vue';

export default defineComponent({
  name: 'DocumentationSidebar',

  components: {
    DocumentationSearch,
    DocumentationVersionSelector,
    CategoryItem
  },

  props: {
    /**
     * Whether to show search input
     */
    showSearch: {
      type: Boolean,
      default: true
    },

    /**
     * Whether to show version selector
     */
    showVersionSelector: {
      type: Boolean,
      default: true
    },

    /**
     * Current document ID
     */
    currentDocId: {
      type: String,
      default: null
    },

    /**
     * Available versions
     */
    versions: {
      type: Array,
      default: () => []
    },

    /**
     * Current version
     */
    currentVersion: {
      type: Object,
      default: null
    }
  },

  emits: ['select-document', 'version-change'],

  setup(props) {
    const store = useStore();
    const route = useRoute();

    // Mobile menu state
    const mobileMenuOpen = ref(false);

    // Track expanded categories
    const expandedCategories = ref(new Set());

    // Get categories from store
    const categories = computed(() => store.getters['documentation/visibleCategories']);
    const nestedCategories = computed(() => store.getters['documentation/visibleNestedCategories']);
    const isLoading = computed(() => store.getters['documentation/isLoading']);

    // Toggle mobile menu
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
    };

    // Toggle category expansion
    const toggleCategory = categoryId => {
      if (expandedCategories.value.has(categoryId)) {
        expandedCategories.value.delete(categoryId);
      } else {
        expandedCategories.value.add(categoryId);
      }
    };

    // Auto-expand categories based on current document
    watch(
      () => props.currentDocId,
      newDocId => {
        if (newDocId) {
          const currentDoc = store.getters['documentation/getDocumentById'](newDocId);
          if (currentDoc && currentDoc.categoryId) {
            // Expand the category containing the current document
            expandedCategories.value.add(currentDoc.categoryId);

            // Also expand parent categories if any
            let category = store.getters['documentation/getCategoryById'](currentDoc.categoryId);
            while (category && category.parentId) {
              expandedCategories.value.add(category.parentId);
              category = store.getters['documentation/getCategoryById'](category.parentId);
            }
          }
        }
      },
      { immediate: true }
    );

    // Close mobile menu when route changes
    watch(
      () => route.path,
      () => {
        mobileMenuOpen.value = false;
      }
    );

    return {
      mobileMenuOpen,
      expandedCategories,
      categories,
      nestedCategories,
      isLoading,
      toggleMobileMenu,
      toggleCategory
    };
  }
});
</script>

<style lang="scss" scoped>
.documentation-sidebar {
  width: 280px;
  flex-shrink: 0;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  height: 100%;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;

    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;

      .icon {
        display: block;
        width: 24px;
        height: 2px;
        background-color: var(--color-text);
        position: relative;

        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background-color: var(--color-text);
          left: 0;
          transition: transform 0.3s ease;
        }

        &::before {
          top: -6px;
        }

        &::after {
          bottom: -6px;
        }
      }

      &[aria-expanded='true'] {
        .icon {
          background-color: transparent;

          &::before {
            transform: rotate(45deg);
            top: 0;
          }

          &::after {
            transform: rotate(-45deg);
            bottom: 0;
          }
        }
      }
    }
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;
  }

  .sidebar-nav {
    .category-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .empty-state {
      padding: 1rem;
      color: var(--color-text-secondary);
      font-style: italic;
      text-align: center;
    }

    .loading-placeholder {
      padding: 0.5rem 1rem;

      .placeholder-line {
        height: 1rem;
        background-color: var(--color-border);
        border-radius: 4px;
        margin-bottom: 0.5rem;
        opacity: 0.7;
        animation: pulse 1.5s infinite;

        &.short {
          width: 60%;
        }
      }
    }
  }

  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 0.6;
    }
  }

  // Responsive styles
  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);

    .sidebar-header {
      .mobile-toggle {
        display: block;
      }
    }

    .sidebar-content {
      display: none;

      &.mobile-open {
        display: block;
      }
    }
  }
}

// Screen reader only class
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
