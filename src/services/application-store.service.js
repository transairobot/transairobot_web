/**
 * Application store API service
 */
import api from './api';
import notificationService from './notification.service';

class ApplicationStoreService {
  /**
   * Get application list with optional filtering
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to application list
   */
  async getApplications(filters = {}, page = 1, limit = 10) {
    const params = {
      page,
      limit,
      ...filters
    };

    return await api.get('/applications/list', { params });
  }

  /**
   * Search applications
   * @param {string} query - Search query
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to search results
   */
  async searchApplications(query, filters = {}, page = 1, limit = 10) {
    const params = {
      query,
      page,
      limit,
      ...filters
    };

    return await api.get('/applications/search', { params });
  }

  /**
   * Get application categories
   * @returns {Promise} Promise resolving to categories list
   */
  async getCategories() {
    return await api.get('/applications/categories');
  }

  /**
   * Get application tags
   * @returns {Promise} Promise resolving to tags list
   */
  async getTags() {
    return await api.get('/applications/tags');
  }

  /**
   * Get application details
   * @param {string} applicationId - Application ID
   * @returns {Promise} Promise resolving to application details
   */
  async getApplicationDetails(applicationId) {
    return await api.get(`/applications/${applicationId}`);
  }

  /**
   * Get application reviews
   * @param {string} applicationId - Application ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to application reviews
   */
  async getApplicationReviews(applicationId, page = 1, limit = 10) {
    const params = {
      page,
      limit
    };

    return await api.get(`/applications/${applicationId}/reviews`, { params });
  }

  /**
   * Submit application review
   * @param {string} applicationId - Application ID
   * @param {Object} reviewData - Review data
   * @returns {Promise} Promise resolving to submitted review
   */
  async submitReview(applicationId, reviewData) {
    const result = await api.post(`/applications/${applicationId}/reviews`, reviewData);
    notificationService.success('Review submitted successfully');
    return result;
  }

  /**
   * Get application screenshots
   * @param {string} applicationId - Application ID
   * @returns {Promise} Promise resolving to screenshots list
   */
  async getApplicationScreenshots(applicationId) {
    return await api.get(`/applications/${applicationId}/screenshots`);
  }

  /**
   * Get featured applications
   * @param {number} limit - Number of applications to fetch
   * @returns {Promise} Promise resolving to featured applications
   */
  async getFeaturedApplications(limit = 5) {
    const params = { limit };
    return await api.get('/applications/featured', { params });
  }

  /**
   * Get popular applications
   * @param {number} limit - Number of applications to fetch
   * @returns {Promise} Promise resolving to popular applications
   */
  async getPopularApplications(limit = 5) {
    const params = { limit };
    return await api.get('/applications/popular', { params });
  }

  /**
   * Get new applications
   * @param {number} limit - Number of applications to fetch
   * @returns {Promise} Promise resolving to new applications
   */
  async getNewApplications(limit = 5) {
    const params = { limit };
    return await api.get('/applications/new', { params });
  }

  /**
   * Install application on robot
   * @param {string} applicationId - Application ID
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to installation status
   */
  async installApplication(applicationId, robotId) {
    const result = await api.post('/installations/install', { applicationId, robotId });
    notificationService.success('Application installation initiated');
    return result;
  }

  /**
   * Uninstall application from robot
   * @param {string} applicationId - Application ID
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to uninstallation status
   */
  async uninstallApplication(applicationId, robotId) {
    const result = await api.post('/installations/uninstall', { applicationId, robotId });
    notificationService.success('Application uninstallation initiated');
    return result;
  }

  /**
   * Get installation status
   * @param {string} installationId - Installation ID
   * @returns {Promise} Promise resolving to installation status
   */
  async getInstallationStatus(installationId) {
    return await api.get(`/installations/${installationId}/status`);
  }

  /**
   * Get user's installed applications
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to installed applications
   */
  async getInstalledApplications(robotId) {
    return await api.get(`/robots/${robotId}/applications`);
  }
}

export default new ApplicationStoreService();
