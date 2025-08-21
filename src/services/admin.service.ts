import api from './api';
import notificationService from './notification.service';

// Data structure classes
export class PagedResult<T> {
  constructor(public data: T[], public total: number, public page: number, public limit: number) {}
}

export class User {
  constructor(
    public id: string,
    public nickname: string,
    public email: string,
    public role: 'user' | 'admin',
    public isDisabled: boolean,
    public createdAt: Date
  ) {}
}

export interface TimeSeriesPoint {
  date: string; // 时间点
  value: number; // 该时间点的统计值
}

export interface TimeRangeRequest {
  start: number; // Unix timestamp in seconds
  end: number; // Unix timestamp in seconds
  granularity: string; // 'day', 'week', 'month'
}

export class SystemAnalytics {
  constructor(
    public totalUsers: number,
    public totalApplications: number,
    public totalRobots: number
  ) {}
}

export class TimeSeriesData {
  constructor(public date: Date, public value: number) {}
}

export class Application {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public categoryId: string,
    public version: string,
    public iconUrl: string,
    public screenshots: string[],
    public status: 'active' | 'inactive',
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

export class Category {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public iconUrl: string
  ) {}
}

class AdminService {
  // 数据分析
  async getSystemAnalytics(): Promise<SystemAnalytics> {
    return await api.get('/admin/analysis/system');
  }

  async getUserAnalytics(timeRange: TimeRangeRequest): Promise<TimeSeriesPoint[]> {
    const params = {
      start: timeRange.start,
      end: timeRange.end,
      granularity: timeRange.granularity
    };
    return await api.get('/admin/analysis/users', { params });
  }

  async getApplicationAnalytics(timeRange: TimeRangeRequest): Promise<TimeSeriesPoint[]> {
    const params = {
      start: timeRange.start,
      end: timeRange.end,
      granularity: timeRange.granularity
    };
    return await api.get('/admin/analysis/applications', { params });
  }

  async getRobotAnalytics(timeRange: TimeRangeRequest): Promise<TimeSeriesPoint[]> {
    const params = {
      start: timeRange.start,
      end: timeRange.end,
      granularity: timeRange.granularity
    };
    return await api.get('/admin/analysis/robots', { params });
  }

  // 应用管理
  async getApplicationsForAdmin(
    params: { page?: number; limit?: number; name?: string } = {}
  ): Promise<any> {
    const queryParams = {
      page: 1,
      limit: 20,
      ...params
    };

    return await api.get('/admin/applications', {
      params: queryParams,
      showErrorNotification: false
    });
  }

  async getFeaturedApplicationsForAdmin(
    params: { page?: number; limit?: number; name?: string } = {}
  ): Promise<any> {
    return await api.get('/admin/applications/feature/list', {
      params,
      showErrorNotification: false
    });
  }

  async createApplication(applicationData: any): Promise<Application> {
    const result = await api.post('/admin/applications', applicationData);
    notificationService.success('Application created successfully');
    return result;
  }

  async updateApplication(appId: string, applicationData: any): Promise<Application> {
    const result = await api.put(`/admin/applications/${appId}`, applicationData);
    notificationService.success('Application updated successfully');
    return result;
  }

  async deleteApplication(appId: string): Promise<any> {
    const result = await api.delete(`/admin/applications/${appId}`);
    notificationService.success('Application deleted successfully');
    return result;
  }

  async createApplicationScreenshot(appId: string, screenshotData: any): Promise<any> {
    const result = await api.post(`/admin/applications/${appId}/screenshot`, screenshotData);
    notificationService.success('Application screenshot created successfully');
    return result;
  }

  // 应用推荐功能
  async featureApplication(appId: string): Promise<any> {
    const result = await api.post(`/admin/applications/${appId}/feature?feature=feature`, {});
    notificationService.success('Application featured successfully');
    return result;
  }

  async unfeatureApplication(appId: string): Promise<any> {
    const result = await api.post(`/admin/applications/${appId}/feature?feature=unfeature`, {});
    notificationService.success('Application unfeatured successfully');
    return result;
  }

  // 分类管理
  async getCategories(params: { page?: number; limit?: number; name?: string } = {}): Promise<any> {
    const queryParams = {
      page: 1,
      limit: 20,
      ...params
    };

    return await api.get('/admin/categories/list', {
      params: queryParams,
      showErrorNotification: false
    });
  }

  async createCategory(categoryData: any): Promise<Category> {
    const result = await api.post('/admin/categories', categoryData);
    notificationService.success('Category created successfully');
    return result;
  }

  async updateCategory(categoryId: string, categoryData: any): Promise<Category> {
    const result = await api.put(`/admin/categories/${categoryId}`, categoryData);
    notificationService.success('Category updated successfully');
    return result;
  }

  async deleteCategory(categoryId: string): Promise<any> {
    const result = await api.delete(`/admin/categories/${categoryId}`);
    notificationService.success('Category deleted successfully');
    return result;
  }

  // 用户管理
  async getUsers(
    params: {
      page?: number;
      limit?: number;
      role?: string;
      status?: string;
      search?: string;
    } = {}
  ): Promise<any> {
    const queryParams = {
      page: 1,
      limit: 20,
      ...params
    };

    return await api.get('/admin/users', {
      params: queryParams,
      showErrorNotification: false
    });
  }

  async disableUser(userId: string): Promise<any> {
    const result = await api.post(`/admin/users/${userId}/disable`, {});
    notificationService.success('User disabled successfully');
    return result;
  }

  async enableUser(userId: string): Promise<any> {
    const result = await api.post(`/admin/users/${userId}/enable`, {});
    notificationService.success('User enabled successfully');
    return result;
  }

  // 文件上传
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const uploadService = await import('./upload.service');
    return uploadService.default.uploadFile(file, onProgress);
  }
}

export default new AdminService();
