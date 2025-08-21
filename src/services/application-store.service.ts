import api from './api';
import notificationService from './notification.service';
import { PagedResult } from './admin.service';

// Data structure classes
export class Application {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public categoryId: string,
    public version: string,
    public rating: number,
    public iconUrl: string,
    public author: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

export class Category {
  constructor(public id: string, public name: string, public description: string) {}
}

export class Review {
  constructor(
    public id: string,
    public userId: string,
    public rating: number,
    public comment: string,
    public createdAt: Date
  ) {}
}

export class Screenshot {
  constructor(public id: string, public imageUrl: string, public caption: string) {}
}

// 无限分页响应接口
export interface InfiniteScrollResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

// 无限分页请求参数接口
export interface InfiniteScrollParams {
  limit?: number;
  cursor?: string;
  category?: string;
  query?: string;
  status?: string;
}

class ApplicationStoreService {
  // 无限分页获取应用列表（用户端）
  async getApplicationsInfinite(
    params: InfiniteScrollParams = {}
  ): Promise<InfiniteScrollResponse<Application>> {
    const queryParams = {
      limit: 20,
      ...params
    };

    try {
      const response = await api.get('/applications/list', { params: queryParams });

      // 转换日期字段
      if (response.data) {
        response.data = response.data.map((app: any) => ({
          ...app,
          createdAt: new Date(app.createdAt),
          updatedAt: new Date(app.updatedAt)
        }));
      }

      return response;
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      notificationService.error('获取应用列表失败');
      throw error;
    }
  }

  // 无限分页获取应用评价
  async getApplicationReviewsInfinite(
    applicationId: string,
    params: InfiniteScrollParams = {}
  ): Promise<InfiniteScrollResponse<Review>> {
    const queryParams = {
      limit: 10,
      ...params
    };

    try {
      const response = await api.get(`/applications/${applicationId}/reviews`, {
        params: queryParams
      });

      // 转换日期字段
      if (response.data) {
        response.data = response.data.map((review: any) => ({
          ...review,
          createdAt: new Date(review.createdAt)
        }));
      }

      return response;
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      notificationService.error('获取评价列表失败');
      throw error;
    }
  }

  // 传统分页获取应用列表（管理后台）
  async getApplications(params: any = {}): Promise<Array<Application>> {
    const queryParams = {
      page: 1,
      limit: 20,
      ...params
    };

    try {
      const response = await api.get('/applications/list', { params: queryParams });

      // 转换日期字段
      return response.map((app: any) => ({
        ...app,
        createdAt: new Date(app.createdAt),
        updatedAt: new Date(app.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      notificationService.error('获取应用列表失败');
      throw error;
    }
  }

  async searchApplications(
    query: string,
    filters: any = {},
    page = 1,
    limit = 10
  ): Promise<PagedResult<Application>> {
    const params = {
      query,
      page,
      limit,
      ...filters
    };

    try {
      return await api.get('/applications/search', { params });
    } catch (error) {
      console.error('Failed to search applications:', error);
      notificationService.error('搜索应用失败');
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      return await api.get('/applications/categories');
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      notificationService.error('获取分类失败');
      throw error;
    }
  }

  async getApplicationDetails(applicationId: string): Promise<Application> {
    try {
      const response = await api.get(`/applications/${applicationId}`);
      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error) {
      console.error('Failed to fetch application details:', error);
      notificationService.error('获取应用详情失败');
      throw error;
    }
  }

  // 传统分页获取应用评价（管理后台）
  async getApplicationReviews(
    applicationId: string,
    page = 1,
    limit = 10
  ): Promise<PagedResult<Review>> {
    const params = {
      page,
      limit
    };

    try {
      return await api.get(`/applications/${applicationId}/reviews`, { params });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      notificationService.error('获取评价失败');
      throw error;
    }
  }

  async getApplicationScreenshots(applicationId: string): Promise<Screenshot[]> {
    try {
      return await api.get(`/applications/${applicationId}/screenshots`);
    } catch (error) {
      console.error('Failed to fetch screenshots:', error);
      notificationService.error('获取截图失败');
      throw error;
    }
  }

  async getFeaturedApplications(limit = 5): Promise<Application[]> {
    const params = { limit };

    try {
      const response = await api.get('/applications/featured', { params });
      return response.map((app: any) => ({
        ...app,
        createdAt: new Date(app.createdAt),
        updatedAt: new Date(app.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to fetch featured applications:', error);
      // 静默处理错误，不显示通知
      throw error;
    }
  }

  async getPopularApplications(limit = 5): Promise<Application[]> {
    const params = { limit };

    try {
      const response = await api.get('/applications/popular', { params });
      return response.map((app: any) => ({
        ...app,
        createdAt: new Date(app.createdAt),
        updatedAt: new Date(app.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to fetch popular applications:', error);
      notificationService.error('获取热门应用失败');
      throw error;
    }
  }

  async getNewApplications(limit = 5): Promise<Application[]> {
    const params = { limit };

    try {
      const response = await api.get('/applications/new', { params });
      return response.map((app: any) => ({
        ...app,
        createdAt: new Date(app.createdAt),
        updatedAt: new Date(app.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to fetch new applications:', error);
      notificationService.error('获取最新应用失败');
      throw error;
    }
  }

  // 提交应用评价
  async submitReview(
    applicationId: string,
    review: { rating: number; comment: string }
  ): Promise<void> {
    try {
      await api.post(`/applications/${applicationId}/reviews`, review);
      notificationService.success('评价提交成功');
    } catch (error) {
      console.error('Failed to submit review:', error);
      notificationService.error('评价提交失败');
      throw error;
    }
  }

  // 文件上传
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const uploadService = await import('./upload.service');
    return uploadService.default.uploadFile(file, onProgress);
  }
}

export default new ApplicationStoreService();
