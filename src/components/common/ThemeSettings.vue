<template>
  <div class="theme-settings">
    <h3>Theme Settings</h3>
    <div class="theme-options">
      <div
        class="theme-option"
        :class="{ active: currentTheme === 'light' }"
        @click="setThemeOption('light')"
      >
        <div class="theme-preview light-theme"></div>
        <span>Light</span>
      </div>
      <div
        class="theme-option"
        :class="{ active: currentTheme === 'dark' }"
        @click="setThemeOption('dark')"
      >
        <div class="theme-preview dark-theme"></div>
        <span>Dark</span>
      </div>
      <div
        class="theme-option"
        :class="{ active: currentTheme === 'system' }"
        @click="setThemeOption('system')"
      >
        <div class="theme-preview system-theme"></div>
        <span>System{{ systemPreferenceLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ThemeSettings',
  setup() {
    const store = useStore();

    const currentTheme = computed(() => store.getters.currentTheme);
    const appliedTheme = computed(() => store.getters.appliedTheme);

    const systemPreferenceLabel = computed(() => {
      if (currentTheme.value === 'system') {
        return ` (${appliedTheme.value === 'light' ? 'Light' : 'Dark'})`;
      }
      return '';
    });

    const setThemeOption = theme => {
      store.dispatch('setTheme', theme);
    };

    return {
      currentTheme,
      appliedTheme,
      systemPreferenceLabel,
      setThemeOption
    };
  }
};
</script>

<style lang="scss" scoped>
.theme-settings {
  padding: $spacing-md;

  h3 {
    margin-bottom: $spacing-md;
    color: var(--text-primary);
  }

  .theme-options {
    display: flex;
    gap: $spacing-md;

    .theme-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      padding: $spacing-sm;
      border-radius: $border-radius-md;
      transition: all $transition-fast ease;

      &:hover {
        background-color: var(--bg-secondary);
        transform: translateY(-2px);
      }

      &.active {
        background-color: var(--bg-secondary);

        .theme-preview {
          border: 2px solid var(--accent-primary);
          box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.5);
        }
      }

      .theme-preview {
        width: 60px;
        height: 60px;
        border-radius: $border-radius-sm;
        margin-bottom: $spacing-sm;
        border: 2px solid transparent;
        transition: all $transition-normal ease;

        &.light-theme {
          background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        &.dark-theme {
          background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        &.system-theme {
          background: linear-gradient(to right, #ffffff 0%, #ffffff 50%, #121212 50%, #121212 100%);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      }

      span {
        font-size: $font-size-sm;
        color: var(--text-primary);
        transition: color $transition-normal ease;
      }
    }
  }
}
</style>
