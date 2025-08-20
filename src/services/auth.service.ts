import api from './api';
import notificationService from './notification.service';
import { User } from './admin.service';

export class RegisterReq {
  constructor(
    public email: string,
    public password: string,
    public nickname: string,
    public verify_code: string
  ) {}
}

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
   * @param register_req - User registration data
   * @returns Promise resolving to user data
   */
  async register(register_req: RegisterReq): Promise<{ user: User }> {
    try {
      const user = await api.post('/auth/register', register_req, {
        includeAuth: false,
        showErrorNotification: true
      });

      return {
        user
      };
    } catch (error: any) {
      // Handle specific registration errors
      if (error.message && error.message.includes('already exists')) {
        notificationService.error('该邮箱已被注册');
      }
      throw error;
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
    notificationService.success('个人资料更新成功');
    return result;
  }

  /**
   * Request password reset
   * @param email - User email
   * @returns Promise resolving to reset request status
   */
  async requestPasswordReset(email: string): Promise<any> {
    const result = await api.put(
      '/auth/forgot-password',
      { email },
      {
        includeAuth: false
      }
    );
    notificationService.success('密码重置邮件已发送');
    return result;
  }

  /**
   * Reset password with token
   * @param token - Reset token
   * @param password - New password
   * @returns Promise resolving to reset status
   */
  async resetPassword(token: string, password: string): Promise<any> {
    const result = await api.put(
      '/auth/reset-password',
      { token, password },
      {
        includeAuth: false
      }
    );
    notificationService.success('密码重置成功');
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
      const result = await api.put('/user/password', {
        old_password: currentPassword,
        new_password: newPassword
      });
      notificationService.success('密码修改成功');
      return result;
    } catch (error: any) {
      // Handle specific password change errors
      if (error.message === 'Current password is incorrect') {
        notificationService.error('当前密码错误，请重试');
      }
      throw error;
    }
  }

  /**
   * Upload user avatar
   * @param file - Avatar file
   * @param onProgress - Progress callback function
   * @returns Promise resolving to avatar URL
   */
  async uploadAvatar(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const uploadService = await import('./upload.service');

    // 使用专门的头像上传方法
    const avatarUrl = await uploadService.default.uploadAvatar(file, onProgress);

    // 然后更新用户头像
    await api.put('/auth/avatar', { avatar_url: avatarUrl });
    notificationService.success('头像更新成功');
    return avatarUrl;
  }

  /**
   * Send email verification code
   * @param email - User email
   * @returns Promise resolving to send status
   */
  async sendEmailCode(email: string): Promise<any> {
    const result = await api.post(
      '/auth/send-email',
      { email },
      {
        includeAuth: false
      }
    );
    notificationService.success('验证码已发送到您的邮箱');
    return result;
  }

  // 文件上传
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const uploadService = await import('./upload.service');
    return uploadService.default.uploadFile(file, onProgress);
  }
}

export default new AuthService();
