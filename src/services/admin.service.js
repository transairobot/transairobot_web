/**
 * Admin API service
 */
import api from './api';
import notificationService from './notification.service';

class AdminService {
  /**
   * Get pending developer applications
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to developer applications
   */
  async getPendingDeveloperApplications(filters = {}, page = 1, limit = 10) {
    const params = {
      page,
      limit,
      status: 'pending',
      ...filters
    };

    return await api.get('/admin/developer-applications', { params });
  }

  /**
   * Approve developer application
   * @param {string} applicationId - Application ID
   * @param {Object} approvalData - Approval data
   * @returns {Promise} Promise resolving to approval status
   */
  async approveDeveloperApplication(applicationId, approvalData = {}) {
    const result = await api.post(
      `/admin/developer-applications/${applicationId}/approve`,
      approvalData
    );
    notificationService.success('Developer application approved successfully');
    return result;
  }

  /**
   * Reject developer application
   * @param {string} applicationId - Application ID
   * @param {Object} rejectionData - Rejection data with reason
   * @returns {Promise} Promise resolving to rejection status
   */
  async rejectDeveloperApplication(applicationId, rejectionData) {
    const result = await api.post(
      `/admin/developer-applications/${applicationId}/reject`,
      rejectionData
    );
    notificationService.success('Developer application rejected');
    return result;
  }

  /**
   * Get pending application submissions
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to application submissions
   */
  async getPendingApplicationSubmissions(filters = {}, page = 1, limit = 10) {
    const params = {
      page,
      limit,
      status: 'pending',
      ...filters
    };

    return await api.get('/admin/application-submissions', { params });
  }

  /**
   * Get application submission details
   * @param {string} submissionId - Submission ID
   * @returns {Promise} Promise resolving to submission details
   */
  async getApplicationSubmissionDetails(submissionId) {
    return await api.get(`/admin/application-submissions/${submissionId}`);
  }

  /**
   * Approve application submission
   * @param {string} submissionId - Submission ID
   * @param {Object} approvalData - Approval data
   * @returns {Promise} Promise resolving to approval status
   */
  async approveApplicationSubmission(submissionId, approvalData = {}) {
    const result = await api.post(
      `/admin/application-submissions/${submissionId}/approve`,
      approvalData
    );
    notificationService.success('Application submission approved successfully');
    return result;
  }

  /**
   * Reject application submission
   * @param {string} submissionId - Submission ID
   * @param {Object} rejectionData - Rejection data with reason
   * @returns {Promise} Promise resolving to rejection status
   */
  async rejectApplicationSubmission(submissionId, rejectionData) {
    const result = await api.post(
      `/admin/application-submissions/${submissionId}/reject`,
      rejectionData
    );
    notificationService.success('Application submission rejected');
    return result;
  }

  /**
   * Get user list
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to user list
   */
  async getUsers(filters = {}, page = 1, limit = 10) {
    const params = {
      page,
      limit,
      ...filters
    };

    return await api.get('/admin/users', { params });
  }

  /**
   * Get user details
   * @param {string} userId - User ID
   * @returns {Promise} Promise resolving to user details
   */
  async getUserDetails(userId) {
    return await api.get(`/admin/users/${userId}`);
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} Promise resolving to updated user
   */
  async updateUser(userId, userData) {
    const result = await api.put(`/admin/users/${userId}`, userData);
    notificationService.success('User updated successfully');
    return result;
  }

  /**
   * Disable user
   * @param {string} userId - User ID
   * @param {Object} disableData - Disable data with reason
   * @returns {Promise} Promise resolving to disable status
   */
  async disableUser(userId, disableData) {
    const result = await api.post(`/admin/users/${userId}/disable`, disableData);
    notificationService.success('User disabled successfully');
    return result;
  }

  /**
   * Enable user
   * @param {string} userId - User ID
   * @returns {Promise} Promise resolving to enable status
   */
  async enableUser(userId) {
    const result = await api.post(`/admin/users/${userId}/enable`);
    notificationService.success('User enabled successfully');
    return result;
  }

  /**
   * Get system analytics
   * @param {Object} timeRange - Time range parameters
   * @returns {Promise} Promise resolving to system analytics
   */
  async getSystemAnalytics(timeRange = {}) {
    const params = {
      ...timeRange
    };

    return await api.get('/admin/analytics/system', { params });
  }

  /**
   * Get user analytics
   * @param {Object} timeRange - Time range parameters
   * @returns {Promise} Promise resolving to user analytics
   */
  async getUserAnalytics(timeRange = {}) {
    const params = {
      ...timeRange
    };

    return await api.get('/admin/analytics/users', { params });
  }

  /**
   * Get application analytics
   * @param {Object} timeRange - Time range parameters
   * @returns {Promise} Promise resolving to application analytics
   */
  async getApplicationAnalytics(timeRange = {}) {
    const params = {
      ...timeRange
    };

    return await api.get('/admin/analytics/applications', { params });
  }

  /**
   * Get robot analytics
   * @param {Object} timeRange - Time range parameters
   * @returns {Promise} Promise resolving to robot analytics
   */
  async getRobotAnalytics(timeRange = {}) {
    const params = {
      ...timeRange
    };

    return await api.get('/admin/analytics/robots', { params });
  }

  /**
   * Get revenue analytics
   * @param {Object} timeRange - Time range parameters
   * @returns {Promise} Promise resolving to revenue analytics
   */
  async getRevenueAnalytics(timeRange = {}) {
    const params = {
      ...timeRange
    };

    return await api.get('/admin/analytics/revenue', { params });
  }

  /**
   * Get system logs
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to system logs
   */
  async getSystemLogs(filters = {}, page = 1, limit = 100) {
    const params = {
      page,
      limit,
      ...filters
    };

    return await api.get('/admin/logs/system', { params });
  }

  /**
   * Get audit logs
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to audit logs
   */
  async getAuditLogs(filters = {}, page = 1, limit = 100) {
    const params = {
      page,
      limit,
      ...filters
    };

    return await api.get('/admin/logs/audit', { params });
  }

  /**
   * Get system settings
   * @returns {Promise} Promise resolving to system settings
   */
  async getSystemSettings() {
    return await api.get('/admin/settings');
  }

  /**
   * Update system settings
   * @param {Object} settings - System settings
   * @returns {Promise} Promise resolving to updated settings
   */
  async updateSystemSettings(settings) {
    const result = await api.put('/admin/settings', settings);
    notificationService.success('System settings updated successfully');
    return result;
  }
}

export default new AdminService();
