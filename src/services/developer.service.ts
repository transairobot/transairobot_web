import api from './api';
import notificationService from './notification.service';
import { PagedResult } from './admin.service';
import { Application, Review } from './application-store.service';

// Data structure classes
export class DeveloperProfile {
  constructor(
    public id: string,
    public userId: string,
    public companyName: string,
    public website: string,
    public country: string,
    public status: 'unverified' | 'pending' | 'verified' | 'rejected'
  ) {}
}

export class DeveloperApplication {
  constructor(
    public id: string,
    public appName: string,
    public appDescription: string,
    public status: 'draft' | 'in_review' | 'approved' | 'rejected',
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

export class ApplicationAnalytics {
  constructor(
    public totalInstalls: number,
    public activeUsers: number,
    public revenue: number,
    public ratings: {
      average: number;
      count: number;
    }
  ) {}
}

export class Payout {
  constructor(
    public id: string,
    public amount: number,
    public currency: string,
    public status: 'pending' | 'completed' | 'failed',
    public payoutDate: Date
  ) {}
}

export class PayoutSettings {
  constructor(public payoutMethod: 'paypal' | 'stripe', public payoutEmail: string) {}
}

class DeveloperService {
  async applyForDeveloperStatus(developerData: any): Promise<any> {
    const result = await api.post('/developers/apply', developerData);
    notificationService.success('Developer application submitted successfully');
    return result;
  }

  async getDeveloperProfile(): Promise<DeveloperProfile> {
    return await api.get('/developers/profile');
  }

  async updateDeveloperProfile(profileData: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
    const result = await api.put('/developers/profile', profileData);
    notificationService.success('Developer profile updated successfully');
    return result;
  }

  async getDeveloperApplications(
    filters: any = {},
    page = 1,
    limit = 10
  ): Promise<PagedResult<DeveloperApplication>> {
    const params = {
      page,
      limit,
      ...filters
    };
    return await api.get('/developers/applications', { params });
  }

  async submitApplication(applicationData: any): Promise<DeveloperApplication> {
    const result = await api.post('/developers/applications', applicationData);
    notificationService.success('Application submitted successfully');
    return result;
  }

  async updateApplication(
    applicationId: string,
    applicationData: Partial<Application>
  ): Promise<Application> {
    const result = await api.put(`/developers/applications/${applicationId}`, applicationData);
    notificationService.success('Application updated successfully');
    return result;
  }

  async deleteApplication(applicationId: string): Promise<any> {
    const result = await api.delete(`/developers/applications/${applicationId}`);
    notificationService.success('Application deleted successfully');
    return result;
  }

  async submitApplicationForReview(applicationId: string): Promise<any> {
    const result = await api.post(`/developers/applications/${applicationId}/submit`, {});
    notificationService.success('Application submitted for review');
    return result;
  }

  async uploadApplicationIcon(
    applicationId: string,
    formData: FormData,
    onProgress?: (progressEvent: any) => void
  ): Promise<any> {
    const result = await api.uploadFiles(
      `/developers/applications/${applicationId}/icon`,
      formData,
      { onProgress }
    );
    notificationService.success('Application icon uploaded successfully');
    return result;
  }

  async uploadApplicationScreenshots(
    applicationId: string,
    formData: FormData,
    onProgress?: (progressEvent: any) => void
  ): Promise<any> {
    const result = await api.uploadFiles(
      `/developers/applications/${applicationId}/screenshots`,
      formData,
      { onProgress }
    );
    notificationService.success('Screenshots uploaded successfully');
    return result;
  }

  async deleteApplicationScreenshot(applicationId: string, screenshotId: string): Promise<any> {
    const result = await api.delete(
      `/developers/applications/${applicationId}/screenshots/${screenshotId}`
    );
    notificationService.success('Screenshot deleted successfully');
    return result;
  }

  async getApplicationAnalytics(
    applicationId: string,
    timeRange: any = {}
  ): Promise<ApplicationAnalytics> {
    const params = { ...timeRange };
    return await api.get(`/developers/applications/${applicationId}/analytics`, { params });
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
    return await api.get(`/developers/applications/${applicationId}/reviews`, { params });
  }

  async respondToReview(applicationId: string, reviewId: string, response: string): Promise<any> {
    const result = await api.post(
      `/developers/applications/${applicationId}/reviews/${reviewId}/respond`,
      { response }
    );
    notificationService.success('Response submitted successfully');
    return result;
  }

  async getDeveloperEarnings(timeRange: any = {}): Promise<any> {
    const params = { ...timeRange };
    return await api.get('/developers/earnings', { params });
  }

  async getDeveloperPayouts(page = 1, limit = 10): Promise<PagedResult<Payout>> {
    const params = {
      page,
      limit
    };
    return await api.get('/developers/payouts', { params });
  }

  async updatePayoutSettings(payoutSettings: PayoutSettings): Promise<PayoutSettings> {
    const result = await api.put('/developers/payout-settings', payoutSettings);
    notificationService.success('Payout settings updated successfully');
    return result;
  }
}

export default new DeveloperService();
