# Theming Guide

This document explains how to use and customize the theming system in the TransAIRobot website.

## Theme Structure

The application uses CSS variables for theming, allowing for easy customization and theme switching. The theme files are located in:

```
src/assets/styles/
├── variables.scss     # Shared variables
├── themes/
│   ├── light.scss     # Light theme variables
│   └── dark.scss      # Dark theme variables
└── main.scss          # Main stylesheet
```

## CSS Variables

The theme is defined using CSS variables (custom properties) that control colors, typography, spacing, and other visual aspects.

### Core Variables

```scss
:root {
  // Colors
  --color-primary: #3498db;
  --color-secondary: #2ecc71;
  --color-accent: #e74c3c;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-border: #dddddd;
  
  // Typography
  --font-family-base: 'Roboto', sans-serif;
  --font-family-heading: 'Montserrat', sans-serif;
  --font-size-base: 16px;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  
  // Spacing
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  // Borders
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 16px;
  
  // Shadows
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  // Transitions
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

## Theme Definitions

### Light Theme

```scss
// light.scss
:root[data-theme="light"] {
  --color-primary: #3498db;
  --color-secondary: #2ecc71;
  --color-accent: #e74c3c;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-border: #dddddd;
  
  // Component-specific variables
  --header-background: rgba(255, 255, 255, 0.95);
  --card-background: #ffffff;
  --button-text-color: #ffffff;
  --input-background: #ffffff;
  --input-border: #cccccc;
}
```

### Dark Theme

```scss
// dark.scss
:root[data-theme="dark"] {
  --color-primary: #3498db;
  --color-secondary: #2ecc71;
  --color-accent: #e74c3c;
  --color-background: #121212;
  --color-surface: #1e1e1e;
  --color-text: #f5f5f5;
  --color-text-secondary: #aaaaaa;
  --color-border: #333333;
  
  // Component-specific variables
  --header-background: rgba(30, 30, 30, 0.95);
  --card-background: #1e1e1e;
  --button-text-color: #ffffff;
  --input-background: #2a2a2a;
  --input-border: #444444;
}
```

## Using Theme Variables in Components

Use the CSS variables in your component styles:

```vue
<template>
  <div class="card">
    <h2 class="card-title">{{ title }}</h2>
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  transition: box-shadow var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.card-title {
  color: var(--color-text);
  font-family: var(--font-family-heading);
  font-size: 1.25rem;
  margin-bottom: var(--spacing-md);
}

.card-content {
  color: var(--color-text-secondary);
}
</style>
```

## Theme Switching

The application includes a theme toggle component that allows users to switch between light and dark themes.

### ThemeToggle Component

```vue
<template>
  <button class="theme-toggle" @click="toggleTheme" :aria-label="themeLabel">
    <sun-icon v-if="isDarkTheme" />
    <moon-icon v-else />
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import SunIcon from '@/components/icons/SunIcon.vue';
import MoonIcon from '@/components/icons/MoonIcon.vue';

export default defineComponent({
  components: {
    SunIcon,
    MoonIcon
  },
  setup() {
    const store = useStore();
    
    const isDarkTheme = computed(() => store.state.theme.current === 'dark');
    const themeLabel = computed(() => 
      isDarkTheme.value ? 'Switch to light theme' : 'Switch to dark theme'
    );
    
    const toggleTheme = () => {
      const newTheme = isDarkTheme.value ? 'light' : 'dark';
      store.dispatch('theme/setTheme', newTheme);
    };
    
    return {
      isDarkTheme,
      themeLabel,
      toggleTheme
    };
  }
});
</script>

<style lang="scss" scoped>
.theme-toggle {
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  height: 40px;
  padding: 8px;
  transition: color var(--transition-fast);
  width: 40px;
  
  &:hover {
    color: var(--color-primary);
  }
  
  svg {
    height: 24px;
    width: 24px;
  }
}
</style>
```

### Theme Store Module

```typescript
// src/store/modules/theme.ts
import { Module } from 'vuex';
import { RootState } from '../types';

export interface ThemeState {
  current: 'light' | 'dark';
}

const themeModule: Module<ThemeState, RootState> = {
  namespaced: true,
  
  state: () => ({
    current: 'light'
  }),
  
  getters: {
    isDarkTheme: (state) => state.current === 'dark'
  },
  
  mutations: {
    SET_THEME(state, theme: 'light' | 'dark') {
      state.current = theme;
    }
  },
  
  actions: {
    initialize({ commit, dispatch }) {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme === 'dark' || savedTheme === 'light') {
        commit('SET_THEME', savedTheme);
      } else {
        // Check for system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        commit('SET_THEME', prefersDark ? 'dark' : 'light');
      }
      
      dispatch('applyTheme');
    },
    
    setTheme({ commit, dispatch }, theme: 'light' | 'dark') {
      commit('SET_THEME', theme);
      localStorage.setItem('theme', theme);
      dispatch('applyTheme');
    },
    
    applyTheme({ state }) {
      document.documentElement.setAttribute('data-theme', state.current);
    }
  }
};

export default themeModule;
```

## Creating Custom Themes

To create a custom theme:

1. Create a new theme file in `src/assets/styles/themes/`:

```scss
// src/assets/styles/themes/blue.scss
:root[data-theme="blue"] {
  --color-primary: #1e88e5;
  --color-secondary: #00acc1;
  --color-accent: #ff4081;
  --color-background: #e3f2fd;
  --color-surface: #ffffff;
  --color-text: #212121;
  --color-text-secondary: #757575;
  --color-border: #bbdefb;
  
  // Component-specific variables
  --header-background: rgba(30, 136, 229, 0.95);
  --card-background: #ffffff;
  --button-text-color: #ffffff;
  --input-background: #ffffff;
  --input-border: #bbdefb;
}
```

2. Import the new theme in `main.scss`:

```scss
@import 'themes/light.scss';
@import 'themes/dark.scss';
@import 'themes/blue.scss';
```

3. Update the theme store to support the new theme:

```typescript
export interface ThemeState {
  current: 'light' | 'dark' | 'blue';
}
```

## Responsive Theming

The theming system supports responsive design with media queries:

```scss
:root {
  --sidebar-width: 250px;
  
  @media (max-width: 768px) {
    --sidebar-width: 200px;
  }
  
  @media (max-width: 480px) {
    --sidebar-width: 100%;
  }
}
```

## Best Practices

1. Always use CSS variables for themeable properties
2. Group related variables together
3. Use semantic names for variables
4. Provide fallbacks for older browsers
5. Test themes on different devices and screen sizes
6. Consider accessibility when choosing colors (contrast ratios)

## Theme Customization API

For advanced use cases, the application provides a theme customization API:

```typescript
// src/utils/theme.ts
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export function applyCustomTheme(colors: Partial<ThemeColors>): void {
  Object.entries(colors).forEach(([key, value]) => {
    const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    document.documentElement.style.setProperty(cssVarName, value);
  });
}

export function resetTheme(): void {
  document.documentElement.removeAttribute('style');
}
```

Usage:

```typescript
import { applyCustomTheme } from '@/utils/theme';

// Apply custom brand colors
applyCustomTheme({
  primary: '#ff0000',
  secondary: '#00ff00',
  accent: '#0000ff'
});
```
