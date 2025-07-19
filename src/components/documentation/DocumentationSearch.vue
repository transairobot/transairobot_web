<template>
  <div class="documentation-search">
    <div class="search-input-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search documentation..."
        class="search-input"
        @input="debouncedSearch"
        @keydown.enter="search"
        @keydown.esc="clearSearch"
        @focus="showResults = true"
      />
      <button
        v-if="searchQuery"
        class="clear-button"
        @click="clearSearch"
        aria-label="Clear search"
      >
        &times;
      </button>
      <button class="search-button" @click="search" aria-label="Search">
        <span class="search-icon"></span>
      </button>
    </div>

    <div
      v-if="showResults && (isLoading || searchResults.length > 0 || searchError)"
      class="search-results"
    >
      <div v-if="isLoading" class="search-loading">
        <div class="spinner"></div>
        <span>Searching...</span>
      </div>

      <div v-else-if="searchError" class="search-error">
        <p>{{ searchError }}</p>
      </div>

      <ul v-else class="results-list">
        <li v-for="result in searchResults" :key="result.id" class="result-item">
          <a href="#" @click.prevent="selectResult(result.id)" class="result-link">
            <div class="result-title">{{ result.title }}</div>
            <div class="result-excerpt" v-if="result.excerpt">
              {{ result.excerpt }}
            </div>
            <div class="result-category" v-if="result.categoryName">
              {{ result.categoryName }}
            </div>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';

export default defineComponent({
  name: 'DocumentationSearch',

  setup() {
    const store = useStore();
    const router = useRouter();

    // Search state
    const searchQuery = ref('');
    const showResults = ref(false);
    const searchError = ref(null);

    // Get search results and loading state from store
    const searchResults = computed(() => store.getters['documentation/searchResults']);
    const isLoading = computed(() => store.getters['documentation/isLoading']);

    // Create debounced search function
    const debouncedSearch = debounce(() => {
      if (searchQuery.value.trim().length >= 2) {
        search();
      } else if (searchQuery.value.trim().length === 0) {
        clearSearch();
      }
    }, 300);

    // Search function
    const search = async () => {
      if (!searchQuery.value.trim()) {
        clearSearch();
        return;
      }

      searchError.value = null;
      showResults.value = true;

      try {
        await store.dispatch('documentation/searchDocuments', searchQuery.value);
      } catch (error) {
        searchError.value = 'Failed to search documentation. Please try again.';
        console.error('Search error:', error);
      }
    };

    // Clear search
    const clearSearch = () => {
      searchQuery.value = '';
      showResults.value = false;
      store.commit('documentation/SET_SEARCH_RESULTS', []);
      store.commit('documentation/SET_SEARCH_QUERY', '');
    };

    // Select a search result
    const selectResult = documentId => {
      router.push({
        name: 'DocumentationDetail',
        params: { documentId }
      });
      showResults.value = false;
    };

    // Close results when clicking outside
    const handleClickOutside = event => {
      if (!event.target.closest('.documentation-search')) {
        showResults.value = false;
      }
    };

    // Add/remove click outside listener
    watch(showResults, newValue => {
      if (newValue) {
        document.addEventListener('click', handleClickOutside);
      } else {
        document.removeEventListener('click', handleClickOutside);
      }
    });

    // Clean up event listener on component unmount
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      searchQuery,
      searchResults,
      isLoading,
      showResults,
      searchError,
      debouncedSearch,
      search,
      clearSearch,
      selectResult
    };
  }
});
</script>

<style lang="scss" scoped>
.documentation-search {
  padding: 0 1rem 1rem;
  position: relative;

  .search-input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 2.5rem 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 0.9rem;
    background-color: var(--color-background);
    color: var(--color-text);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }
  }

  .clear-button {
    position: absolute;
    right: 2rem;
    background: none;
    border: none;
    font-size: 1.2rem;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--color-text);
    }
  }

  .search-button {
    position: absolute;
    right: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    .search-icon {
      width: 14px;
      height: 14px;
      border: 2px solid var(--color-text-secondary);
      border-radius: 50%;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        width: 2px;
        height: 7px;
        background-color: var(--color-text-secondary);
        bottom: -5px;
        right: -2px;
        transform: rotate(45deg);
      }
    }

    &:hover .search-icon {
      border-color: var(--color-text);

      &::after {
        background-color: var(--color-text);
      }
    }
  }

  .search-results {
    position: absolute;
    top: 100%;
    left: 1rem;
    right: 1rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
    max-height: 300px;
    overflow-y: auto;
    margin-top: 0.5rem;
  }

  .search-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    color: var(--color-text-secondary);

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
    }
  }

  .search-error {
    padding: 1rem;
    color: var(--color-error);
    text-align: center;
  }

  .results-list {
    list-style: none;
    padding: 0;
    margin: 0;

    .result-item {
      border-bottom: 1px solid var(--color-border);

      &:last-child {
        border-bottom: none;
      }

      .result-link {
        display: block;
        padding: 0.75rem 1rem;
        color: var(--color-text);
        text-decoration: none;

        &:hover {
          background-color: var(--color-surface);
        }
      }

      .result-title {
        font-weight: 500;
        margin-bottom: 0.25rem;
      }

      .result-excerpt {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .result-category {
        font-size: 0.75rem;
        color: var(--color-primary);
      }
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
