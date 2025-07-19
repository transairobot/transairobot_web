export default {
  namespaced: true,
  state: {
    user: null,
    token: localStorage.getItem('token') || null
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    userRole: state => (state.user ? state.user.role : null),
    isDeveloper: state => {
      if (!state.user) return false;
      return (
        state.user.role === 'developer' ||
        state.user.role === 'admin' ||
        state.user.developerStatus === 'approved'
      );
    },
    isDeveloperPending: state => {
      if (!state.user) return false;
      return state.user.developerStatus === 'pending';
    }
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    UPDATE_USER(state, userData) {
      state.user = { ...state.user, ...userData };
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
    },
    logout({ commit }) {
      commit('SET_TOKEN', null);
      commit('SET_USER', null);
    },
    updateUser({ commit }, userData) {
      commit('UPDATE_USER', userData);
    },
    applyAsDeveloper({ commit, state }, developerData) {
      // This would be replaced with an actual API call
      return new Promise(resolve => {
        setTimeout(() => {
          const updatedUser = {
            ...state.user,
            developerStatus: 'pending',
            developerProfile: developerData
          };

          commit('UPDATE_USER', updatedUser);
          resolve(updatedUser);
        }, 1000);
      });
    }
  }
};
