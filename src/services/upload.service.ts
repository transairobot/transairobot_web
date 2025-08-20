import api from './api';
import notificationService from './notification.service';

/**
 * 文件上传服务
 * 统一处理所有文件上传，使用后端的 /api/upload 接口
 */
class UploadService {
  /**
   * 上传单个文件
   * @param file - 要上传的文件
   * @param onProgress - 上传进度回调
   * @returns Promise resolving to file URL
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    // 验证文件大小 (15MB)
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      const error = `File size exceeds limit (${this.formatFileSize(maxSize)})`;
      notificationService.error(error);
      throw new Error(error);
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await api.uploadFiles('/upload', formData, { onProgress });

      // 后端返回的可能是 { url: "..." } 或者直接是 URL 字符串
      const fileUrl = result.url || result.uri || result;

      if (!fileUrl) {
        throw new Error('上传失败：未获取到文件URL');
      }

      return fileUrl;
    } catch (error: any) {
      const errorMessage = error.message || 'File upload failed';
      notificationService.error(errorMessage);
      throw error;
    }
  }

  /**
   * 上传多个文件
   * @param files - 要上传的文件数组
   * @param onProgress - 上传进度回调
   * @returns Promise resolving to file URLs array
   */
  async uploadFiles(files: File[], onProgress?: (progress: number) => void): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const fileProgress = onProgress
        ? (progress: number) => {
            // 计算总体进度
            const totalProgress = (index * 100 + progress) / files.length;
            onProgress(Math.round(totalProgress));
          }
        : undefined;

      return this.uploadFile(file, fileProgress);
    });

    return Promise.all(uploadPromises);
  }

  /**
   * 上传图片文件（带图片格式验证）
   * @param file - 要上传的图片文件
   * @param onProgress - 上传进度回调
   * @returns Promise resolving to image URL
   */
  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
    // 验证是否为图片文件
    if (!file.type.startsWith('image/')) {
      const error = 'Please select an image file';
      notificationService.error(error);
      throw new Error(error);
    }

    // 验证图片格式
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    if (!allowedTypes.includes(file.type)) {
      const error =
        'Unsupported image format. Please select JPG, JPEG, PNG, WebP, GIF or SVG format';
      notificationService.error(error);
      throw new Error(error);
    }

    return this.uploadFile(file, onProgress);
  }

  /**
   * 上传头像
   * @param file - 头像文件
   * @param onProgress - 上传进度回调
   * @returns Promise resolving to avatar URL
   */
  async uploadAvatar(file: File, onProgress?: (progress: number) => void): Promise<string> {
    // 验证图片尺寸建议
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        // 建议头像尺寸
        if (img.width < 100 || img.height < 100) {
          notificationService.warning('Recommended avatar size is at least 100x100 pixels');
        }

        try {
          const url = await this.uploadImage(file, onProgress);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        const error = 'Unable to read image file';
        notificationService.error(error);
        reject(new Error(error));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 格式化文件大小
   * @param bytes - 字节数
   * @returns 格式化后的文件大小字符串
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 验证文件类型
   * @param file - 文件对象
   * @param allowedTypes - 允许的文件类型数组
   * @returns 是否为允许的文件类型
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  }

  /**
   * 获取文件扩展名
   * @param filename - 文件名
   * @returns 文件扩展名
   */
  getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  }
}

export default new UploadService();
