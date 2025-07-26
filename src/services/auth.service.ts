import api from './api';
import notificationService from './notification.service';
import { User } from './admin.service';

/**
 * Authentication service
 */
class AuthService {
  /**
   * Login user
   * @param email - User email
   * @param password - User password
   * @returns Promise resolving to user data
   */
  async login(email: string, password: string): Promise<{ user: User }> {
    try {
      const user = await api.post(
        '/auth/login',
        { email, password },
        {
          includeAuth: false,
          showErrorNotification: true
        }
      );

      return {
        user
      };
    } catch (error: any) {
      // Handle specific login errors
      notificationService.error(error.message);
      throw error;
    }
  }

  /**
   * Register new user
   * @param userData - User registration data
   * @returns Promise resolving to user data
   */
  async register(userData: Partial<User>): Promise<{ user: User }> {
    try {
      const user = await api.post('/auth/register', userData, {
        includeAuth: false,
        showErrorNotification: true
      });

      return {
        user
      };
    } catch (error: any) {
      // Handle specific registration errors
      if (error.message && error.message.includes('already exists')) {
        notificationService.error('An account with this email already exists.');
      }
      throw error;
    }
  }

  /**
   * Logout user
   * @returns Promise resolving to logout status
   */
  async logout(): Promise<{ success: boolean }> {
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
   * @returns Promise resolving to user profile data
   */
  async getProfile(): Promise<User> {
    return await api.get('/auth/profile');
  }

  /**
   * Update user profile
   * @param profileData - Updated profile data
   * @returns Promise resolving to updated profile
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const result = await api.put('/auth/profile', profileData);
    notificationService.success('Profile updated successfully');
    return result;
  }

  /**
   * Request password reset
   * @param email - User email
   * @returns Promise resolving to reset request status
   */
  async requestPasswordReset(email: string): Promise<any> {
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
   * @param token - Reset token
   * @param password - New password
   * @returns Promise resolving to reset status
   */
  async resetPassword(token: string, password: string): Promise<any> {
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
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Promise resolving to change status
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    try {
      const result = await api.post('/auth/change-password', { currentPassword, newPassword });
      notificationService.success('Password changed successfully');
      return result;
    } catch (error: any) {
      // Handle specific password change errors
      if (error.message === 'Current password is incorrect') {
        notificationService.error('Current password is incorrect. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Upload user avatar
   * @param formData - Form data with avatar file
   * @param onProgress - Progress callback function
   * @returns Promise resolving to avatar URL
   */
  async uploadAvatar(formData: FormData, onProgress: (progress: number) => void): Promise<any> {
    const result = await api.uploadFiles('/auth/avatar', formData, {
      onProgress
    });
    notificationService.success('Avatar updated successfully');
    return result;
  }

  /**
   * Verify email with token
   * @param token - Verification token
   * @returns Promise resolving to verification status
   */
  async verifyEmail(token: string): Promise<any> {
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
   * @returns Promise resolving to resend status
   */
  async resendVerificationEmail(): Promise<any> {
    const result = await api.post('/auth/resend-verification', {});
    notificationService.success('Verification email has been sent');
    return result;
  }

  /**
   * Check if token is valid
   * @param token - Token to validate
   * @param type - Token type (reset, verify)
   * @returns Promise resolving to token validity
   */
  async validateToken(token: string, type: string): Promise<any> {
    return await api.post(
      '/auth/validate-token',
      { token, type },
      {
        includeAuth: false,
        showErrorNotification: false
      }
    );
  }

  /**
   * Send email verification code
   * @param email - User email
   * @returns Promise resolving to send status
   */
  async sendEmailCode(email: string): Promise<any> {
    console.log('Sending verification code to:', email);
    const result = await api.post(
      '/auth/send-email',
      { email },
      {
        includeAuth: false
      }
    );
    notificationService.success('Verification code has been sent to your email');
    return result;
  }
}

export default new AuthService();
