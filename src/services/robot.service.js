import api from './api';

/**
 * Robot service for robot management functionality
 */
export default {
  /**
   * Get all user's robots
   * @returns {Promise} Promise resolving to robots list
   */
  getRobots() {
    return api.get('/robots');
  },

  /**
   * Get robot details by ID
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to robot details
   */
  getRobotById(robotId) {
    return api.get(`/robots/${robotId}`);
  },

  /**
   * Get applications installed on a robot
   * @param {string} robotId - Robot ID
   * @returns {Promise} Promise resolving to installed applications
   */
  getRobotApps(robotId) {
    return api.get(`/robots/${robotId}/apps`);
  },

  /**
   * Remove application from a robot
   * @param {string} robotId - Robot ID
   * @param {string} appId - Application ID
   * @returns {Promise} Promise resolving to removal status
   */
  removeApp(robotId, appId) {
    return api.delete(`/robots/${robotId}/apps/${appId}`);
  },

  /**
   * Update robot information
   * @param {string} robotId - Robot ID
   * @param {Object} robotData - Updated robot data
   * @returns {Promise} Promise resolving to updated robot
   */
  updateRobot(robotId, robotData) {
    return api.put(`/robots/${robotId}`, robotData);
  }
};
