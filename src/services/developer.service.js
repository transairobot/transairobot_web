import api from './api';

/**
 * Developer service for developer portal functionality
 */
export default {
  /**
   * Get developer's applications
   * @returns {Promise} Promise resolving to developer's applications
   */
  getDeveloperApps() {
    return api.get('/developer/apps');
  },

  /**
   * Get pending applications
   * @returns {Promise} Promise resolving to pending applications
   */
  getPendingApps() {
    return api.get('/developer/apps/pending');
  },

  /**
   * Submit new application
   * @param {Object} appData - Application data
   * @returns {Promise} Promise resolving to submission status
   */
  submitApp(appData) {
    return api.post('/developer/apps', appData);
  },

  /**
   * Update existing application
   * @param {string} appId - Application ID
   * @param {Object} appData - Updated application data
   * @returns {Promise} Promise resolving to updated application
   */
  updateApp(appId, appData) {
    return api.put(`/developer/apps/${appId}`, appData);
  },

  /**
   * Get application analytics
   * @param {string} appId - Application ID
   * @returns {Promise} Promise resolving to application analytics
   */
  getAppAnalytics(appId) {
    return api.get(`/developer/apps/${appId}/analytics`);
  },

  /**
   * Get application feedback
   * @param {string} appId - Application ID
   * @returns {Promise} Promise resolving to application feedback
   */
  getAppFeedback(appId) {
    return api.get(`/developer/apps/${appId}/feedback`);
  }
};
