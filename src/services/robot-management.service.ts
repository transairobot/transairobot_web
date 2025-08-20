import api from './api';
import notificationService from './notification.service';
import { Application } from './application-store.service';

// Data structure classes
export class Robot {
  constructor(
    public id: string,
    public name: string,
    public model: string,
    public robot_type: string,
    public owner_id: string,
    public connection_status: 'online' | 'offline' | 'maintenance',
    public last_seen: Date,
    public installed_apps: Application[] = []
  ) {}
  toString(): string {
    return `Robot(id=${this.id}, name=${this.name}, model=${this.model}, owner_id=${this.owner_id}, connection_status=${this.connection_status}, last_seen=${this.last_seen})`;
  }
}

class RobotManagementService {
  async addRobot(bindCode: string): Promise<Robot> {
    const result = await api.post(`/robots/add_robot/${bindCode}`, {});
    notificationService.success('Robot added successfully');
    return result;
  }

  async getRobots(): Promise<Array<Robot>> {
    return await api.get('/robots/list');
  }

  async getRobotDetails(robotId: string): Promise<Robot> {
    return await api.get(`/robots/${robotId}`);
  }

  async removeRobot(robotId: string): Promise<any> {
    const result = await api.delete(`/robots/remove/${robotId}`);
    notificationService.success('Robot removed successfully');
    return result;
  }

  async installRobotApp(robotId: string, appId: string): Promise<any> {
    const result = await api.put(`/robots/install_app/${robotId}/${appId}`, {});
    notificationService.success('Application installed successfully');
    return result;
  }

  async runRobotApp(robotId: string, appId: string): Promise<any> {
    const result = await api.put(`/robots/run_app/${robotId}/${appId}`, {});
    notificationService.success('Application started successfully');
    return result;
  }

  async updateRobot(robotId: string, robotData: Partial<Robot>): Promise<Robot> {
    const result = await api.put(`/robots/update/${robotId}`, robotData);
    notificationService.success('Robot updated successfully');
    return result;
  }

  // 文件上传
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const uploadService = await import('./upload.service');
    return uploadService.default.uploadFile(file, onProgress);
  }
}

export default new RobotManagementService();
