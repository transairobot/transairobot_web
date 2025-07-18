/**
 * Admin store module
 */
export default {
  namespaced: true,
  state: {
    pendingApps: [],
    categories: [],
    loading: false,
    error: null
  },
  getters: {
    pendingApps: state => state.pendingApps,
    categories: state => state.categories,
    isLoading: state => state.loading
  },
  mutations: {
    SET_PENDING_APPS(state, apps) {
      state.pendingApps = apps;
    },
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    fetchPendingApps({ commit }) {
      commit('SET_LOADING', true);
      // API call would go here
      setTimeout(() => {
        const mockPendingApps = [
          {
            id: '4',
            name: 'Speech Recognition',
            icon: '/assets/icons/speech.png',
            developer: 'AI Dev',
            submittedDate: new Date().toISOString(),
            status: 'pending'
          },
          {
            id: '5',
            name: 'Object Detection',
            icon: '/assets/icons/object.png',
            developer: 'Vision Systems Inc.',
            submittedDate: new Date().toISOString(),
            status: 'pending'
          }
        ];
        commit('SET_PENDING_APPS', mockPendingApps);
        commit('SET_LOADING', false);
      }, 500);
    },
    fetchCategories({ commit }) {
      commit('SET_LOADING', true);
      // API call would go here
      setTimeout(() => {
        const mockCategories = [
          { id: '1', name: 'Navigation', count: 5 },
          { id: '2', name: 'Control', count: 8 },
          { id: '3', name: 'Vision', count: 3 },
          { id: '4', name: 'Speech', count: 2 }
        ];
        commit('SET_CATEGORIES', mockCategories);
        commit('SET_LOADING', false);
      }, 500);
    },
    approveApp({ commit }, { appId, feedback }) {
      commit('SET_LOADING', true);
      // API call would go here
      return new Promise(resolve => {
        setTimeout(() => {
          commit('SET_LOADING', false);
          resolve({ success: true, message: 'Application approved successfully' });
        }, 1000);
      });
    },
    rejectApp({ commit }, { appId, feedback }) {
      commit('SET_LOADING', true);
      // API call would go here
      return new Promise(resolve => {
        setTimeout(() => {
          commit('SET_LOADING', false);
          resolve({ success: true, message: 'Application rejected successfully' });
        }, 1000);
      });
    },
    createCategory({ commit }, categoryData) {
      commit('SET_LOADING', true);
      // API call would go here
      return new Promise(resolve => {
        setTimeout(() => {
          commit('SET_LOADING', false);
          resolve({
            success: true,
            category: {
              id: Date.now().toString(),
              name: categoryData.name,
              count: 0
            }
          });
        }, 1000);
      });
    }
  }
};
