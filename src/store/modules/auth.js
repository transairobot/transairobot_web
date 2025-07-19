import authService from '../../services/auth.service';

// Helper function to parse JWT token expiration
const getTokenExpiration = token => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);
    return exp * 1000; // Convert to milliseconds
  } catch (e) {
    console.error('Error parsing JWT token:', e);
    return null;
  }
};

// Check if token is expired
const isTokenExpired = token => {
  const expiration = getTokenExpiration(token);
  return expiration ? Date.now() >= expiration : true;
};

export default {
  namespaced: true,
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    tokenExpiration: getTokenExpiration(localStorage.getItem('token'))
  },
  getters: {
    isAuthenticated: state => !!state.token && !isTokenExpired(state.token),
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
    },
    tokenExpiresIn: state => {
      if (!state.tokenExpiration) return 0;
      return Math.max(0, state.tokenExpiration - Date.now());
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
      state.tokenExpiration = getTokenExpiration(token);

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
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
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
    async refreshToken({ commit, state }) {
      try {
        // Only refresh if we have a token and it's close to expiring
        if (state.token && state.tokenExpiration) {
          const timeToExpire = state.tokenExpiration - Date.now();
          // Refresh if token expires in less than 5 minutes
          if (timeToExpire < 300000 && timeToExpire > 0) {
            const response = await authService.refreshToken();
            commit('SET_TOKEN', response.token);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Token refresh error:', error);
        return false;
      }
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
