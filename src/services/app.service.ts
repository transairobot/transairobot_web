import api from './api';

export class App {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public version: string,
    public developer: string,
    public icon: string,
    public featured: boolean,
    public category: string,
    public rating: number,
    public releaseDate: Date
  ) {}
}

class AppService {
  async getApps(filters: any = {}): Promise<App[]> {
    const queryParams = new URLSearchParams(filters).toString();
    return await api.get(`/apps?${queryParams}`);
  }

  async getFeaturedApps(): Promise<App[]> {
    return await api.get('/apps/featured');
  }

  async getAppById(appId: string): Promise<App> {
    return await api.get(`/apps/${appId}`);
  }

  async installApp(robotId: string, appId: string): Promise<any> {
    return await api.post(`/robots/${robotId}/apps`, { appId });
  }

  async searchApps(query: string): Promise<App[]> {
    return await api.get(`/apps/search?q=${encodeURIComponent(query)}`);
  }
}

export default new AppService();
