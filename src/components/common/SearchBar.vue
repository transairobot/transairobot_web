<template>
  <div class="search-bar">
    <div class="search-input-container">
      <input
        type="text"
        class="search-input"
        v-model="searchQuery"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="handleBlur"
      />
      <button class="search-icon" @click="handleSearch">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
      <button v-if="searchQuery" class="clear-icon" @click="clearSearch">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div v-if="isFocused && suggestions.length > 0" class="search-suggestions">
      <ul>
        <li
          v-for="(suggestion, index) in suggestions"
          :key="index"
          @click="selectSuggestion(suggestion)"
          :class="{ active: index === activeSuggestionIndex }"
        >
          <div class="suggestion-icon">{{ suggestion.icon || '🔍' }}</div>
          <div class="suggestion-content">
            <div class="suggestion-title">{{ suggestion.name }}</div>
            <div class="suggestion-description">{{ suggestion.description }}</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'SearchBar',
  props: {
    placeholder: {
      type: String,
      default: 'Search applications...'
    },
    debounceTime: {
      type: Number,
      default: 300
    }
  },
  setup(props, { emit }) {
    const router = useRouter();

    const searchQuery = ref('');
    const isFocused = ref(false);
    const suggestions = ref([]);
    const activeSuggestionIndex = ref(-1);
    let debounceTimeout = null;

    const handleInput = () => {
      clearTimeout(debounceTimeout);

      if (searchQuery.value.trim() === '') {
        suggestions.value = [];
        return;
      }

      debounceTimeout = setTimeout(() => {
        // In a real app, this would call an API or search through store data
        // For now, we'll use mock data
        const mockSuggestions = [
          {
            id: '1',
            name: 'Navigation System',
            description: 'Advanced navigation for robots',
            icon: '🧭'
          },
          {
            id: '2',
            name: 'Vision Module',
            description: 'Computer vision capabilities',
            icon: '👁️'
          },
          {
            id: '3',
            name: 'Arm Control',
            description: 'Precise robotic arm control',
            icon: '🦾'
          }
        ].filter(
          item =>
            item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        );

        suggestions.value = mockSuggestions;
        activeSuggestionIndex.value = -1;
      }, props.debounceTime);
    };

    const handleBlur = () => {
      // Delay hiding suggestions to allow clicking on them
      setTimeout(() => {
        isFocused.value = false;
      }, 200);
    };

    const clearSearch = () => {
      searchQuery.value = '';
      suggestions.value = [];
      emit('clear');
    };

    const handleSearch = () => {
      if (searchQuery.value.trim() === '') return;

      emit('search', searchQuery.value);
      router.push({
        name: 'AppStore',
        query: { search: searchQuery.value }
      });

      isFocused.value = false;
    };

    const selectSuggestion = suggestion => {
      searchQuery.value = suggestion.name;
      emit('select', suggestion);
      router.push({
        name: 'AppDetail',
        params: { id: suggestion.id }
      });

      isFocused.value = false;
    };

    // Handle keyboard navigation
    const handleKeydown = e => {
      if (!isFocused.value || suggestions.value.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          activeSuggestionIndex.value =
            (activeSuggestionIndex.value + 1) % suggestions.value.length;
          break;
        case 'ArrowUp':
          e.preventDefault();
          activeSuggestionIndex.value =
            activeSuggestionIndex.value <= 0
              ? suggestions.value.length - 1
              : activeSuggestionIndex.value - 1;
          break;
        case 'Enter':
          if (activeSuggestionIndex.value >= 0) {
            selectSuggestion(suggestions.value[activeSuggestionIndex.value]);
          } else {
            handleSearch();
          }
          break;
        case 'Escape':
          isFocused.value = false;
          break;
      }
    };

    // Add and remove keyboard event listener
    onMounted(() => {
      window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown);
    });

    return {
      searchQuery,
      isFocused,
      suggestions,
      activeSuggestionIndex,
      handleInput,
      handleBlur,
      clearSearch,
      handleSearch,
      selectSuggestion
    };
  }
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.search-bar {
  position: relative;
  width: 100%;

  .search-input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 1px solid var(--input-border);
    border-radius: $border-radius-md;
    background-color: var(--input-bg);
    color: var(--text-primary);
    font-size: $font-size-md;
    transition: all $transition-fast ease;

    &:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
    }

    &::placeholder {
      color: var(--text-secondary);
      opacity: 0.7;
    }
  }

  .search-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color $transition-fast ease;

    &:hover {
      color: var(--accent-primary);
    }
  }

  .clear-icon {
    position: absolute;
    right: 2.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color $transition-fast ease;

    &:hover {
      color: var(--accent-primary);
    }
  }

  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: var(--card-bg);
    border-radius: $border-radius-md;
    box-shadow: var(--shadow-lg);
    margin-top: 0.5rem;
    z-index: 10;
    max-height: 300px;
    overflow-y: auto;
    animation: fadeIn 0.2s ease;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: background-color $transition-fast ease;

        &:hover,
        &.active {
          background-color: var(--bg-hover, rgba(0, 0, 0, 0.05));
        }

        .suggestion-icon {
          font-size: 1.5rem;
          margin-right: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background-color: var(--bg-secondary);
          border-radius: 50%;
        }

        .suggestion-content {
          flex: 1;

          .suggestion-title {
            font-weight: 500;
            margin-bottom: 0.25rem;
          }

          .suggestion-description {
            font-size: $font-size-sm;
            color: var(--text-secondary);
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
