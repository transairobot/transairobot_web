<template>
  <div class="category-item">
    <div class="category-header" :class="{ 'has-children': hasChildren }">
      <button
        v-if="hasChildren"
        class="toggle-button"
        :aria-expanded="isExpanded"
        :aria-controls="`category-${category.id}`"
        @click.stop="$emit('toggle-category', category.id)"
      >
        <span class="toggle-icon" aria-hidden="true"></span>
        <span class="sr-only"> {{ isExpanded ? 'Collapse' : 'Expand' }} {{ category.name }} </span>
      </button>

      <span class="category-name" @click="$emit('select-category', category.id)">{{
        category.name
      }}</span>
    </div>

    <div v-if="hasChildren && isExpanded" :id="`category-${category.id}`" class="category-children">
      <ul class="document-list">
        <!-- Documents in this category -->
        <li
          v-for="doc in categoryDocuments"
          :key="doc.id"
          class="document-item"
          :class="{ active: doc.id === currentDocId }"
        >
          <a href="#" @click.prevent="$emit('select-document', doc.id)">
            {{ doc.title }}
          </a>
        </li>
      </ul>

      <!-- Nested categories -->
      <ul class="nested-categories">
        <li v-for="childCategory in category.children" :key="childCategory.id">
          <CategoryItem
            :category="childCategory"
            :currentDocId="currentDocId"
            :expandedCategories="expandedCategories"
            @toggle-category="$emit('toggle-category', $event)"
            @select-document="$emit('select-document', $event)"
            @select-category="$emit('select-category', $event)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'CategoryItem',

  props: {
    /**
     * Category object
     */
    category: {
      type: Object,
      required: true
    },

    /**
     * Current document ID
     */
    currentDocId: {
      type: String,
      default: null
    },

    /**
     * Set of expanded category IDs
     */
    expandedCategories: {
      type: Set,
      required: true
    }
  },

  emits: ['toggle-category', 'select-document', 'select-category'],

  setup(props) {
    const store = useStore();

    // Check if category is expanded
    const isExpanded = computed(() => props.expandedCategories.has(props.category.id));

    // Get documents in this category
    const categoryDocuments = computed(() =>
      store.getters['documentation/getDocumentsByCategoryId'](props.category.id)
    );

    // Check if category has children (documents or subcategories)
    const hasChildren = computed(
      () =>
        (categoryDocuments.value && categoryDocuments.value.length > 0) ||
        (props.category.children && props.category.children.length > 0)
    );

    return {
      isExpanded,
      categoryDocuments,
      hasChildren
    };
  }
});
</script>

<style lang="scss" scoped>
.category-item {
  margin-bottom: 0.25rem;

  .category-header {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-weight: 500;

    &.has-children {
      cursor: pointer;

      &:hover {
        background-color: var(--color-surface-hover);
      }
    }
  }

  .toggle-button {
    background: none;
    border: none;
    padding: 0;
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    .toggle-icon {
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 5px 0 5px 8px;
      border-color: transparent transparent transparent var(--color-text);
      transition: transform 0.2s ease;

      [aria-expanded='true'] & {
        transform: rotate(90deg);
      }
    }
  }

  .category-name {
    flex: 1;
  }

  .category-children {
    padding-left: 1.5rem;
  }

  .document-list {
    list-style: none;
    padding: 0;
    margin: 0;

    .document-item {
      padding: 0.25rem 0;

      a {
        display: block;
        padding: 0.25rem 0.5rem;
        color: var(--color-text);
        text-decoration: none;
        border-radius: 4px;

        &:hover {
          background-color: var(--color-surface-hover);
        }
      }

      &.active a {
        color: var(--color-primary);
        font-weight: 500;
        background-color: var(--color-primary-light);
      }
    }
  }

  .nested-categories {
    list-style: none;
    padding: 0;
    margin: 0;
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
