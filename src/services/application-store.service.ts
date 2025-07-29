import api from './api';
import notificationService from './notification.service';
import { PagedResult } from './admin.service';

// Data structure classes
export class Application {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public developerId: string,
    public category: string,
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

export class Tag {
  constructor(public id: string, public name: string) {}
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

export class Installation {
  constructor(
    public id: string,
    public applicationId: string,
    public robotId: string,
    public status: 'installing' | 'installed' | 'failed' | 'uninstalling'
  ) {}
}

class ApplicationStoreService {
  async getApplications(filters: any = {}, page = 1, limit = 10): Promise<Array<Application>> {
    const params = {
      page,
      limit,
      ...filters
    };
    const apps = await api.get('/applications/list', { params });
    console.log(apps.toString());
    return apps;
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

  async getTags(): Promise<Tag[]> {
    return await api.get('/applications/tags');
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

  async submitReview(
    applicationId: string,
    reviewData: { rating: number; comment: string }
  ): Promise<Review> {
    const result = await api.post(`/applications/${applicationId}/reviews`, reviewData);
    notificationService.success('Review submitted successfully');
    return result;
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

  async installApplication(applicationId: string, robotId: string): Promise<Installation> {
    const result = await api.post('/installations/install', { applicationId, robotId });
    notificationService.success('Application installation initiated');
    return result;
  }

  async uninstallApplication(applicationId: string, robotId: string): Promise<any> {
    const result = await api.post('/installations/uninstall', { applicationId, robotId });
    notificationService.success('Application uninstallation initiated');
    return result;
  }

  async getInstallationStatus(installationId: string): Promise<Installation> {
    return await api.get(`/installations/${installationId}/status`);
  }

  async getInstalledApplications(robotId: string): Promise<Application[]> {
    return await api.get(`/robots/${robotId}/applications`);
  }
}

export default new ApplicationStoreService();
