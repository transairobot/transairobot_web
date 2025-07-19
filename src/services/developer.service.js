/**
 * Developer API service
 */
import api from './api';
import notificationService from './notification.service';

class DeveloperService {
  /**
   * Apply for developer status
   * @param {Object} developerData - Developer application data
   * @returns {Promise} Promise resolving to application status
   */
  async applyForDeveloperStatus(developerData) {
    const result = await api.post('/developers/apply', developerData);
    notificationService.success('Developer application submitted successfully');
    return result;
  }

  /**
   * Get developer profile
   * @returns {Promise} Promise resolving to developer profile
   */
  async getDeveloperProfile() {
    return await api.get('/developers/profile');
  }

  /**
   * Update developer profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} Promise resolving to updated profile
   */
  async updateDeveloperProfile(profileData) {
    const result = await api.put('/developers/profile', profileData);
    notificationService.success('Developer profile updated successfully');
    return result;
  }

  /**
   * Get developer applications
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to developer applications
   */
  async getDeveloperApplications(filters = {}, page = 1, limit = 10) {
    const params = {
      page,
      limit,
      ...filters
    };

    return await api.get('/developers/applications', { params });
  }

  /**
   * Submit new application
   * @param {Object} applicationData - Application data
   * @returns {Promise} Promise resolving to submitted application
   */
  async submitApplication(applicationData) {
    const result = await api.post('/developers/applications', applicationData);
    notificationService.success('Application submitted successfully');
    return result;
  }

  /**
   * Update application
   * @param {string} applicationId - Application ID
   * @param {Object} applicationData - Updated application data
   * @returns {Promise} Promise resolving to updated application
   */
  async updateApplication(applicationId, applicationData) {
    const result = await api.put(`/developers/applications/${applicationId}`, applicationData);
    notificationService.success('Application updated successfully');
    return result;
  }

  /**
   * Delete application
   * @param {string} applicationId - Application ID
   * @returns {Promise} Promise resolving to deletion status
   */
  async deleteApplication(applicationId) {
    const result = await api.delete(`/developers/applications/${applicationId}`);
    notificationService.success('Application deleted successfully');
    return result;
  }

  /**
   * Submit application for review
   * @param {string} applicationId - Application ID
   * @returns {Promise} Promise resolving to submission status
   */
  async submitApplicationForReview(applicationId) {
    const result = await api.post(`/developers/applications/${applicationId}/submit`);
    notificationService.success('Application submitted for review');
    return result;
  }

  /**
   * Upload application icon
   * @param {string} applicationId - Application ID
   * @param {FormData} formData - Form data with icon file
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise} Promise resolving to upload status
   */
  async uploadApplicationIcon(applicationId, formData, onProgress) {
    const result = await api.uploadFiles(
      `/developers/applications/${applicationId}/icon`,
      formData,
      {
        onProgress
      }
    );
    notificationService.success('Application icon uploaded successfully');
    return result;
  }

  /**
   * Upload application screenshots
   * @param {string} applicationId - Application ID
   * @param {FormData} formData - Form data with screenshot files
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise} Promise resolving to upload status
   */
  async uploadApplicationScreenshots(applicationId, formData, onProgress) {
    const result = await api.uploadFiles(
      `/developers/applications/${applicationId}/screenshots`,
      formData,
      {
        onProgress
      }
    );
    notificationService.success('Screenshots uploaded successfully');
    return result;
  }

  /**
   * Delete application screenshot
   * @param {string} applicationId - Application ID
   * @param {string} screenshotId - Screenshot ID
   * @returns {Promise} Promise resolving to deletion status
   */
  async deleteApplicationScreenshot(applicationId, screenshotId) {
    const result = await api.delete(
      `/developers/applications/${applicationId}/screenshots/${screenshotId}`
    );
    notificationService.success('Screenshot deleted successfully');
    return result;
  }

  /**
   * Get application analytics
   * @param {string} applicationId - Application ID
   * @param {Object} timeRange - Time range parameters
   * @returns {Promise} Promise resolving to application analytics
   */
  async getApplicationAnalytics(applicationId, timeRange = {}) {
    const params = {
      ...timeRange
    };

    return await api.get(`/developers/applications/${applicationId}/analytics`, { params });
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

    return await api.get(`/developers/applications/${applicationId}/reviews`, { params });
  }

  /**
   * Respond to application review
   * @param {string} applicationId - Application ID
   * @param {string} reviewId - Review ID
   * @param {string} response - Developer response
   * @returns {Promise} Promise resolving to response status
   */
  async respondToReview(applicationId, reviewId, response) {
    const result = await api.post(
      `/developers/applications/${applicationId}/reviews/${reviewId}/respond`,
      { response }
    );
    notificationService.success('Response submitted successfully');
    return result;
  }

  /**
   * Get developer earnings
   * @param {Object} timeRange - Time range parameters
   * @returns {Promise} Promise resolving to earnings data
   */
  async getDeveloperEarnings(timeRange = {}) {
    const params = {
      ...timeRange
    };

    return await api.get('/developers/earnings', { params });
  }

  /**
   * Get developer payout history
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to payout history
   */
  async getDeveloperPayouts(page = 1, limit = 10) {
    const params = {
      page,
      limit
    };

    return await api.get('/developers/payouts', { params });
  }

  /**
   * Update developer payout settings
   * @param {Object} payoutSettings - Payout settings
   * @returns {Promise} Promise resolving to updated settings
   */
  async updatePayoutSettings(payoutSettings) {
    const result = await api.put('/developers/payout-settings', payoutSettings);
    notificationService.success('Payout settings updated successfully');
    return result;
  }
}

export default new DeveloperService();
