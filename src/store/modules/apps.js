import applicationStoreService from '../../services/application-store.service';

export default {
  namespaced: true,
  state: {
    apps: [],
    featuredApps: [],
    currentApp: null,
    loading: false,
    error: null
  },
  getters: {
    allApps: state => state.apps,
    featuredApps: state => state.featuredApps,
    currentApp: state => state.currentApp,
    isLoading: state => state.loading
  },
  mutations: {
    SET_APPS(state, apps) {
      state.apps = apps;
    },
    SET_FEATURED_APPS(state, apps) {
      state.featuredApps = apps;
    },
    SET_CURRENT_APP(state, app) {
      state.currentApp = app;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchApps({ commit }, params = {}) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        const apps = await applicationStoreService.getApplications(params);
        commit('SET_APPS', Array.isArray(apps) ? apps : []);
      } catch (error) {
        console.error('Failed to fetch apps:', error);
        commit('SET_ERROR', error.message || 'Failed to fetch applications');
        commit('SET_APPS', []);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchFeaturedApps({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        const featuredApps = await applicationStoreService.getFeaturedApplications();
        commit('SET_FEATURED_APPS', Array.isArray(featuredApps) ? featuredApps : []);
      } catch (error) {
        console.error('Failed to fetch featured apps:', error);
        // 静默处理错误，不设置错误状态
        commit('SET_FEATURED_APPS', []);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchAppDetails({ commit, state }, appId) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        // First check if the app is already in our apps cache
        const cachedApp = state.apps.find(app => app.id === appId);
        if (cachedApp) {
          commit('SET_CURRENT_APP', cachedApp);
          commit('SET_LOADING', false);
          return;
        }

        // If not in cache, fetch from API
        const app = await applicationStoreService.getApplicationDetails(appId);
        commit('SET_CURRENT_APP', app);
      } catch (error) {
        console.error('Failed to fetch app details:', error);
        commit('SET_ERROR', error.message || 'Failed to fetch application details');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};
