/**
 * Robot management API service
 */
import api from './api';
import notificationService from './notification.service';

class RobotManagementService {
  /**
   * Get user's robots
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to robots list
   */
  async getRobots(filters = {}, page = 1, limit = 10) {
    const params = {
      page,
      limit,
      ...filters
    };

    return await api.get('/robots/list', { params });
  }

  /**
   * Get robot details
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to robot details
   */
  async getRobotDetails(robotId) {
    return await api.get(`/robots/${robotId}`);
  }

  /**
   * Update robot details
   * @param {string} robotId - Robot ID
   * @param {Object} robotData - Robot data to update
   * @returns {Promise} Promise resolving to updated robot details
   */
  async updateRobot(robotId, robotData) {
    const result = await api.put(`/robots/${robotId}`, robotData);
    notificationService.success('Robot updated successfully');
    return result;
  }

  /**
   * Register new robot
   * @param {Object} robotData - Robot registration data
   * @returns {Promise} Promise resolving to registered robot
   */
  async registerRobot(robotData) {
    const result = await api.post('/robots/register', robotData);
    notificationService.success('Robot registered successfully');
    return result;
  }

  /**
   * Deregister robot
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to deregistration status
   */
  async deregisterRobot(robotId) {
    const result = await api.delete(`/robots/${robotId}`);
    notificationService.success('Robot deregistered successfully');
    return result;
  }

  /**
   * Get robot status
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to robot status
   */
  async getRobotStatus(robotId) {
    return await api.get(`/robots/${robotId}/status`);
  }

  /**
   * Get robot applications
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to robot applications
   */
  async getRobotApplications(robotId) {
    return await api.get(`/robots/${robotId}/applications`);
  }

  /**
   * Start application on robot
   * @param {string} robotId - Robot ID
   * @param {string} applicationId - Application ID
   * @returns {Promise} Promise resolving to start status
   */
  async startApplication(robotId, applicationId) {
    const result = await api.post(`/robots/${robotId}/applications/${applicationId}/start`);
    notificationService.success('Application started successfully');
    return result;
  }

  /**
   * Stop application on robot
   * @param {string} robotId - Robot ID
   * @param {string} applicationId - Application ID
   * @returns {Promise} Promise resolving to stop status
   */
  async stopApplication(robotId, applicationId) {
    const result = await api.post(`/robots/${robotId}/applications/${applicationId}/stop`);
    notificationService.success('Application stopped successfully');
    return result;
  }

  /**
   * Restart application on robot
   * @param {string} robotId - Robot ID
   * @param {string} applicationId - Application ID
   * @returns {Promise} Promise resolving to restart status
   */
  async restartApplication(robotId, applicationId) {
    const result = await api.post(`/robots/${robotId}/applications/${applicationId}/restart`);
    notificationService.success('Application restarted successfully');
    return result;
  }

  /**
   * Get robot logs
   * @param {string} robotId - Robot ID
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to robot logs
   */
  async getRobotLogs(robotId, filters = {}, page = 1, limit = 100) {
    const params = {
      page,
      limit,
      ...filters
    };

    return await api.get(`/robots/${robotId}/logs`, { params });
  }

  /**
   * Get application logs on robot
   * @param {string} robotId - Robot ID
   * @param {string} applicationId - Application ID
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Promise resolving to application logs
   */
  async getApplicationLogs(robotId, applicationId, filters = {}, page = 1, limit = 100) {
    const params = {
      page,
      limit,
      ...filters
    };

    return await api.get(`/robots/${robotId}/applications/${applicationId}/logs`, { params });
  }

  /**
   * Reboot robot
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to reboot status
   */
  async rebootRobot(robotId) {
    const result = await api.post(`/robots/${robotId}/reboot`);
    notificationService.success('Robot reboot initiated');
    return result;
  }

  /**
   * Get robot telemetry data
   * @param {string} robotId - Robot ID
   * @param {string} metric - Metric type (cpu, memory, battery, etc.)
   * @param {Object} timeRange - Time range parameters
   * @returns {Promise} Promise resolving to telemetry data
   */
  async getRobotTelemetry(robotId, metric, timeRange = {}) {
    const params = {
      metric,
      ...timeRange
    };

    return await api.get(`/robots/${robotId}/telemetry`, { params });
  }

  /**
   * Get robot network configuration
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to network configuration
   */
  async getRobotNetworkConfig(robotId) {
    return await api.get(`/robots/${robotId}/network`);
  }

  /**
   * Update robot network configuration
   * @param {string} robotId - Robot ID
   * @param {Object} networkConfig - Network configuration
   * @returns {Promise} Promise resolving to updated network configuration
   */
  async updateRobotNetworkConfig(robotId, networkConfig) {
    const result = await api.put(`/robots/${robotId}/network`, networkConfig);
    notificationService.success('Network configuration updated successfully');
    return result;
  }
}

export default new RobotManagementService();
