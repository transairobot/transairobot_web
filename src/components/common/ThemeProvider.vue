<template>
  <div class="theme-provider">
    <slot></slot>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { initializeTheme } from '../../utils/theme';

export default {
  name: 'ThemeProvider',
  setup() {
    const store = useStore();
    let mediaQuery = null;
    let handleChange = null;

    onMounted(() => {
      // Initialize theme and get the current theme
      const currentTheme = initializeTheme();

      // Set theme in store
      store.commit('SET_THEME', currentTheme);

      // Listen for system preference changes
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      handleChange = e => {
        // Only change if user is using system preference
        if (localStorage.getItem('theme') === 'system') {
          const appliedTheme = e.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', appliedTheme);
          store.commit('SET_APPLIED_THEME', appliedTheme);
        }
      };

      // Add event listener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
    });

    onUnmounted(() => {
      // Clean up event listener
      if (mediaQuery && handleChange) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          // Fallback for older browsers
          mediaQuery.removeListener(handleChange);
        }
      }
    });
  }
};
</script>

<style scoped>
.theme-provider {
  height: 100%;
}
</style>
