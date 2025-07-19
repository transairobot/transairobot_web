import api from './api';
import notificationService from './notification.service';

/**
 * Authentication service
 */
class AuthService {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Promise resolving to user data and token
   */
  async login(email, password) {
    try {
      return await api.post(
        '/auth/login',
        { email, password },
        {
          includeAuth: false,
          showErrorNotification: true
        }
      );
    } catch (error) {
      // Handle specific login errors
      if (error.message === 'Invalid credentials') {
        notificationService.error('Invalid email or password. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Promise resolving to user data
   */
  async register(userData) {
    try {
      return await api.post('/auth/register', userData, {
        includeAuth: false,
        showErrorNotification: true
      });
    } catch (error) {
      // Handle specific registration errors
      if (error.message && error.message.includes('already exists')) {
        notificationService.error('An account with this email already exists.');
      }
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise} Promise resolving to logout status
   */
  async logout() {
    try {
      return await api.post('/auth/logout', null, {
        showErrorNotification: false // Don't show errors on logout
      });
    } catch (error) {
      // Ignore errors on logout
      console.warn('Logout error:', error);
      return { success: true };
    }
  }

  /**
   * Get current user profile
   * @returns {Promise} Promise resolving to user profile data
   */
  async getProfile() {
    return await api.get('/auth/profile');
  }

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} Promise resolving to updated profile
   */
  async updateProfile(profileData) {
    const result = await api.put('/auth/profile', profileData);
    notificationService.success('Profile updated successfully');
    return result;
  }

  /**
   * Refresh authentication token
   * @returns {Promise} Promise resolving to new token
   */
  async refreshToken() {
    try {
      return await api.post('/auth/refresh-token', null, {
        showErrorNotification: false // Don't show errors on token refresh
      });
    } catch (error) {
      console.warn('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} Promise resolving to reset request status
   */
  async requestPasswordReset(email) {
    const result = await api.post(
      '/auth/forgot-password',
      { email },
      {
        includeAuth: false
      }
    );
    notificationService.success('Password reset instructions have been sent to your email');
    return result;
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise} Promise resolving to reset status
   */
  async resetPassword(token, password) {
    const result = await api.post(
      '/auth/reset-password',
      { token, password },
      {
        includeAuth: false
      }
    );
    notificationService.success('Password has been reset successfully');
    return result;
  }

  /**
   * Change password (authenticated)
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Promise resolving to change status
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const result = await api.post('/auth/change-password', { currentPassword, newPassword });
      notificationService.success('Password changed successfully');
      return result;
    } catch (error) {
      // Handle specific password change errors
      if (error.message === 'Current password is incorrect') {
        notificationService.error('Current password is incorrect. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Upload user avatar
   * @param {FormData} formData - Form data with avatar file
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise} Promise resolving to avatar URL
   */
  async uploadAvatar(formData, onProgress) {
    const result = await api.uploadFiles('/auth/avatar', formData, {
      onProgress
    });
    notificationService.success('Avatar updated successfully');
    return result;
  }

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise} Promise resolving to verification status
   */
  async verifyEmail(token) {
    const result = await api.post(
      '/auth/verify-email',
      { token },
      {
        includeAuth: false
      }
    );
    notificationService.success('Email verified successfully');
    return result;
  }

  /**
   * Resend verification email
   * @returns {Promise} Promise resolving to resend status
   */
  async resendVerificationEmail() {
    const result = await api.post('/auth/resend-verification');
    notificationService.success('Verification email has been sent');
    return result;
  }

  /**
   * Check if token is valid
   * @param {string} token - Token to validate
   * @param {string} type - Token type (reset, verify)
   * @returns {Promise} Promise resolving to token validity
   */
  async validateToken(token, type) {
    return await api.post(
      '/auth/validate-token',
      { token, type },
      {
        includeAuth: false,
        showErrorNotification: false
      }
    );
  }
}

export default new AuthService();
