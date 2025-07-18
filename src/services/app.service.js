import api from './api';

/**
 * Application service for app store functionality
 */
export default {
  /**
   * Get all applications
   * @param {Object} filters - Optional filters
   * @returns {Promise} Promise resolving to applications list
   */
  getApps(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return api.get(`/apps?${queryParams}`);
  },

  /**
   * Get featured applications
   * @returns {Promise} Promise resolving to featured applications list
   */
  getFeaturedApps() {
    return api.get('/apps/featured');
  },

  /**
   * Get application details by ID
   * @param {string} appId - Application ID
   * @returns {Promise} Promise resolving to application details
   */
  getAppById(appId) {
    return api.get(`/apps/${appId}`);
  },

  /**
   * Install application on a robot
   * @param {string} robotId - Robot ID
   * @param {string} appId - Application ID
   * @returns {Promise} Promise resolving to installation status
   */
  installApp(robotId, appId) {
    return api.post(`/robots/${robotId}/apps`, { appId });
  },

  /**
   * Search applications
   * @param {string} query - Search query
   * @returns {Promise} Promise resolving to search results
   */
  searchApps(query) {
    return api.get(`/apps/search?q=${encodeURIComponent(query)}`);
  }
};
