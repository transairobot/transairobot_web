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

class ApplicationStoreService {
  async getApplications(filters: any = {}, page = 1, limit = 10): Promise<Array<Application>> {
    const params = {
      page,
      limit,
      ...filters
    };
    return await api.get('/applications/list', { params });
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
    return await api.get('/applications/search', { params });
  }

  async getCategories(): Promise<Category[]> {
    return await api.get('/applications/categories');
  }

  async getApplicationDetails(applicationId: string): Promise<Application> {
    return await api.get(`/applications/${applicationId}`);
  }

  async getApplicationReviews(
    applicationId: string,
    page = 1,
    limit = 10
  ): Promise<PagedResult<Review>> {
    const params = {
      page,
      limit
    };
    return await api.get(`/applications/${applicationId}/reviews`, { params });
  }

  async getApplicationScreenshots(applicationId: string): Promise<Screenshot[]> {
    return await api.get(`/applications/${applicationId}/screenshots`);
  }

  async getFeaturedApplications(limit = 5): Promise<Application[]> {
    const params = { limit };
    return await api.get('/applications/featured', { params });
  }

  async getPopularApplications(limit = 5): Promise<Application[]> {
    const params = { limit };
    return await api.get('/applications/popular', { params });
  }

  async getNewApplications(limit = 5): Promise<Application[]> {
    const params = { limit };
    return await api.get('/applications/new', { params });
  }

  // 文件上传
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const uploadService = await import('./upload.service');
    return uploadService.default.uploadFile(file, onProgress);
  }
}

export default new ApplicationStoreService();
