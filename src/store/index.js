import { createStore } from 'vuex';
import auth from './modules/auth';
import apps from './modules/apps';
import robots from './modules/robots';
import admin from './modules/admin';
import { setTheme, toggleTheme as toggleThemeUtil } from '../utils/theme';

export default createStore({
  state: {
    theme: localStorage.getItem('theme') || 'light',
    appliedTheme: document.documentElement.getAttribute('data-theme') || 'light'
  },
  getters: {
    currentTheme: state => state.theme,
    appliedTheme: state => state.appliedTheme
  },
  mutations: {
    SET_THEME(state, theme) {
      state.theme = theme;

      // If theme is system, we need to determine the actual applied theme
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.appliedTheme = prefersDark ? 'dark' : 'light';
      } else {
        state.appliedTheme = theme;
      }

      // Use the utility function to handle the theme change
      setTheme(theme);
    },
    SET_APPLIED_THEME(state, appliedTheme) {
      state.appliedTheme = appliedTheme;
    }
  },
  actions: {
    toggleTheme({ commit, state }) {
      const newTheme = toggleThemeUtil();
      commit('SET_THEME', newTheme);
    },
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme);
    }
  },
  modules: {
    auth,
    apps,
    robots,
    admin
  }
});
