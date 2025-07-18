import api from './api';

/**
 * Authentication service
 */
export default {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Promise resolving to user data and token
   */
  login(email, password) {
    return api.post('/auth/login', { email, password }, false);
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Promise resolving to user data
   */
  register(userData) {
    return api.post('/auth/register', userData, false);
  },

  /**
   * Logout user
   * @returns {Promise} Promise resolving to logout status
   */
  logout() {
    return api.post('/auth/logout');
  },

  /**
   * Get current user profile
   * @returns {Promise} Promise resolving to user profile data
   */
  getProfile() {
    return api.get('/auth/profile');
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} Promise resolving to updated profile
   */
  updateProfile(profileData) {
    return api.put('/auth/profile', profileData);
  }
};
