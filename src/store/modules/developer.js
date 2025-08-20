export default {
  namespaced: true,
  state: {
    developerApps: [],
    pendingApps: [],
    loading: false,
    error: null
  },
  getters: {
    allDeveloperApps: state => state.developerApps,
    pendingApps: state => state.pendingApps,
    isLoading: state => state.loading
  },
  mutations: {
    SET_DEVELOPER_APPS(state, apps) {
      state.developerApps = apps;
    },
    SET_PENDING_APPS(state, apps) {
      state.pendingApps = apps;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    fetchDeveloperApps({ commit }) {
      commit('SET_LOADING', true);
      // API call would go here
      setTimeout(() => {
        const mockApps = [
          {
            id: '1',
            name: 'Robot Navigation',
            icon: '/assets/icons/nav.png',
            status: 'approved',
            downloads: 1200,
            rating: 4.5
          },
          {
            id: '3',
            name: 'Vision System',
            icon: '/assets/icons/vision.png',
            status: 'approved',
            downloads: 850,
            rating: 4.2
          }
        ];
        commit('SET_DEVELOPER_APPS', mockApps);
        commit('SET_LOADING', false);
      }, 500);
    },
    fetchPendingApps({ commit }) {
      commit('SET_LOADING', true);
      // API call would go here
      setTimeout(() => {
        const mockPendingApps = [
          {
            id: '4',
            name: 'Speech Recognition',
            icon: '/assets/icons/speech.png',
            status: 'pending',
            submittedDate: new Date().toISOString()
          }
        ];
        commit('SET_PENDING_APPS', mockPendingApps);
        commit('SET_LOADING', false);
      }, 500);
    },
    submitApp({ commit }, appData) {
      commit('SET_LOADING', true);
      // API call would go here
      return new Promise(resolve => {
        setTimeout(() => {
          commit('SET_LOADING', false);
          resolve({ success: true, message: 'Application submitted successfully' });
        }, 1000);
      });
    }
  }
};
