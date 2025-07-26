import api from './api';
import notificationService from './notification.service';

// Data structure classes
export class PagedResult<T> {
  constructor(public data: T[], public total: number, public page: number, public limit: number) {}
}

export class DeveloperApplication {
  constructor(
    public id: string,
    public developerId: string,
    public appName: string,
    public status: 'pending' | 'approved' | 'rejected',
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

export class ApplicationSubmission {
  constructor(
    public id: string,
    public appId: string,
    public appName: string,
    public version: string,
    public status: 'pending' | 'approved' | 'rejected',
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

export class User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public verify_code: string,
    public role: 'user' | 'developer' | 'admin',
    public isDisabled: boolean,
    public createdAt: Date
  ) {}
}

export class SystemAnalytics {
  constructor(
    public totalUsers: number,
    public totalApplications: number,
    public totalRobots: number,
    public totalRevenue: number
  ) {}
}

export class TimeSeriesData {
  constructor(public date: Date, public value: number) {}
}

export class Log {
  constructor(
    public id: string,
    public level: string,
    public message: string,
    public timestamp: Date
  ) {}
}

export class SystemSettings {
  constructor(public settingKey: string, public settingValue: any) {}
}

class AdminService {
  async getPendingDeveloperApplications(
    filters: any = {},
    page = 1,
    limit = 10
  ): Promise<PagedResult<DeveloperApplication>> {
    const params = {
      page,
      limit,
      status: 'pending',
      ...filters
    };
    return await api.get('/admin/developer-applications', { params });
  }

  async approveDeveloperApplication(applicationId: string, approvalData: any = {}): Promise<any> {
    const result = await api.post(
      `/admin/developer-applications/${applicationId}/approve`,
      approvalData
    );
    notificationService.success('Developer application approved successfully');
    return result;
  }

  async rejectDeveloperApplication(
    applicationId: string,
    rejectionData: { reason: string }
  ): Promise<any> {
    const result = await api.post(
      `/admin/developer-applications/${applicationId}/reject`,
      rejectionData
    );
    notificationService.success('Developer application rejected');
    return result;
  }

  async getPendingApplicationSubmissions(
    filters: any = {},
    page = 1,
    limit = 10
  ): Promise<PagedResult<ApplicationSubmission>> {
    const params = {
      page,
      limit,
      status: 'pending',
      ...filters
    };
    return await api.get('/admin/application-submissions', { params });
  }

  async getApplicationSubmissionDetails(submissionId: string): Promise<ApplicationSubmission> {
    return await api.get(`/admin/application-submissions/${submissionId}`);
  }

  async approveApplicationSubmission(submissionId: string, approvalData: any = {}): Promise<any> {
    const result = await api.post(
      `/admin/application-submissions/${submissionId}/approve`,
      approvalData
    );
    notificationService.success('Application submission approved successfully');
    return result;
  }

  async rejectApplicationSubmission(
    submissionId: string,
    rejectionData: { reason: string }
  ): Promise<any> {
    const result = await api.post(
      `/admin/application-submissions/${submissionId}/reject`,
      rejectionData
    );
    notificationService.success('Application submission rejected');
    return result;
  }

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
    notificationService.success('User updated successfully');
    return result;
  }

  async disableUser(userId: string, disableData: { reason: string }): Promise<any> {
    const result = await api.post(`/admin/users/${userId}/disable`, disableData);
    notificationService.success('User disabled successfully');
    return result;
  }

  async enableUser(userId: string): Promise<any> {
    const result = await api.post(`/admin/users/${userId}/enable`, {});
    notificationService.success('User enabled successfully');
    return result;
  }

  async getSystemAnalytics(timeRange: any = {}): Promise<SystemAnalytics> {
    const params = { ...timeRange };
    return await api.get('/admin/analytics/system', { params });
  }

  async getUserAnalytics(timeRange: any = {}): Promise<TimeSeriesData[]> {
    const params = { ...timeRange };
    return await api.get('/admin/analytics/users', { params });
  }

  async getApplicationAnalytics(timeRange: any = {}): Promise<TimeSeriesData[]> {
    const params = { ...timeRange };
    return await api.get('/admin/analytics/applications', { params });
  }

  async getRobotAnalytics(timeRange: any = {}): Promise<TimeSeriesData[]> {
    const params = { ...timeRange };
    return await api.get('/admin/analytics/robots', { params });
  }

  async getRevenueAnalytics(timeRange: any = {}): Promise<TimeSeriesData[]> {
    const params = { ...timeRange };
    return await api.get('/admin/analytics/revenue', { params });
  }

  async getSystemLogs(filters: any = {}, page = 1, limit = 100): Promise<PagedResult<Log>> {
    const params = {
      page,
      limit,
      ...filters
    };
    return await api.get('/admin/logs/system', { params });
  }

  async getAuditLogs(filters: any = {}, page = 1, limit = 100): Promise<PagedResult<Log>> {
    const params = {
      page,
      limit,
      ...filters
    };
    return await api.get('/admin/logs/audit', { params });
  }

  async getSystemSettings(): Promise<SystemSettings[]> {
    return await api.get('/admin/settings');
  }

  async updateSystemSettings(settings: SystemSettings[]): Promise<SystemSettings[]> {
    const result = await api.put('/admin/settings', settings);
    notificationService.success('System settings updated successfully');
    return result;
  }
}

export default new AdminService();
