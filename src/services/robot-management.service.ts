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
    notificationService.success('机器人添加成功');
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
    notificationService.success('机器人删除成功');
    return result;
  }

  async installRobotApp(robotId: string, appId: string): Promise<any> {
    const result = await api.put(`/robots/install_app/${robotId}/${appId}`, {});
    notificationService.success('应用安装成功');
    return result;
  }

  async runRobotApp(robotId: string, appId: string): Promise<any> {
    const result = await api.put(`/robots/run_app/${robotId}/${appId}`, {});
    notificationService.success('应用运行成功');
    return result;
  }

  async updateRobot(robotId: string, robotData: Partial<Robot>): Promise<Robot> {
    const result = await api.put(`/robots/update/${robotId}`, robotData);
    notificationService.success('机器人更新成功');
    return result;
  }

  // 文件上传
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const uploadService = await import('./upload.service');
    return uploadService.default.uploadFile(file, onProgress);
  }
}

export default new RobotManagementService();
