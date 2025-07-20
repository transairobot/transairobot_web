import authService from '../../services/auth.service';

export default {
  namespaced: true,
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
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
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
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
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
  actions: {
    async login({ commit }, { email, password }) {
      const response = await authService.login(email, password);
      commit('SET_USER', response.user);
      return response;
    },
    async register({ commit }, userData) {
      const response = await authService.register(userData);
      commit('SET_USER', response.user);
      return response;
    },
    async logout({ commit }) {
      try {
        // Call logout API if user is authenticated
        if (this.state.auth.token) {
          await authService.logout();
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear user data regardless of API success
        commit('SET_TOKEN', null);
        commit('SET_USER', null);
      }
    },
    updateUser({ commit }, userData) {
      commit('UPDATE_USER', userData);
    },
    async applyAsDeveloper({ commit }, developerData) {
      try {
        const developerService = await import('../../services/developer.service').then(
          module => module.default
        );
        const updatedUser = await developerService.applyForDeveloperStatus(developerData);
        commit('UPDATE_USER', updatedUser);
        return updatedUser;
      } catch (error) {
        console.error('Developer application error:', error);
        throw error;
      }
    },
    async fetchCurrentUser({ commit }) {
      try {
        const user = await authService.getProfile();
        commit('SET_USER', user);
        return user;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    }
  }
};
