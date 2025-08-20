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
  // 用户管理
  async getUsers(filters: any = {}, page = 1, limit = 10): Promise<PagedResult<User>> {
    const params = {
      page,
      limit,
      ...filters
    };
    return await api.get('/admin/users', { params });
  }

  async getUserDetails(userId: string): Promise<User> {
    return await api.get(`/admin/users/${userId}`);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const result = await api.put(`/admin/users/${userId}`, userData);
    notificationService.success('用户更新成功');
    return result;
  }

  async disableUser(userId: string): Promise<any> {
    const result = await api.post(`/admin/users/${userId}/disable`, {});
    notificationService.success('用户已禁用');
    return result;
  }

  async enableUser(userId: string): Promise<any> {
    const result = await api.post(`/admin/users/${userId}/enable`, {});
    notificationService.success('用户已启用');
    return result;
  }

  // 数据分析
  async getSystemAnalytics(): Promise<SystemAnalytics> {
    return await api.get('/admin/analysis/system');
  }

  async getUserAnalytics(timeRange: any = {}): Promise<TimeSeriesData[]> {
    const params = { ...timeRange };
    return await api.get('/admin/analysis/users', { params });
  }

  async getApplicationAnalytics(timeRange: any = {}): Promise<TimeSeriesData[]> {
    const params = { ...timeRange };
    return await api.get('/admin/analysis/applications', { params });
  }

  async getRobotAnalytics(timeRange: any = {}): Promise<TimeSeriesData[]> {
    const params = { ...timeRange };
    return await api.get('/admin/analysis/robots', { params });
  }

  // 应用管理
  async getApplicationsForAdmin(
    params: { page?: number; limit?: number; name?: string } = {}
  ): Promise<any> {
    return await api.get('/admin/applications', { params });
  }

  async getFeaturedApplicationsForAdmin(
    params: { page?: number; limit?: number; name?: string } = {}
  ): Promise<any> {
    return await api.get('/admin/applications/feature/list', { params });
  }

  async createApplication(applicationData: any): Promise<Application> {
    const result = await api.post('/admin/applications', applicationData);
    notificationService.success('应用创建成功');
    return result;
  }

  async updateApplication(appId: string, applicationData: any): Promise<Application> {
    const result = await api.put(`/admin/applications/${appId}`, applicationData);
    notificationService.success('应用更新成功');
    return result;
  }

  async deleteApplication(appId: string): Promise<any> {
    const result = await api.delete(`/admin/applications/${appId}`);
    notificationService.success('应用删除成功');
    return result;
  }

  async createApplicationScreenshot(appId: string, screenshotData: any): Promise<any> {
    const result = await api.post(`/admin/applications/${appId}/screenshot`, screenshotData);
    notificationService.success('应用截图创建成功');
    return result;
  }

  // 应用推荐功能
  async featureApplication(appId: string): Promise<any> {
    const result = await api.post(`/admin/applications/${appId}/feature?feature=feature`, {});
    notificationService.success('应用已设为推荐');
    return result;
  }

  async unfeatureApplication(appId: string): Promise<any> {
    const result = await api.post(`/admin/applications/${appId}/feature?feature=unfeature`, {});
    notificationService.success('应用已取消推荐');
    return result;
  }

  // 分类管理
  async getCategories(): Promise<Category[]> {
    return await api.get('/admin/categories/list');
  }

  async createCategory(categoryData: any): Promise<Category> {
    const result = await api.post('/admin/categories', categoryData);
    notificationService.success('分类创建成功');
    return result;
  }

  async updateCategory(categoryId: string, categoryData: any): Promise<Category> {
    const result = await api.put(`/admin/categories/${categoryId}`, categoryData);
    notificationService.success('分类更新成功');
    return result;
  }

  async deleteCategory(categoryId: string): Promise<any> {
    const result = await api.delete(`/admin/categories/${categoryId}`);
    notificationService.success('分类删除成功');
    return result;
  }

  // 文件上传
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const uploadService = await import('./upload.service');
    return uploadService.default.uploadFile(file, onProgress);
  }
}

export default new AdminService();
