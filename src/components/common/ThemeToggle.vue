<template>
  <button class="theme-toggle" @click="toggleTheme" :aria-label="themeLabel" :title="themeLabel">
    <span v-if="appliedTheme === 'light'" class="icon">🌙</span>
    <span v-else class="icon">☀️</span>
  </button>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ThemeToggle',
  setup() {
    const store = useStore();

    const currentTheme = computed(() => store.getters.currentTheme);
    const appliedTheme = computed(() => store.getters.appliedTheme);

    const themeLabel = computed(() => {
      if (currentTheme.value === 'system') {
        return appliedTheme.value === 'light'
          ? 'Switch to dark theme (currently using system preference)'
          : 'Switch to light theme (currently using system preference)';
      }

      return appliedTheme.value === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
    });

    const toggleTheme = () => {
      store.dispatch('toggleTheme');
    };

    return {
      currentTheme,
      appliedTheme,
      themeLabel,
      toggleTheme
    };
  }
};
</script>

<style lang="scss" scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: $font-size-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color $transition-fast ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  [data-theme='dark'] &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .icon {
    transition: transform $transition-normal ease;
  }

  &:hover .icon {
    transform: rotate(12deg);
  }
}
</style>
