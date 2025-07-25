import api from './api';
import { Application } from './application-store.service';

export class Robot {
  constructor(
    public id: string,
    public name: string,
    public model: string,
    public ownerId: string,
    public status: 'online' | 'offline' | 'maintenance',
    public lastSeen: Date
  ) {}
}

class RobotService {
  async getRobots(): Promise<Robot[]> {
    return await api.get('/robots');
  }

  async getRobotById(robotId: string): Promise<Robot> {
    return await api.get(`/robots/${robotId}`);
  }

  async getRobotApps(robotId: string): Promise<Application[]> {
    return await api.get(`/robots/${robotId}/apps`);
  }

  async removeApp(robotId: string, appId: string): Promise<any> {
    return await api.delete(`/robots/${robotId}/apps/${appId}`);
  }

  async updateRobot(robotId: string, robotData: Partial<Robot>): Promise<Robot> {
    return await api.put(`/robots/${robotId}`, robotData);
  }
}

export default new RobotService();
